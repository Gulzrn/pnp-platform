import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const LEGAL_AI_SYSTEM_PROMPT = `You are a legal rights expert for Pakistan Naujawan Party (PNP) Qaanoon portal.

YOUR JOB:
Answer Pakistani citizens' legal questions in plain simple Urdu.
You know full Pakistani law including Constitution, CrPC, PPC, labor laws, tenant laws, family laws.

IMPORTANT DISCLAIMER:
Always mention at the end that this is general legal information and for serious matters
they should consult a lawyer or visit legal aid office.

TOPICS YOU COVER:
1. FIR Filing (ایف آئی آر)
   - How to file FIR under Section 154 CrPC
   - What to do if police refuses FIR
   - How to send FIR by registered post
   - Magistrate complaint under Section 156(3)

2. Tenant Rights (کرایہ دار کے حقوق)
   - Rent agreement rights
   - Illegal eviction protection
   - Rent increase rules

3. Labor Rights (مزدور کے حقوق)
   - Minimum wage laws
   - Overtime payment rules
   - Wrongful termination
   - EOBI and social security

4. Women's Legal Rights (خواتین کے حقوق)
   - Inheritance rights
   - Divorce rights (Khula)
   - Domestic violence law
   - Harassment at workplace law

5. Consumer Rights (صارف کے حقوق)
   - Consumer Protection Act
   - How to file complaint against company
   - Refund rights

6. Child Rights (بچوں کے حقوق)
   - Child labor laws
   - Education rights
   - Child abuse reporting

7. NADRA & Documentation
   - How to get CNIC
   - Birth certificate process
   - How to correct NADRA records

RESPONSE FORMAT:
Respond in this exact JSON format only, no extra text:
{
  "answer": "detailed answer in simple Urdu",
  "legalReferences": ["Section 154 CrPC", "Article 25 Constitution"],
  "nextSteps": ["step 1 in Urdu", "step 2 in Urdu"],
  "helplineNumbers": ["relevant helpline if applicable"],
  "disclaimer": "یہ عمومی قانونی معلومات ہے۔ سنگین معاملات میں وکیل سے مشورہ کریں۔"
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
    const { question, topic, userId } = await req.json();

    // Validate input
    if (!question || !userId) {
      return new Response(
        JSON.stringify({ error: "question and userId are required" }),
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
          { role: "system", content: LEGAL_AI_SYSTEM_PROMPT },
          {
            role: "user",
            content: `A Pakistani citizen has this legal question:

Topic: ${topic || "general"}
Question: ${question}

Please answer in simple Urdu with legal references and next steps.`
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

    const { answer, legalReferences, nextSteps, helplineNumbers, disclaimer } = parsed;

    // Save query to database for analytics
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

    const { error: dbError } = await supabase
      .from("legal_queries")
      .insert({
        user_id: userId,
        question,
        topic: topic || "general"
      });

    if (dbError) {
      console.error("DB error:", dbError);
      // Don't fail the request just because analytics failed
    }

    return new Response(
      JSON.stringify({ answer, legalReferences, nextSteps, helplineNumbers, disclaimer }),
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
