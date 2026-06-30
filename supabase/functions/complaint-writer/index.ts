import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const COMPLAINT_SYSTEM_PROMPT = `You are an expert Pakistani complaint letter writer working for PNP (Pakistan Naujawan Party).

YOUR JOB:
Convert a citizen's casual Urdu/English complaint into a formal official complaint letter in Urdu.
Also identify the correct government department and urgency level.

PAKISTANI GOVERNMENT DEPARTMENTS:
- Water issues → WASA (Water and Sanitation Agency)
- Electricity issues → NEPRA / LESCO / IESCO / PESCO / QESCO (based on region)
- Gas issues → SSGC (Sui Southern) or SNGPL (Sui Northern)
- Road issues → Works and Services Department / NHA
- Sewage issues → WASA
- Street lights → Municipal Committee / Metropolitan Corporation
- Hospital issues → Health Department
- School issues → Education Department
- Police issues → IGP Office / DPO Office
- Property issues → Patwari / Revenue Department

URGENCY LEVELS:
- critical: missing person, gas leak, medical emergency, fire, flood
- high: no water for 3+ days, hospital without doctor, dangerous road
- medium: electricity outage, road damage, sewage overflow
- low: pothole, street light, noise complaint

RESPONSE FORMAT:
You must respond in this exact JSON format only, no extra text:
{
  "formalLetter": "formal complaint letter in Urdu here",
  "department": "department name",
  "urgency": "critical|high|medium|low"
}

FORMAL LETTER FORMAT IN URDU:
- Start with: بسم اللہ الرحمن الرحیم
- Address to the correct department head
- Mention the specific problem clearly
- Mention location (district/area)
- Request immediate action
- End with: آپ کا مخلص، [شہری]
- Keep it professional but simple`;

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
    const { rawText, category, district, userId } = await req.json();

    // Validate input
    if (!rawText || !category || !userId) {
      return new Response(
        JSON.stringify({ error: "rawText, category and userId are required" }),
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
          { role: "system", content: COMPLAINT_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Complaint category: ${category}
District: ${district || "not specified"}
Citizen's complaint: ${rawText}

Convert this to a formal complaint letter and identify the department and urgency.`
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

    // Parse JSON response from AI
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

    const { formalLetter, department, urgency } = parsed;

    // Save to database
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

    const { error: dbError } = await supabase
      .from("complaints")
      .insert({
        user_id: userId,
        category,
        description_raw: rawText,
        description_formal: formalLetter,
        department,
        urgency,
        district: district || null,
        status: "open"
      });

    if (dbError) {
      console.error("DB error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save complaint" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // If critical — log alert (in production this sends notification to moderators)
    if (urgency === "critical") {
      console.log(`CRITICAL COMPLAINT from user ${userId} in ${district}`);
    }

    return new Response(
      JSON.stringify({ formalLetter, department, urgency }),
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
