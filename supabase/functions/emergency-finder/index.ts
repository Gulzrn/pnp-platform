import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const EMERGENCY_SYSTEM_PROMPT = `You are an emergency response assistant for Pakistan Naujawan Party (PNP) Emergency Network portal.

YOUR JOB:
Help people find emergency resources in Pakistan as fast as possible.
This is a life-saving service — be fast, clear, and direct.

PAKISTAN EMERGENCY NUMBERS:
- Police: 15
- Rescue/Ambulance: 1122 (Punjab), 115 (Sindh/Karachi), 112 (general)
- Fire Brigade: 16
- Women Helpline: 1242
- Child Protection: 1121
- Edhi Foundation: 115
- Chhipa Welfare: 1020 (Karachi)
- Aman Foundation: 021-111-AMAN (Karachi)
- Pakistan Red Crescent: 051-9261373

BLOOD DONATION:
- Edhi Blood Bank: 021-32470928
- Fatimid Foundation: 021-34386001 (Karachi)
- Sundas Foundation: 042-35761999 (Lahore)
- Shaukat Khanum: 042-35945100

RESPONSE FORMAT:
Respond in this exact JSON format only, no extra text:
{
  "immediateAction": "what to do RIGHT NOW in Urdu",
  "emergencyNumbers": [
    {"name": "service name", "number": "number", "available": "24/7 or hours"}
  ],
  "nearbyResources": "advice on finding nearest resource in Urdu",
  "instructions": ["step 1 in Urdu", "step 2 in Urdu", "step 3 in Urdu"],
  "doNotDo": ["what NOT to do in this emergency in Urdu"],
  "followUp": "what to do after immediate emergency in Urdu"
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
    const { emergencyType, city, bloodGroup, userId } = await req.json();

    // Validate input
    if (!emergencyType || !userId) {
      return new Response(
        JSON.stringify({ error: "emergencyType and userId are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // If blood request — search database first
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);
    let bloodDonors = [];

    if (emergencyType === "blood" && bloodGroup && city) {
      const { data: donors } = await supabase
        .from("blood_donors")
        .select("blood_group, city, contact_phone")
        .eq("blood_group", bloodGroup)
        .eq("city", city)
        .eq("is_available", true)
        .limit(5);

      bloodDonors = donors || [];
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
        temperature: 0.1,
        messages: [
          { role: "system", content: EMERGENCY_SYSTEM_PROMPT },
          {
            role: "user",
            content: `EMERGENCY REQUEST:

Type: ${emergencyType}
City: ${city || "not specified"}
${bloodGroup ? `Blood Group Needed: ${bloodGroup}` : ""}
${bloodDonors.length > 0 ? `Available donors found in database: ${bloodDonors.length}` : ""}

Please provide immediate help in Urdu.`
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
      immediateAction,
      emergencyNumbers,
      nearbyResources,
      instructions,
      doNotDo,
      followUp
    } = parsed;

    return new Response(
      JSON.stringify({
        immediateAction,
        emergencyNumbers,
        nearbyResources,
        instructions,
        doNotDo,
        followUp,
        bloodDonors
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