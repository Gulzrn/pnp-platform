import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const IDEA_SYSTEM_PROMPT = `You are an idea evaluator for Pakistan Naujawan Party (PNP) platform.

YOUR JOB:
Evaluate reform ideas submitted by Pakistani youth and score them on 4 dimensions.

SCORING DIMENSIONS (each out of 10):
1. Clarity (وضاحت): Is the idea clearly explained? Can anyone understand it?
2. Feasibility (قابل عمل): Can this actually be done in Pakistan given current resources?
3. Originality (اصالت): Is this a genuinely new idea or already being done?
4. Impact (اثر): How many Pakistanis will benefit from this idea?

PAKISTANI CONTEXT TO CONSIDER:
- Pakistan's budget constraints and government capacity
- Rural vs urban divide
- Existing government programs (Ehsaas, BISP, etc.)
- Political and social realities of Pakistan
- Youth population and their needs

FEEDBACK RULES:
- Give feedback in simple Urdu that youth can understand
- Be encouraging and constructive
- Suggest specific improvements
- overall quality score = average of all 4 dimensions

RESPONSE FORMAT:
Respond in this exact JSON format only, no extra text:
{
  "clarity": 7,
  "feasibility": 6,
  "originality": 8,
  "impact": 9,
  "qualityScore": 7.5,
  "feedback": "overall feedback in Urdu",
  "improvements": [
    "specific improvement 1 in Urdu",
    "specific improvement 2 in Urdu"
  ],
  "status": "approved|rejected"
}

STATUS RULES:
- qualityScore >= 5.0 → status: "approved"
- qualityScore < 5.0 → status: "rejected"

All scores must be numbers between 0 and 10.`;

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
    const { title, description, category, userId, ideaId } = await req.json();

    // Validate input
    if (!title || !description || !userId || !ideaId) {
      return new Response(
        JSON.stringify({ error: "title, description, userId and ideaId are required" }),
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
        max_tokens: 1000,
        temperature: 0.3,
        messages: [
          { role: "system", content: IDEA_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Evaluate this reform idea submitted by a Pakistani youth:

Title: ${title}
Category: ${category || "General"}
Description: ${description}

Please score and provide feedback.`
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

    const {
      clarity,
      feasibility,
      originality,
      impact,
      qualityScore,
      feedback,
      improvements,
      status
    } = parsed;

    // Save to database
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

    const { error: dbError } = await supabase
      .from("ideas")
      .update({
        ai_clarity: clarity,
        ai_feasibility: feasibility,
        ai_originality: originality,
        ai_impact: impact,
        ai_quality_score: qualityScore,
        ai_feedback: feedback,
        status: status
      })
      .eq("id", ideaId);

    if (dbError) {
      console.error("DB error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save idea analysis" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        clarity,
        feasibility,
        originality,
        impact,
        qualityScore,
        feedback,
        improvements,
        status
      }),
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
