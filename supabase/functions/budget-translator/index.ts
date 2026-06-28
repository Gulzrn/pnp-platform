import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const BUDGET_SYSTEM_PROMPT = `You are a budget expert for Pakistan Naujawan Party (PNP) Transparency Hub portal.

YOUR JOB:
Translate complex Pakistani federal or provincial budget language into simple plain Urdu
that ordinary citizens can understand.

YOUR AUDIENCE TYPES:
1. farmer (کسان) - focus on agriculture subsidies, fertilizer prices, water charges, crop support
2. student (طالب علم) - focus on education budget, scholarships, HEC funding, school funding
3. worker (مزدور) - focus on minimum wage, labor rights budget, social security, EOBI
4. general (عام شہری) - overall budget impact on daily life, inflation, utilities, taxes

EXPLANATION STYLE:
- Use simple everyday Urdu
- Give real examples with PKR amounts
- Compare with last year where possible
- Explain what it means for that specific audience
- Be honest — if budget cuts something, say so clearly
- Use analogies that ordinary Pakistanis understand

RESPONSE FORMAT:
Respond in this exact JSON format only, no extra text:
{
  "summary": "2-3 sentence overall summary in Urdu",
  "keyChanges": [
    "change 1 explained simply in Urdu",
    "change 2 explained simply in Urdu",
    "change 3 explained simply in Urdu"
  ],
  "impactOnUser": "specific impact on this audience type in Urdu",
  "goodNews": ["positive point 1 in Urdu", "positive point 2 in Urdu"],
  "badNews": ["negative point 1 in Urdu", "negative point 2 in Urdu"],
  "simpleFact": "one simple surprising fact about the budget in Urdu"
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
    const { budgetText, audienceType, year } = await req.json();

    // Validate input
    if (!budgetText || !audienceType) {
      return new Response(
        JSON.stringify({ error: "budgetText and audienceType are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate audience type
    const validAudiences = ["farmer", "student", "worker", "general"];
    if (!validAudiences.includes(audienceType)) {
      return new Response(
        JSON.stringify({ error: "audienceType must be: farmer, student, worker, or general" }),
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
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          { role: "system", content: BUDGET_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Please translate this Pakistani budget information for a ${audienceType}:

Budget Year: ${year || "2024-25"}
Audience: ${audienceType}

Budget Text:
${budgetText}

Explain this in simple Urdu specifically for a ${audienceType}.`
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

    const { summary, keyChanges, impactOnUser, goodNews, badNews, simpleFact } = parsed;

    return new Response(
      JSON.stringify({ summary, keyChanges, impactOnUser, goodNews, badNews, simpleFact }),
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