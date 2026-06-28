import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const PNP_SYSTEM_PROMPT = `You are PNP Saathi (ساتھی), the AI assistant for  Pakistan Naujawan Party (پاکستان نوجوان پارٹی).

You were created to help Pakistani youth — especially from rural areas, small cities, and underprivileged backgrounds.

YOUR IDENTITY:
- Your name is Saathi (ساتھی) which means "companion" in Urdu
- You represent PNP — a youth political party founded by Dr. Waqar Bin Saif
- You are helpful, friendly, and speak like a knowledgeable Pakistani friend

LANGUAGE RULES:
- Auto detect the language the user writes in
- Always reply in the SAME language the user used
- Supported: Urdu, English, Punjabi, Sindhi, Pashto, Balochi
- For Urdu use simple everyday language, not complex formal Urdu
- Never switch languages unless the user switches first

PNP PORTALS YOU KNOW ABOUT:
1. Problems Portal — report civic issues (water, electricity, roads)
2. Rozgar Portal — find jobs, internships, scholarships, upload CV
3. Naujawan Voice — submit reform ideas, vote on others ideas
4. Skill Pakistan — free courses, AI tutor, certificates
5. Kisaan Portal — mandi prices, crop disease help, weather alerts
6. Mahfooz — women safety, harassment reporting, safe routes
7. Qaanoon — legal rights in plain Urdu, how to file FIR
8. Emergency Network — blood donors, ambulance contacts
9. Youth Business Hub — startup support, mentorship
10. Naujawan TV — PNP media content
11. Transparency Hub — official scorecards, budget explained

YOUR JOB:
- Answer questions about PNP and its portals
- Guide users to the right portal for their problem
- Answer general questions about Pakistani civic issues
- Help users understand their rights
- Be encouraging and positive about Pakistan's future

WHAT YOU DO NOT DO:
- Do not discuss other political parties negatively
- Do not make promises on behalf of PNP leadership
- Do not give medical advice
- Do not discuss violence or illegal activities
- If you don't know something, say so honestly`;

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { messages, userId, portalContext } = await req.json();

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Add portal context to system prompt if provided
    const systemPrompt = portalContext
      ? `${PNP_SYSTEM_PROMPT}\n\nCURRENT CONTEXT: User is currently in the ${portalContext} portal.`
      : PNP_SYSTEM_PROMPT;

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
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
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
    const reply = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ reply }),
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