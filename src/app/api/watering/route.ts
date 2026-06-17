import { NextRequest, NextResponse } from "next/server";
import { getWateringAIRecommendation } from "@/utils/gemini";
import { supabase, isSupabaseConfigured } from "@/utils/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cropType, areaSize, lastWatered, region, farmId } = body;

    if (!cropType || !areaSize || !region) {
      return NextResponse.json(
        { error: "Ekin turi, maydon hajmi va viloyat kiritilishi shart." },
        { status: 400 }
      );
    }

    const size = parseFloat(areaSize);
    if (isNaN(size) || size <= 0) {
      return NextResponse.json(
        { error: "Maydon hajmi musbat son bo'lishi shart." },
        { status: 400 }
      );
    }

    // Call Gemini API to calculate optimal watering recommendation
    const recommendation = await getWateringAIRecommendation(
      cropType,
      size,
      lastWatered,
      region
    );

    // If Supabase is configured, write the watering log entry
    if (isSupabaseConfigured && supabase) {
      const activeFarmId = farmId || "f05d5351-419b-4393-8ef4-6f5dfba21f01"; // Default mock central farm ID
      const { error: dbError } = await supabase
        .from("irrigation_logs")
        .insert({
          farm_id: activeFarmId,
          crop_type: cropType,
          water_amount_liters: recommendation.recommendedVolumeLiters,
          duration_minutes: Math.round(recommendation.recommendedVolumeLiters / 200), // simulated watering time
          savings_achieved_percent: recommendation.waterSavingPotential
        });

      if (dbError) {
        console.error("Database log insertion error:", dbError);
      }
    }

    return NextResponse.json(recommendation);
  } catch (error: any) {
    console.error("Watering API Error:", error);
    return NextResponse.json(
      { error: "Tahlil jarayonida ichki xatolik yuz berdi: " + (error.message || error) },
      { status: 500 }
    );
  }
}
