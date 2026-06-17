import { NextRequest, NextResponse } from "next/server";
import { analyzeCropLeafAI } from "@/utils/gemini";
import { supabase, isSupabaseConfigured } from "@/utils/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, cropType, farmId } = body;

    if (!image) {
      return NextResponse.json(
        { error: "Tahlil qilish uchun ekin bargining surati yuklanishi lozim." },
        { status: 400 }
      );
    }

    if (!cropType) {
      return NextResponse.json(
        { error: "Ekin turini kiritish shart." },
        { status: 400 }
      );
    }

    // Call Gemini Leaf Vision AI module
    const analysisResult = await analyzeCropLeafAI(image, cropType);

    // Save to Supabase if config exists
    if (isSupabaseConfigured && supabase) {
      const activeFarmId = farmId || "f05d5351-419b-4393-8ef4-6f5dfba21f01"; // Fallback farm ID
      const { error: dbError } = await supabase
        .from("crop_analyses")
        .insert({
          farm_id: activeFarmId,
          crop_type: cropType,
          image_url: null, // base64 is not saved in url column to keep db small, or could use supabase storage
          diagnosis: analysisResult.disease,
          risk_level: analysisResult.riskLevel,
          confidence_score: analysisResult.confidence,
          recommendations: analysisResult.recommendations
        });

      if (dbError) {
        console.error("Database crop analysis insertion error:", dbError);
      }
    }

    return NextResponse.json(analysisResult);
  } catch (error: any) {
    console.error("Crop Analysis API Error:", error);
    return NextResponse.json(
      { error: "Ekin bargini tahlil qilishda xatolik yuz berdi: " + (error.message || error) },
      { status: 500 }
    );
  }
}
