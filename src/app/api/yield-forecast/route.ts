import { NextRequest, NextResponse } from "next/server";
import { getCropYieldForecast } from "@/utils/gemini";
import { supabase, isSupabaseConfigured } from "@/utils/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cropType, region, areaSize, healthStatus, farmId } = body;

    if (!cropType || !region || !areaSize) {
      return NextResponse.json(
        { error: "Ekin turi, hudud va maydon hajmi kiritilishi shart." },
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

    const health = healthStatus || "Yaxshi (Stressiz)";

    // Call Gemini API to calculate expected crop yield
    const yieldForecast = await getCropYieldForecast(cropType, region, size, health);

    // Save to Supabase under farm metadata if configured
    if (isSupabaseConfigured && supabase) {
      const activeFarmId = farmId || "f05d5351-419b-4393-8ef4-6f5dfba21f01"; // Fallback farm ID
      const { error: dbError } = await supabase
        .from("crop_analyses")
        .insert({
          farm_id: activeFarmId,
          crop_type: cropType,
          diagnosis: `Hosil prognozi: Kutilmoqda ${yieldForecast.expectedYieldTons} tonna (${health} holati bo'yicha)`,
          risk_level: yieldForecast.confidenceScore < 85 ? "Medium" : "Low",
          confidence_score: yieldForecast.confidenceScore / 100,
          recommendations: yieldForecast.yieldIncreaseRecommendations
        });

      if (dbError) {
        console.error("Database yield log error:", dbError);
      }
    }

    return NextResponse.json(yieldForecast);
  } catch (error: any) {
    console.error("Yield Forecast API Error:", error);
    return NextResponse.json(
      { error: "Hosil prognozi tahlilida ichki xatolik yuz berdi: " + (error.message || error) },
      { status: 500 }
    );
  }
}
