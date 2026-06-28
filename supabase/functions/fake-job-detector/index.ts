import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const FAKE_JOB_SYSTEM_PROMPT = `You are a job scam detector for Pakistan Naujawan Party (PNP) platform.

Your job is to analyze job postings and detect if they are scams targeting Pakistani youth.

COMMON PAKISTANI JOB SCAMS TO DETECT:
- Salary too good to be true (e.g. 100,000+ PKR for no experience)
- Vague company name or no company mentioned
- Asking for money upfront (registration fee, training fee, security deposit)
- Suspicious contact (personal WhatsApp only, Gmail instead of company email)
- No clear job description or responsibilities
- Work from home with unrealistic income claims
- Pyramid scheme or MLM patterns
- Fake foreign job offers
- No office address mentioned
- Urgency pressure tactics ("apply in 24 hours or lose opportunity")

RESPONSE FORMAT:
Respond in this exact JSON format only, no extra text:
{
  "scamScore": 0.0,
  "flags": ["flag1", "flag2"],
  "decision": "approve|review|reject",
  "reason": "brief explanation in English"
}

DECISION RULES:
- scamScore 0.0 to 0.39 → decision: "approve"
- scamScore 0.40 to 0.69 → decision: "review"
- scamScore 0.70 to 1.0 → decision: "reject"

scamScore must be a number between 0.0 and 1.0`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { jobData, jobId } = await req.json();

    // Validate input
    if (!jobData || !jobId) {
      return new Response(
        JSON.stringify({ error: "jobData and jobId are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { title, company, description, salary, contact } = jobData;

    // Call Groq API
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 500,
        temperature: 0.1,
        messages: [
          { role: "system", content: FAKE_JOB_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Analyze this job posting for scam signals:

Job Title: ${title || "Not provided"}
Company: ${company || "Not provided"}
Description: ${description || "Not provided"}
Salary: ${salary || "Not provided"}
Contact: ${contact || "Not provided"}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Groq API error:", error);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse JSON response
    let parsed;
    try {
      const clean = aiResponse.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch (e) {
      console.error("Failed to parse AI response:", aiResponse);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { scamScore, flags, decision, reason } = parsed;

    // Update job in database
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

    const { error: dbError } = await supabase
      .from("jobs")
      .update({
        ai_scam_score: scamScore,
        ai_scam_flags: flags,
        is_verified: decision === "approve"
      })
      .eq("id", jobId);

    if (dbError) {
      console.error("DB error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to update job" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log for human review if needed
    if (decision === "review") {
      console.log(`JOB NEEDS REVIEW: jobId=${jobId}, score=${scamScore}, flags=${flags}`);
    }

    if (decision === "reject") {
      console.log(`JOB REJECTED: jobId=${jobId}, score=${scamScore}, reason=${reason}`);
    }

    return new Response(
      JSON.stringify({ scamScore, flags, decision, reason }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );

  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});