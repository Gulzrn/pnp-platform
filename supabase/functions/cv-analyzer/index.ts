import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const CV_SYSTEM_PROMPT = `You are an expert CV reviewer for Pakistan Naujawan Party (PNP) platform helping Pakistani youth improve their CVs.

YOUR JOB:
Analyze the CV text provided and give a score and detailed feedback in Urdu.

SCORING CRITERIA (total 100 points):
- Structure & Format (20 points): Is it well organized? Clear sections?
- Contact Information (10 points): Name, phone, email, city present?
- Education (20 points): Clearly mentioned with dates and grades?
- Work Experience (20 points): Relevant experience with responsibilities?
- Skills (15 points): Relevant skills listed clearly?
- Achievements (15 points): Any measurable achievements mentioned?

FEEDBACK RULES:
- Give feedback in simple Urdu that a young Pakistani can understand
- Be encouraging but honest
- Give specific actionable suggestions
- Focus on what Pakistani employers look for

RESPONSE FORMAT:
Respond in this exact JSON format only, no extra text:
{
  "score": 75,
  "feedback": "overall feedback paragraph in Urdu",
  "suggestions": [
    "specific suggestion 1 in Urdu",
    "specific suggestion 2 in Urdu",
    "specific suggestion 3 in Urdu"
  ],
  "strengths": [
    "strength 1 in Urdu",
    "strength 2 in Urdu"
  ]
}

score must be a number between 0 and 100.`;

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
    const { cvText, userId } = await req.json();

    // Validate input
    if (!cvText || !userId) {
      return new Response(
        JSON.stringify({ error: "cvText and userId are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call Groq API
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1500,
        temperature: 0.3,
        messages: [
          { role: "system", content: CV_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Please analyze this CV and provide score and feedback:

${cvText}`
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

    const { score, feedback, suggestions, strengths } = parsed;

    // Save to database
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

    const { error: dbError } = await supabase
      .from("cvs")
      .upsert({
        user_id: userId,
        ai_score: score,
        ai_feedback: feedback,
        ai_suggestions: suggestions,
        updated_at: new Date().toISOString()
      });

    if (dbError) {
      console.error("DB error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save CV analysis" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ score, feedback, suggestions, strengths }),
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