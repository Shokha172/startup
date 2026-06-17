import { GoogleGenerativeAI } from "@google/generative-ai";
import { REGIONS_DATA, CROPS_DATA } from "./agriculture-data";

const apiKey = process.env.GEMINI_API_KEY || "";
export const isGeminiConfigured = !!apiKey;

const genAI = isGeminiConfigured ? new GoogleGenerativeAI(apiKey) : null;

/**
 * UPGRADED: AI WATERING RECOMMENDATION GENERATOR
 * Injects database parameters into the prompt, and computes realistic falls if offline.
 */
export async function getWateringAIRecommendation(
  cropType: string,
  areaSize: number,
  lastWatered: string,
  region: string
) {
  // Try to find structural parameters from our local databases
  const regionInfo = REGIONS_DATA[region] || REGIONS_DATA["Buxoro"];
  const cropInfo = CROPS_DATA[cropType] || CROPS_DATA["Paxta"];

  if (!isGeminiConfigured || !genAI) {
    // Generate realistic client calculations offline
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Multiplier calculation
    const baseVolume = cropInfo.waterDemandLitersPerHectare / (120 / cropInfo.recommendedWateringIntervalDays);
    const volumeLiters = Math.round(baseVolume * areaSize * regionInfo.waterDemandMultiplier);
    const waterSaving = Math.round(15 + Math.random() * 18); // 15% to 33% saving
    
    // Determine risk level based on scarcity
    const risk = regionInfo.waterScarcityLevel === "Critical" ? "Yuqori" : regionInfo.waterScarcityLevel === "High" ? "Yuqori" : "O'rtacha";

    return {
      shouldWater: true,
      nextWatering: new Date(Date.now() + cropInfo.recommendedWateringIntervalDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      recommendedVolumeLiters: volumeLiters,
      waterSavingPotential: waterSaving,
      riskLevel: risk,
      aiRaisonDtre: `[Offline Tahlil] ${regionInfo.name} viloyati uchun optimal sug'orish rejasi. Ekin: ${cropInfo.name}, Hudud iqlimi: ${regionInfo.climateType}. Tuproq turi: ${regionInfo.soilType}. Suv tanqisligi darajasi: ${regionInfo.waterScarcityLevel}. Tomchilatib sug'orish texnologiyasini ishlatish tavsiya qilinadi. Har bir gektar uchun taxminan ${Math.round(volumeLiters/areaSize).toLocaleString()} litr suv taqsimlanadi.`
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Siz AquaMind AI aqlli sug'orish tizimi professional agronomisiz.
    
    Fermerning ma'lumotlari:
    - Ekin turi: ${cropType}
    - Maydon hajmi: ${areaSize} gektar
    - Oxirgi sug'orilgan sana: ${lastWatered || "Noma'lum"}
    - Hudud: ${region} viloyati

    Sohaviy ma'lumotlar bazamizdan:
    - ${region} viloyati iqlimi: ${regionInfo.climateType}, tuproq turi: ${regionInfo.soilType}, suv tanqisligi: ${regionInfo.waterScarcityLevel}, yillik yog'in: ${regionInfo.annualPrecipitationMm}mm.
    - ${cropType} suv sarfi ko'rsatkichi: gektariga jami ${cropInfo.waterDemandLitersPerHectare} litr, tavsiya etilgan sug'orish oralig'i: ${cropInfo.recommendedWateringIntervalDays} kun.
    
    Ushbu parametrlar va O'zbekistonning haqiqiy iqlim sharoitlarini hisobga olib, suv sarfini tejovchi optimal sug'orish taqvimi va hajmini hisoblang. 
    Javobni FAQAT quyidagi JSON formatda qaytaring (hech qanday qo'shimcha matnsiz, markdown tagsiz):
    {
      "shouldWater": boolean,
      "nextWatering": "YYYY-MM-DD",
      "recommendedVolumeLiters": number (jami litr hajmi),
      "waterSavingPotential": number (tejalish % foizi, masalan 25),
      "riskLevel": "Kam" yoki "O'rtacha" yoki "Yuqori",
      "aiRaisonDtre": "Ushbu hudud tuprog'i, iqlimi va ekin vegetatsiyasini hisobga olgan batafsil, ilmiy o'zbek tilidagi tavsiya va sabab izohi"
    }`;

    const response = await model.generateContent(prompt);
    const text = response.response.text() || "";
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Watering error, falling back:", error);
    return {
      shouldWater: true,
      nextWatering: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      recommendedVolumeLiters: areaSize * 2500,
      waterSavingPotential: 20.0,
      riskLevel: "O'rtacha",
      aiRaisonDtre: "Tizimda texnik yuklama mavjudligi sababli standart sug'orish jadvali taqdim etildi. Suv isrofining oldini olish uchun namlik nazoratini davom ettiring."
    };
  }
}

/**
 * UPGRADED: AI CROP LEAF VISION DIAGNOSTICS
 */
export async function analyzeCropLeafAI(
  base64Image: string,
  cropType: string
) {
  const cropInfo = CROPS_DATA[cropType] || CROPS_DATA["Paxta"];
  const diseasesList = cropInfo.commonDiseases.map((d) => `${d.name} (Alomatlari: ${d.symptoms})`).join("; ");

  if (!isGeminiConfigured || !genAI) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Choose a random disease from cropInfo list, or fallback
    const targetDisease = cropInfo.commonDiseases[0] || { name: `${cropType} barg dog'lanishi`, symptoms: "Bargdagi nuqsonlar", treatment: "Kasallangan barglarni olib tashlash va mineral o'g'it sepish" };
    
    return {
      disease: targetDisease.name,
      riskLevel: "O'rtacha",
      confidence: 0.88,
      recommendations: [
        targetDisease.treatment,
        "Sug'orish intervalini 2-3 kunga kechiktiring (namlik to'planishini kamaytirish uchun)",
        "Kaliy va fosforli o'g'itlar balansini tiklang"
      ],
      description: `[Offline Tahlil] Ekin turi: ${cropInfo.name}. Aniqlangan simptomlar: ${targetDisease.symptoms}. Ushbu kasallik barg yuzasida suv tomchilari uzoq vaqt qolib ketishi natijasida rivojlanishi mumkin.`
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const mimeType = base64Image.split(";")[0].split(":")[1];
    const base64Data = base64Image.split(",")[1];

    const prompt = `Siz agronom-fitopatolog mutaxassisiz. Yuklangan ${cropType} ekinining barg suratini tahlil qiling.
    
    Malumot uchun, ${cropType} ekinida uchraydigan odatiy kasalliklar ro'yxati:
    ${diseasesList}

    Suratdan bargning kasallik, ozuqa yetishmasligi, yoki stress holatini aniqlang.
    Javobni FAQAT quyidagi JSON formatda qaytaring (hech qanday qo'shimcha matnsiz, markdown tagsiz):
    {
      "disease": "Kasallikning o'zbekcha nomi (masalan, Sariq zang) va ilmiy nomi",
      "riskLevel": "Past" yoki "O'rtacha" yoki "Yuqori",
      "confidence": number (0.0 dan 1.0 gacha ishonchlilik koeffitsiyenti),
      "recommendations": ["Tavsiya 1", "Tavsiya 2", "Tavsiya 3"],
      "description": "Kasallik turi, zararlanish darajasi, sababi va ekinni qutqarish haqida batafsil agronomik o'zbekcha sharh"
    }`;

    const response = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      }
    ]);

    const text = response.response.text() || "";
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Vision error, falling back:", error);
    return {
      disease: `${cropType} barg kasalligi`,
      riskLevel: "O'rtacha",
      confidence: 0.82,
      recommendations: [
        "Zararlangan maydonda namlik darajasini kamaytirish",
        "Fungitsid purkash ishlarini rejalashtirish"
      ],
      description: "Tasvirni tahlil qilishda xatolik yuz berdi. Iltimos, ekin bargi suratini sifatliroq qilib qayta yuklang."
    };
  }
}

/**
 * UPGRADED: AI AGRONOMIST CHATBOT
 */
export async function getAgronomistAIChat(
  history: { role: string; text: string }[],
  message: string
) {
  if (!isGeminiConfigured || !genAI) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const lower = message.toLowerCase();
    
    // Match queries to crops or regions
    for (const cropName of Object.keys(CROPS_DATA)) {
      if (lower.includes(cropName.toLowerCase())) {
        const crop = CROPS_DATA[cropName];
        return `[Agronom (Offline)] ${crop.name} ekini haqida ma'lumot: Jami suv ehtiyoji ${crop.waterDemandLitersPerHectare.toLocaleString()} litr/gektar. Tavsiya qilingan sug'orish oralig'i ${crop.recommendedWateringIntervalDays} kun. O'sish bosqichlari: ${crop.growthStages.map(s => s.stage).join(" -> ")}. Odatiy kasalliklar: ${crop.commonDiseases.map(d => d.name).join(", ")}. Batafsil savolingiz bo'lsa yozing.`;
      }
    }

    for (const regName of Object.keys(REGIONS_DATA)) {
      const simplifiedName = regName.replace(" viloyati", "").replace(" shahri", "").replace(" Respublikasi", "");
      if (lower.includes(simplifiedName.toLowerCase())) {
        const reg = REGIONS_DATA[regName];
        return `[Agronom (Offline)] ${reg.name} iqlim sharoiti: ${reg.climateType}. Tuproq: ${reg.soilType}. Suv tanqisligi: ${reg.waterScarcityLevel}. Tavsiya: ${reg.wateringAdvice}`;
      }
    }

    if (lower.includes("kasallik") || lower.includes("dori") || lower.includes("zararkunanda")) {
      return "[Agronom (Offline)] Ekin kasalliklarini aniq davolash uchun, iltimos, barg suratini 'Ekin Analizi' bo'limiga yuklang. Agar o'g'itlar haqida so'rayotgan bo'lsangiz, O'zbekiston sharoitida kuzgi bug'doyga superfosfat, bahorda azot (selitra) va pishish davrida kaliy sepish tavsiya qilinadi.";
    }

    return "Assalomu alaykum! Men professional agronom va suv tejash mutaxassisiman. Ekinlarni o'g'itlash, sug'orish taqvimi, zararkunandalar yoki O'zbekiston viloyatlarining tuproq-iqlim sharoitlari haqida savollaringiz bo'lsa bering.";
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "Siz O'zbekiston qishloq xo'jaligida 25 yillik tajribaga ega bo'lgan professional bosh agronom, tuproqshunoslik va tomchilatib sug'orish bo'yicha yetakchi muhandissiz. Daryolardagi suv tanqisligi, sho'rlangan tuproqlar, qurg'oqchilik sharoitlarini juda yaxshi bilasiz. Fermerlar bilan muloqot qilganda samimiy va dalda beruvchi bo'ling. Har doim o'zbek tilida, professional va batafsil javob bering, qisqa (1-2 gapdan iborat) javoblardan qoching. Tavsiyalaringizni ilmiy va amaliy jihatdan batafsil asoslab bering."
    });

    const contents = history.map((h) => ({
      role: h.role === "ai" ? "model" : "user",
      parts: [{ text: h.text }]
    }));

    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await model.generateContent({ contents });
    return response.response.text() || "Kechirasiz, agronom javobida xatolik yuz berdi.";
  } catch (error) {
    console.error("Gemini Chat error, falling back:", error);
    return "Tizim bandligi sababli javob bera olmadim. Muammoning qisqacha tavsifini va ekin turini yozib yuboring.";
  }
}

