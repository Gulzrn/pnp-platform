import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const CROP_DISEASE_SYSTEM_PROMPT = `You are an expert agricultural scientist for Pakistan Naujawan Party (PNP) platform helping Pakistani farmers.

YOUR JOB:
Analyze the crop disease description provided by a farmer and give diagnosis and treatment in simple Urdu.

PAKISTANI CROPS YOU KNOW:
- Wheat (گندم) - most common crop
- Rice (چاول) - Punjab and Sindh
- Cotton (کپاس) - Punjab and Sindh
- Sugarcane (گنا) - Punjab
- Maize (مکئی) - KPK and Punjab
- Vegetables - tomato, onion, potato, chili

COMMON PAKISTANI CROP DISEASES:
Wheat: rust (زنگ), smut (کانگیاری), aphids (تیلا)
Rice: blast (جھلساؤ), brown spot, stem borer
Cotton: whitefly (سفید مکھی), pink bollworm, leaf curl virus
Sugarcane: red rot, smut, pyrilla
Maize: stem borer, fall armyworm, leaf blight

TREATMENT GUIDELINES:
- Recommend locally available pesticides in Pakistan
- Mention brand names available in Pakistani markets
- Give organic/natural alternatives where possible
- Always mention safety precautions
- Recommend consulting local agriculture department if severe

RESPONSE FORMAT:
Respond in this exact JSON format only, no extra text:
{
  "disease": "disease name in Urdu",
  "cause": "cause of disease in Urdu",
  "severity": "low|medium|high",
  "treatment": "step by step treatment in Urdu",
  "prevention": "prevention tips for next season in Urdu",
  "medicines": ["medicine 1 available in Pakistan", "medicine 2"],
  "urgency": "immediate|within week|can wait"
}`;

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
    const { cropType, symptoms, district, userId } = await req.json();

    // Validate input
    if (!cropType || !symptoms || !userId) {
      return new Response(
        JSON.stringify({ error: "cropType, symptoms and userId are required" }),
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
        temperature: 0.2,
        messages: [
          { role: "system", content: CROP_DISEASE_SYSTEM_PROMPT },
          {
            role: "user",
            content: `A Pakistani farmer needs help with their crop:

Crop Type: ${cropType}
District: ${district || "not specified"}
Symptoms described by farmer: ${symptoms}

Please diagnose the disease and provide treatment in Urdu.`
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

    const { disease, cause, severity, treatment, prevention, medicines, urgency } = parsed;

    // Save to database
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

    const { error: dbError } = await supabase
      .from("crop_reports")
      .insert({
        user_id: userId,
        crop_type: cropType,
        photo_url: "text-based-diagnosis",
        ai_disease: disease,
        ai_cause: cause,
        ai_treatment: treatment,
        ai_prevention: prevention,
        district: district || null
      });

    if (dbError) {
      console.error("DB error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save crop report" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ disease, cause, severity, treatment, prevention, medicines, urgency }),
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