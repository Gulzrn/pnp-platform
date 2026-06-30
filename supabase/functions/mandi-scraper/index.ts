import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Sample mandi prices for testing
// When real API available — replace this with actual API call
const SAMPLE_PRICES = [
  { crop: "wheat", price: 3850, mandi_location: "Lahore Mandi", district: "Lahore", province: "Punjab" },
  { crop: "wheat", price: 3900, mandi_location: "Multan Mandi", district: "Multan", province: "Punjab" },
  { crop: "wheat", price: 3800, mandi_location: "Faisalabad Mandi", district: "Faisalabad", province: "Punjab" },
  { crop: "rice", price: 4200, mandi_location: "Gujranwala Mandi", district: "Gujranwala", province: "Punjab" },
  { crop: "rice", price: 4100, mandi_location: "Sheikhupura Mandi", district: "Sheikhupura", province: "Punjab" },
  { crop: "cotton", price: 8500, mandi_location: "Multan Mandi", district: "Multan", province: "Punjab" },
  { crop: "cotton", price: 8600, mandi_location: "Bahawalpur Mandi", district: "Bahawalpur", province: "Punjab" },
  { crop: "sugarcane", price: 425, mandi_location: "Faisalabad Mandi", district: "Faisalabad", province: "Punjab" },
  { crop: "maize", price: 2100, mandi_location: "Peshawar Mandi", district: "Peshawar", province: "KPK" },
  { crop: "maize", price: 2050, mandi_location: "Mardan Mandi", district: "Mardan", province: "KPK" },
  { crop: "onion", price: 1800, mandi_location: "Karachi Mandi", district: "Karachi", province: "Sindh" },
  { crop: "tomato", price: 2500, mandi_location: "Karachi Mandi", district: "Karachi", province: "Sindh" },
  { crop: "potato", price: 1200, mandi_location: "Lahore Mandi", district: "Lahore", province: "Punjab" },
  { crop: "rice", price: 4300, mandi_location: "Hyderabad Mandi", district: "Hyderabad", province: "Sindh" },
  { crop: "wheat", price: 3750, mandi_location: "Quetta Mandi", district: "Quetta", province: "Balochistan" },
];

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
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

    // Add small random variation to prices to simulate real market changes
    const todayPrices = SAMPLE_PRICES.map(item => ({
      ...item,
      price: item.price + Math.floor(Math.random() * 200) - 100, // ±100 PKR variation
      recorded_at: new Date().toISOString()
    }));

    // Insert today's prices
    const { error } = await supabase
      .from("mandi_prices")
      .insert(todayPrices);

    if (error) {
      console.error("DB error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to insert prices", details: error }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully inserted ${todayPrices.length} mandi prices`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${todayPrices.length} prices inserted successfully`,
        timestamp: new Date().toISOString()
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