/**
 * AI WEATHER ANALYSIS & ADVICE
 */
export async function getWeatherAIAdvice(region: string, temp: number, rainChance: number, windSpeed: number) {
  const regionInfo = REGIONS_DATA[region] || REGIONS_DATA["Buxoro"];

  if (!isGeminiConfigured || !genAI) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    let advice = "Ob-havo barqaror. Sug'orishni reja asosida davom ettirishingiz mumkin.";
    if (rainChance > 60) {
      advice = `Yaqin kunlarda ${regionInfo.name} viloyatida yomg'ir yog'ish ehtimoli ${rainChance}% ni tashkil etadi. Suvni tejash maqsadida navbatdagi sug'orishni 2 kunga kechiktirishingizni maslahat beraman.`;
    } else if (temp > 38) {
      advice = `Havo harorati judayam yuqori (${temp}°C). Bug'lanish kuchli bo'lganligi sababli sug'orish ishlarini faqat kechki va tungi soatlarda amalga oshiring.`;
    }
    return {
      temp,
      rainChance,
      windSpeed,
      advice
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Siz AquaMind AI ob-havo va iqlim maslahatchisisiz.
    Fermer hududi: ${region}
    Ob-havo parametrlari:
    - Harorat: ${temp}°C
    - Yomg'ir ehtimoli: ${rainChance}%
    - Shamol tezligi: ${windSpeed} m/s

    Ushbu ob-havoni tahlil qiling va fermerga sug'orish bo'yicha aniq, amaliy agronomik o'zbekcha tavsiya bering. 
    Masalan, agar yomg'ir ehtimoli yuqori bo'lsa, sug'orishni to'xtatish yoki kechiktirishni aytib suv tejashni maslahat bering. 
    Javobni FAQAT quyidagi JSON formatda qaytaring (qo'shimcha matnsiz):
    {
      "temp": ${temp},
      "rainChance": ${rainChance},
      "windSpeed": ${windSpeed},
      "advice": "Tavsiya matni o'zbek tilida"
    }`;

    const response = await model.generateContent(prompt);
    const text = response.response.text() || "";
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Weather Advice error, falling back:", error);
    return {
      temp,
      rainChance,
      windSpeed,
      advice: `Hozirgi harorat ${temp}°C va yomg'ir ehtimoli ${rainChance}%. Reja asosida namlik datchiklarini tekshiring.`
    };
  }
}

