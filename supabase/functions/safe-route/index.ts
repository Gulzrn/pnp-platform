import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const SAFE_ROUTE_SYSTEM_PROMPT = `You are a women safety assistant for Pakistan Naujawan Party (PNP) Mahfooz portal.

YOUR JOB:
Based on the start location, end location, time of day, and any harassment reports in the area,
suggest the safest route and safety tips for women in Pakistan.

PAKISTANI SAFETY CONTEXT:
- Busy main roads are generally safer than narrow streets (galiyan)
- Daytime is safer than nighttime
- Markets and commercial areas have more people = safer
- Areas near police stations are safer
- Well-lit roads are safer at night
- Public transport stops are generally safe during day
- Avoid isolated areas especially after sunset

SAFETY TIPS FOR PAKISTAN:
- Travel with someone when possible
- Keep phone charged and emergency contacts ready
- Use rickshaw/taxi apps (InDrive, Careem) instead of random transport
- Share live location with trusted contact
- Trust your instincts — if area feels unsafe, leave
- Emergency number: 1242 (Women's helpline Pakistan)
- Police: 15
- Rescue: 1122

RESPONSE FORMAT:
Respond in this exact JSON format only, no extra text:
{
  "safetyScore": 7,
  "routeAdvice": "route advice in Urdu",
  "warnings": ["warning 1 in Urdu", "warning 2 in Urdu"],
  "safetyTips": ["tip 1 in Urdu", "tip 2 in Urdu"],
  "emergencyNumbers": ["1242 - خواتین ہیلپ لائن", "15 - پولیس", "1122 - ریسکیو"],
  "bestTimeToTravel": "advice about best time in Urdu"
}

safetyScore must be a number between 1 and 10 (10 = very safe, 1 = very unsafe).`;

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
    const { startLocation, endLocation, timeOfDay, city, userId } = await req.json();

    // Validate input
    if (!startLocation || !endLocation || !userId) {
      return new Response(
        JSON.stringify({ error: "startLocation, endLocation and userId are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get harassment reports from database for context
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

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
          { role: "system", content: SAFE_ROUTE_SYSTEM_PROMPT },
          {
            role: "user",
            content: `A woman in Pakistan needs safety advice for her route:

City: ${city || "not specified"}
Starting from: ${startLocation}
Going to: ${endLocation}
Time of travel: ${timeOfDay || "not specified"}

Please provide safety score, route advice and safety tips in Urdu.`
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
      safetyScore,
      routeAdvice,
      warnings,
      safetyTips,
      emergencyNumbers,
      bestTimeToTravel
    } = parsed;

    return new Response(
      JSON.stringify({
        safetyScore,
        routeAdvice,
        warnings,
        safetyTips,
        emergencyNumbers,
        bestTimeToTravel
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
