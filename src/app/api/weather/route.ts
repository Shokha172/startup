import { NextRequest, NextResponse } from "next/server";
import { getWeatherAIAdvice } from "@/utils/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { region, temp, rainChance, windSpeed } = body;

    if (!region) {
      return NextResponse.json(
        { error: "Viloyat nomi kiritilishi shart." },
        { status: 400 }
      );
    }

    const t = parseFloat(temp || "28");
    const rc = parseFloat(rainChance || "10");
    const ws = parseFloat(windSpeed || "4");

    const weatherAdvice = await getWeatherAIAdvice(region, t, rc, ws);
    return NextResponse.json(weatherAdvice);
  } catch (error: any) {
    console.error("Weather API Error:", error);
    return NextResponse.json(
      { error: "Ob-havo tahlilida ichki xatolik yuz berdi: " + (error.message || error) },
      { status: 500 }
    );
  }
}