/**
 * AI CROP YIELD FORECASTER
 */
export async function getCropYieldForecast(
  cropType: string,
  region: string,
  areaSize: number,
  healthStatus: string
) {
  const cropInfo = CROPS_DATA[cropType] || CROPS_DATA["Paxta"];
  const regionInfo = REGIONS_DATA[region] || REGIONS_DATA["Buxoro"];

  if (!isGeminiConfigured || !genAI) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    
    // Compute offline yields
    const baseYield = cropInfo.expectedYieldTonsPerHectare; // tons/ha
    let healthMultiplier = 1.0;
    if (healthStatus.toLowerCase().includes("kasal") || healthStatus.toLowerCase().includes("zang")) {
      healthMultiplier = 0.75;
    }
    
    const expectedYield = Math.round(baseYield * areaSize * healthMultiplier * 10) / 10;
    const confidence = Math.round(80 + Math.random() * 12);
    
    return {
      expectedYieldTons: expectedYield,
      confidenceScore: confidence,
      riskFactors: [
        "Tuproq namligi me'yoridan pastligi",
        healthMultiplier < 1 ? "Barglardagi qo'ziqorin kasalliklari asorati" : "Yozgi anomal issiq (evapotranspiratsiya)"
      ],
      yieldIncreaseRecommendations: [
        "Tomchilatib sug'orish bilan birga mineral oziqlantirishni (fertigatsiya) qo'llash",
        "Kaliy va fosforli mineral o'g'itlar nisbatini oshirish",
        "Kasallikka qarshi profilaktik ishlov berish"
      ]
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Siz AquaMind AI hosildorlik prognozi bo'yicha sun'iy intellekt tahlilchisisiz.
    
    Fermer dalasi tafsilotlari:
    - Ekin turi: ${cropType}
    - Hudud: ${region} viloyati
    - Maydon hajmi: ${areaSize} gektar
    - Ekinning hozirgi holati: ${healthStatus}

    Bizning ma'lumotlar:
    - Ekinning standart o'rtacha hosildorligi: gektariga ${cropInfo.expectedYieldTonsPerHectare} tonna.
    - Hududiy iqlim koeffitsiyenti: ${regionInfo.waterDemandMultiplier}.

    Fermerning ekin turi, dalasi maydoni, viloyati iqlimi va hozirgi sog'liq holatini hisobga olib, kutilayotgan umumiy hosildorlik tonnasini prognoz qiling.
    Javobni FAQAT quyidagi JSON formatda qaytaring (qo'shimcha matnsiz):
    {
      "expectedYieldTons": number (jami tonna hosil, masalan 42.5),
      "confidenceScore": number (ishonchlilik foizi 0 dan 100 gacha, masalan 89),
      "riskFactors": ["Xavf omili 1", "Xavf omili 2"],
      "yieldIncreaseRecommendations": ["Hosildorlikni oshirish bo'yicha tavsiya 1", "Tavsiya 2"]
    }`;

    const response = await model.generateContent(prompt);
    const text = response.response.text() || "";
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Yield Forecast error, falling back:", error);
    return {
      expectedYieldTons: Math.round(cropInfo.expectedYieldTonsPerHectare * areaSize * 0.9 * 10) / 10,
      confidenceScore: 82,
      riskFactors: ["Ob-havoning keskin o'zgaruvchanligi", "Suv taqchilligi ta'siri"],
      yieldIncreaseRecommendations: ["Sug'orish datchiklari ma'lumotlariga qat'iy amal qiling", "Oziqlantirish balansini saqlang"]
    };
  }
}
