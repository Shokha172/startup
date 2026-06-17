/**
 * AquaMind AI - Central Agricultural & Regional Database for Uzbekistan
 * This file serves as the definitive reference for regional climates and crop parameters.
 * It is used for offline calculations, prompt context, and visual dropdown datasets.
 */

export interface RegionClimate {
  name: string;
  climateType: string;
  averageTempSummer: number;
  averageTempWinter: number;
  annualPrecipitationMm: number;
  waterScarcityLevel: "Low" | "Medium" | "High" | "Critical";
  soilType: string;
  wateringAdvice: string;
  agricultureAdvice: string;
  waterDemandMultiplier: number; // multiplier based on climate evaporation rates
  districts: string[];
}

export interface CropParameter {
  name: string;
  waterDemandLitersPerHectare: number;
  growthStages: { stage: string; durationDays: number; description: string }[];
  commonDiseases: { name: string; symptoms: string; treatment: string }[];
  expectedYieldTonsPerHectare: number;
  recommendedWateringIntervalDays: number;
  wateringAdvice: string;
}

export const REGIONS_DATA: Record<string, RegionClimate> = {
  "Toshkent shahri": {
    name: "Toshkent shahri",
    climateType: "Mo'tadil kontinental",
    averageTempSummer: 34,
    averageTempWinter: -2,
    annualPrecipitationMm: 440,
    waterScarcityLevel: "Low",
    soilType: "Bo'z tuproq",
    wateringAdvice: "Shahar sharoitida yashil hududlar va poliz ekinlari uchun kechki sug'orish tavsiya etiladi. Suv oqimini tartibga solish orqali sarfni 10-15% tejash mumkin.",
    agricultureAdvice: "Shahar ekologiyasini yaxshilash va yashil hududlarni saqlash uchun avtomatlashtirilgan tomchilatib sug'orish hamda gazon ekinlarini parvarishlash tavsiya etiladi.",
    waterDemandMultiplier: 1.0,
    districts: ["Yunusobod", "Chilonzor", "Mirzo Ulug'bek", "Yashnobod", "Yakkasaroy", "Uchtepa", "Olmazor", "Mirobod", "Sergeli", "Bektemir", "Yangihayot"]
  },
  "Toshkent viloyati": {
    name: "Toshkent viloyati",
    climateType: "Kontinental, tog'oldi",
    averageTempSummer: 35,
    averageTempWinter: -3,
    annualPrecipitationMm: 500,
    waterScarcityLevel: "Low",
    soilType: "Tog' bo'z tuproqlari, sur tuproq",
    wateringAdvice: "Chirchiq-Ohangaron havzasi yaqinligi tufayli suv mo'l, biroq tog'oldi yonbag'irlarida ekin turi va yomg'irlatib sug'orish texnologiyasini to'g'ri tanlash suvni 20% tejash imkonini beradi.",
    agricultureAdvice: "Meva-sabzavotchilik, uzumchilik va g'allachilik uchun qulay sharoit. Dukkakli ekinlar bilan tuproq unumdorligini tiklash va intensiv bog'dorchilik tavsiya qilinadi.",
    waterDemandMultiplier: 0.95,
    districts: ["Chinoz", "Qibray", "Zangiota", "Yangiyo'l", "Bo'stonliq", "Parkent", "Ohangaron", "Pskent", "O'rtachirchiq", "Yuqorichirchiq", "Quyichirchiq", "Bekobod", "Bo'ka"]
  },
  "Sirdaryo": {
    name: "Sirdaryo",
    climateType: "Keskin kontinental, quruq",
    averageTempSummer: 37,
    averageTempWinter: -4,
    annualPrecipitationMm: 320,
    waterScarcityLevel: "High",
    soilType: "Sho'rlangan och tusli bo'z tuproq",
    wateringAdvice: "Er osti suvlarining yuqoriligi sababli sho'rlanish xavfi bor. Kollektor-drenaj tizimini faol saqlash va tomchilatib sug'orish orqali sho'r yuvish suvlarini minimallashtirish zarur.",
    agricultureAdvice: "Qurg'oqchilikka chidamli paxta va g'alla navlarini ekish, kollektor tizimini nazorat qilish va ekin turlarini almashlab ekish (beda bilan) tavsiya etiladi.",
    waterDemandMultiplier: 1.15,
    districts: ["Guliston", "Sardoba", "Sayxunobod", "Oqoltin", "Boyovut", "Shirin", "Sirdaryo", "Xavast", "Mirzaobod"]
  },
  "Samarqand": {
    name: "Samarqand",
    climateType: "Mo'tadil kontinental, tog'oldi",
    averageTempSummer: 34,
    averageTempWinter: -1,
    annualPrecipitationMm: 390,
    waterScarcityLevel: "Medium",
    soilType: "Tipik bo'z va qora tuproq",
    wateringAdvice: "Zarafshon daryosi havzasi suvidan foydalanishda navbatli sug'orish taqvimiga rioya qilish muhim. Bog'dorchilik va tokzorlarda tomchilatib sug'orish 30% gacha suv tejaydi.",
    agricultureAdvice: "Olma bog'lari, tokzorlar va sabzavotchilik rivojlangan. Tomchilatib sug'orish va o'g'itlarni sug'orish suvi bilan berish (fertigatsiya) yuqori samara beradi.",
    waterDemandMultiplier: 1.0,
    districts: ["Bulung'ur", "Jomboy", "Ishtixon", "Kattaqo'rg'on", "Narpay", "Nurobod", "Oqdaryo", "Payariq", "Pastdarg'om", "Paxtachi", "Samarqand", "Toyloq", "Urgut", "Qo'shrabot"]
  },
  "Jizzax": {
    name: "Jizzax",
    climateType: "Kontinental, cho'l-dasht",
    averageTempSummer: 36,
    averageTempWinter: -3,
    annualPrecipitationMm: 350,
    waterScarcityLevel: "High",
    soilType: "Och tusli bo'z va qumloq tuproq",
    wateringAdvice: "Mirzacho'l hududida suv tanqisligi yuqori. G'alla va paxta ekinlarini faqat tuproq namligi datchiklari nazorati ostida pulsli-sug'orish orqali namlantirish tavsiya etiladi.",
    agricultureAdvice: "Lalmi g'allachilik, kungaboqar va chorva yem-xashak ekinlarini yetishtirish. Cho'l hududlarida namlikni saqlovchi gidrogellardan foydalanish tavsiya qilinadi.",
    waterDemandMultiplier: 1.1,
    districts: ["Arnasoy", "Baxmal", "Gallaorol", "Do'stlik", "Sharof Rashidov", "Zafarobod", "Zarbdor", "Zamin", "Mirzacho'l", "Paxtakor", "Yangiobod", "Forish"]
  },
  "Buxoro": {
    name: "Buxoro",
    climateType: "Keskin kontinental, cho'l iqlimi",
    averageTempSummer: 39,
    averageTempWinter: -2,
    annualPrecipitationMm: 150,
    waterScarcityLevel: "Critical",
    soilType: "Sho'rlangan taqir va qumli cho'l tuproq",
    wateringAdvice: "Suv resurslari o'ta tanqis. Ariqdan oqizish mutlaqo taqiqlanishi kerak. Faqat egatga plyonka to'shab sug'orish yoki to'liq tomchilatib sug'orish tizimi ishlatilishi lozim.",
    agricultureAdvice: "Sho'rlangan tuproq sharoiti. Sho'rga chidamli g'o'za (paxta) navlari, poliz ekinlari (qovun) yetishtirish hamda tomchilatib sug'orish bilan birga sho'r yuvish me'yorini saqlash tavsiya etiladi.",
    waterDemandMultiplier: 1.3,
    districts: ["Buxoro", "Vobkent", "Jondor", "Kogon", "Olot", "Peshku", "Qorako'l", "Qoravulbozor", "Romitan", "Shofirkon", "G'ijduvon"]
  },
  "Navoiy": {
    name: "Navoiy",
    climateType: "Quruq cho'l kontinental",
    averageTempSummer: 38,
    averageTempWinter: -4,
    annualPrecipitationMm: 160,
    waterScarcityLevel: "Critical",
    soilType: "Qumli cho'l va gipsli tuproq",
    wateringAdvice: "Qizilqum sahrosi ta'siri yuqori bo'lgani sabab suv tez bug'lanadi. Sug'orish faqat quyosh botgandan keyin va tun yarmida amalga oshirilishi shart.",
    agricultureAdvice: "Yaylov chorvachiligi va cho'l dehqonchiligi. Tomchilatib va datchiklar asosida sug'oriladigan tarvuz hamda poliz maydonlarini tashkil etish qulay.",
    waterDemandMultiplier: 1.25,
    districts: ["Karmana", "Konimex", "Navbahor", "Nurota", "Tomdi", "Uchquduq", "Xatirchi", "Qiziltepa"]
  },
  "Qashqadaryo": {
    name: "Qashqadaryo",
    climateType: "Issiq quruq kontinental",
    averageTempSummer: 38,
    averageTempWinter: 0,
    annualPrecipitationMm: 280,
    waterScarcityLevel: "High",
    soilType: "Taqirsimon bo'z tuproq va qumloq",
    wateringAdvice: "Qarshi dashtida suv yetkazish nasos stansiyalari orqali amalga oshiriladi. Elektr va suv energiyasini tejash uchun tun yarmida tomchilatib sug'orish eng samarali yo'ldir.",
    agricultureAdvice: "G'allachilik va paxtachilik bazasi. Nasos stansiyalaridagi suv sarfini kamaytirish uchun tomchilatib sug'orish va loviya, kungaboqar kabi kam suv talab qiluvchi ekinlar tavsiya etiladi.",
    waterDemandMultiplier: 1.2,
    districts: ["G'uzor", "Dehqonobod", "Qamashi", "Qarshi", "Koson", "Kitob", "Kasbi", "Mirishkor", "Muborak", "Nishon", "Chiroqchi", "Shahrisabz", "Yakkabog'", "Ko'kdala"]
  },
  "Surxondaryo": {
    name: "Surxondaryo",
    climateType: "Quruq subtropik kontinental",
    averageTempSummer: 41,
    averageTempWinter: 3,
    annualPrecipitationMm: 250,
    waterScarcityLevel: "High",
    soilType: "Taqir va qumoq bo'z tuproq",
    wateringAdvice: "O'zbekistondagi eng issiq hudud. Evapotranspiratsiya darajasi juda yuqori. Ekinlarni quyosh nurlaridan himoya qilish (mulchalash) va chuqur ildiz osti namlantirish qo'llanilishi zarur.",
    agricultureAdvice: "Subtropik iqlim. Erta pishar mevalar ( shaftoli, o'rik), anor, xurmo va limon yetishtirish uchun eng qulay hudud. Ekin maydonlarini mulchalash va ko'lankali to'rlardan foydalanish lozim.",
    waterDemandMultiplier: 1.35,
    districts: ["Angor", "Boysun", "Denov", "Jarqo'rg'on", "Muzrabot", "Oltinsoy", "Sariosiyo", "Termiz", "Uzun", "Sherobod", "Sho'rchi", "Qiziriq", "Qumqo'rg'on", "Bandixon"]
  },
  "Andijon": {
    name: "Andijon",
    climateType: "Mo'tadil kontinental, namroq",
    averageTempSummer: 34,
    averageTempWinter: -3,
    annualPrecipitationMm: 300,
    waterScarcityLevel: "Medium",
    soilType: "Tipik qora va bo'z tuproq",
    wateringAdvice: "Vodiy sharoitida yer maydonlari cheklangan, zich joylashgan. Sug'orishda namlik datchiklari yordamida ekin ildiz qatlamini aniq o'lchab suv berish tavsiya qilinadi.",
    agricultureAdvice: "Intensiv mevali bog'lar va sabzavot ekinlari. Yer maydoni kichikligi tufayli ekinlar orasiga soya yoki loviya ekib tuproqni azot bilan to'yintirish (intercropping) tavsiya qilinadi.",
    waterDemandMultiplier: 0.98,
    districts: ["Andijon", "Asaka", "Baliqchi", "Buloqboshi", "Bo'ston", "Jalaquduq", "Izboskan", "Marhamat", "Oltinkul", "Paxtaobod", "Ulug'nor", "Xodjaobod", "Shahrixon", "Qo'rg'ontepa"]
  },
  "Namangan": {
    name: "Namangan",
    climateType: "Mo'tadil, tog' yonbag'ri",
    averageTempSummer: 34,
    averageTempWinter: -4,
    annualPrecipitationMm: 325,
    waterScarcityLevel: "Medium",
    soilType: "Tog' bo'z tuproqlari",
    wateringAdvice: "Adirlardagi mevali bog'lar va sabzavotlar uchun yomg'irlatib yoki mikrosug'orish tizimi ishlatilishi suv sarfini 35% ga qisqartiradi.",
    agricultureAdvice: "Tog'oldi bog'dorchiligi (o'rik, gilos) va dorivor o'simliklar. Suv oqimi yo'nalishida eroziyaning oldini olish uchun ko'p yillik daraxtlar va terrasalash usullari tavsiya etiladi.",
    waterDemandMultiplier: 1.0,
    districts: ["Kosonsoy", "Mingbuloq", "Namangan", "Naryn", "Pop", "Turaqurgan", "Uychi", "Uchqo'rg'on", "Chortoq", "Chust", "Yangiqo'rg'on", "Davlatobod"]
  },
  "Farg‘ona": {
    name: "Farg‘ona",
    climateType: "Mo'tadil quruq kontinental",
    averageTempSummer: 35,
    averageTempWinter: -3,
    annualPrecipitationMm: 220,
    waterScarcityLevel: "Medium",
    soilType: "Taqirli och bo'z tuproq",
    wateringAdvice: "Yozyovon cho'llarida sho'rlanish va suv yo'qotilishi yuqori. Ekinlarni diskretli (navbatma-navbat) sug'orish va yer osti drenaj nazorati o'rnatilishi shart.",
    agricultureAdvice: "Uzumchilik (Oltiariq uslubi), shaftoli va anjir bog'dorchiligi. Yozyovon qumliklarida suvni ushlab qoluvchi loy-qum aralashma texnologiyasini joriy etish tavsiya qilinadi.",
    waterDemandMultiplier: 1.05,
    districts: ["Oltiariq", "Bag'dod", "Beshariq", "Buvayda", "Dang'ara", "Quva", "Rishton", "Toshloq", "Uchko'prik", "Farg'ona", "Furqat", "Yozyovon", "O'zbekiston", "Qo'shtepa"]
  },
  "Xorazm": {
    name: "Xorazm",
    climateType: "Keskin kontinental, o'ta quruq",
    averageTempSummer: 37,
    averageTempWinter: -6,
    annualPrecipitationMm: 110,
    waterScarcityLevel: "Critical",
    soilType: "Allyuvial-o'tloqi va sho'rlangan tuproq",
    wateringAdvice: "Orolbo'yi inqirozi hududi. Daryo oqimi oxiri bo'lgani uchun suv sho'rligi yuqori. Suvni magnitli tozalash, tomchilatib sug'orish va biologik mulchalash eng muhim talabdir.",
    agricultureAdvice: "Sholichilik va polizchilik (Gurvak qovunlari). Suv sho'rligi yuqori bo'lgani sababli magnetizatorlardan foydalanish, yerlarni lazerli tekislash va sholi dalalarida suv aylanma tizimlarini qo'llash zarur.",
    waterDemandMultiplier: 1.25,
    districts: ["Bog'ot", "Gurlan", "Qo'shko'pir", "Urganch", "Xiva", "Xonqa", "Shovot", "Yangiariq", "Yangibozor", "Tuproqqal'a"]
  },
  "Qoraqalpog‘iston Respublikasi": {
    name: "Qoraqalpog‘iston Respublikasi",
    climateType: "O'ta keskin kontinental, cho'l",
    averageTempSummer: 38,
    averageTempWinter: -8,
    annualPrecipitationMm: 100,
    waterScarcityLevel: "Critical",
    soilType: "Allyuvial qumloq, taqirli sho'r tuproq",
    wateringAdvice: "Eng og'ir suv tanqisligi hududi. Sho'r yuvish va sug'orish ishlarini faqat lazerli tekislangan maydonlarda va yopiq quvurli tizimlar orqali amalga oshirish suv yo'qotilishini 40% ga kamaytiradi.",
    agricultureAdvice: "Orolbo'yi cho'l zonasi sharoiti. Sho'rga chidamli ekinlar (sariq beda, javdar), makkajo'xori kabi yem-xashak ekinlarini yetishtirish hamda tuproq sho'rlanishini kamaytirish uchun organik o'g'itlardan foydalanish lozim.",
    waterDemandMultiplier: 1.35,
    districts: ["Amudaryo", "Beruniy", "Kegeyli", "Qanliko'l", "Qorao'zak", "Qo'ng'irot", "Mo'ynoq", "Nukus", "Taxtako'pir", "To'rtko'l", "Xo'jayli", "Chimboy", "Shumanay", "Bo'zatov", "Taxiatosh"]
  }
};

export const CROPS_DATA: Record<string, CropParameter> = {
  "Paxta": {
    name: "Paxta",
    waterDemandLitersPerHectare: 5500000, // 5500 m3
    growthStages: [
      { stage: "Maysalash", durationDays: 15, description: "Urug' unib chiqishi va dastlabki barg yoyish davri. Namlik yuqori bo'lishi kerak." },
      { stage: "Shonalash", durationDays: 30, description: "G'unchalar paydo bo'lishi va vegetativ massaning faol o'sishi." },
      { stage: "Gullash-hosil to'plash", durationDays: 40, description: "Eng ko'p suv talab qiladigan bosqich. Bu davrda suvsizlik hosilni keskin kamaytiradi." },
      { stage: "Ko'saklar pishishi", durationDays: 35, description: "Sug'orish to'xtatiladi yoki kamaytiriladi, tola sifati shakllanadi." }
    ],
    commonDiseases: [
      { name: "Vilt (Fuzarioz)", symptoms: "Barglarning sarg'ayib so'lishi, tomir qorayishi", treatment: "Kasallikka chidamli navlar ekish, fungitsid sepish, almashlab ekishni yo'lga qo'yish" },
      { name: "Gommoz", symptoms: "Barg, ko'sak va poyada shilimshiq qora dog'lar paydo bo'lishi", treatment: "Urug'larni tozalash, mis preparatlarini purkash" }
    ],
    expectedYieldTonsPerHectare: 3.5,
    recommendedWateringIntervalDays: 12,
    wateringAdvice: "Gullash davrida har 10-12 kunda sug'orish, ko'saklar ochilishida intervalni 20 kunga uzaytirish lozim."
  },
  "Bug‘doy": {
    name: "Bug‘doy",
    waterDemandLitersPerHectare: 4000000,
    growthStages: [
      { stage: "Maysalash", durationDays: 20, description: "Urug' unishi va birinchi maysa hosil bo'lish davri." },
      { stage: "Tupallash", durationDays: 25, description: "Yon shoxlar va ildiz tizimining rivojlanishi." },
      { stage: "Nish urish (Naychalash)", durationDays: 30, description: "Poyaning bo'yga cho'zilishi va boshoq boshlanishi." },
      { stage: "Sut-mum pishish", durationDays: 25, description: "Don to'lishishi va quruq moddalar to'planish davri." }
    ],
    commonDiseases: [
      { name: "Sariq va qo'ng'ir zang", symptoms: "Bargda sariq-qizil kukunsimon dog'lar", treatment: "Triazol sinfidagi fungitsid purkash, ortiqcha azotli o'g'itdan qochish" },
      { name: "Qorakuya", symptoms: "Boshoq donlari o'rnida qora chang hosil bo'lishi", treatment: "Urug'larni dorilash, chidamli urug'lardan foydalanish" }
    ],
    expectedYieldTonsPerHectare: 6.5,
    recommendedWateringIntervalDays: 14,
    wateringAdvice: "Naychalash va boshoqlash bosqichlarida tuproq namligini 70-75% atrofida saqlash eng yuqori hosilni kafolatlaydi."
  },
  "Sholi": {
    name: "Sholi",
    waterDemandLitersPerHectare: 18000000, // 18000 m3 (highest)
    growthStages: [
      { stage: "Ko'chat davri", durationDays: 25, description: "Urug'larni nam tuproqda unib chiqishi va ildiz otishi." },
      { stage: "Tupallash", durationDays: 30, description: "Doimiy suv qatlami ostida poyaning zich shoxlanishi." },
      { stage: "Gullash", durationDays: 20, description: "Suv qatlami balandligi 10-15 sm atrofida ushlab turiladi." },
      { stage: "Don pishishi", durationDays: 25, description: "O'rim-yig'imdan 10 kun oldin suv butunlay oqizib yuboriladi." }
    ],
    commonDiseases: [
      { name: "Pirikulyarioz", symptoms: "Bargda kulrang markazli romb shaklidagi dog'lar", treatment: "Tricyclazole fungitsidini sepish, ekin qoldiqlarini yo'q qilish" }
    ],
    expectedYieldTonsPerHectare: 5.8,
    recommendedWateringIntervalDays: 1, // continuous flooding
    wateringAdvice: "Sholi o'ta yuqori suv talab qiluvchi ekin bo'lib, oqova suv ko'p bo'lmagan qurg'oqchil viloyatlarda (Navoiy, Buxoro) uni yetishtirish cheklanishi kerak."
  },
  "Makkajo‘xori": {
    name: "Makkajo‘xori",
    waterDemandLitersPerHectare: 5000000,
    growthStages: [
      { stage: "Unib chiqish", durationDays: 12, description: "Birinchi barglar shakllanish davri." },
      { stage: "Faol o'sish", durationDays: 35, description: "Bo'yga o'sish va so'ta boshlanishi." },
      { stage: "Gullash (Chaqaloqlash)", durationDays: 25, description: "Popuk va so'talar paydo bo'lish, changlanish fazasi." },
      { stage: "Don to'lishishi", durationDays: 30, description: "Donlarning sut va mum pishish davri." }
    ],
    commonDiseases: [
      { name: "Pufaksimon qorakuya", symptoms: "Poya va so'tada oq shishlar va ichida qora kukun", treatment: "Almashlab ekish, fungitsidlar bilan ishlov berish" }
    ],
    expectedYieldTonsPerHectare: 8.0,
    recommendedWateringIntervalDays: 10,
    wateringAdvice: "Popuk chiqarish va don to'lishish davrida sug'orish intervalini 8 kunga tushirish lozim, aks holda so'ta bo'sh qoladi."
  },
  "Kartoshka": {
    name: "Kartoshka",
    waterDemandLitersPerHectare: 3500000,
    growthStages: [
      { stage: "Maysalash", durationDays: 25, description: "Tugnaklar unishi va yer ustki qismi rivojlanishi." },
      { stage: "G'unchalash", durationDays: 20, description: "Gullar paydo bo'lishi va yer ostida tugnak tugila boshlanishi." },
      { stage: "Tugnak to'lishishi", durationDays: 35, description: "Asosiy oziq moddalarning tugnaklarga to'planish davri." },
      { stage: "Pishish (Qurish)", durationDays: 20, description: "Barglarning sarg'ayib qurishi va po'stloq qalinlashishi." }
    ],
    commonDiseases: [
      { name: "Fitoftora (Kechki chirish)", symptoms: "Barglarda jigarrang dog'lar, nam havoda oq mog'or osti", treatment: "Mis kuporosi yoki tizimli fungitsid purkash" }
    ],
    expectedYieldTonsPerHectare: 25.0,
    recommendedWateringIntervalDays: 8,
    wateringAdvice: "Tugnak to'lishish fazasida tuproq namligi doimiy o'rtacha darajada bo'lishi muhim. Ortiqcha suv tugnaklarni chiritadi."
  },
  "Pomidor": {
    name: "Pomidor",
    waterDemandLitersPerHectare: 4500000,
    growthStages: [
      { stage: "Urug'lik ko'chat", durationDays: 30, description: "Issiqxonada ko'chat o'stirish." },
      { stage: "Moslashish", durationDays: 15, description: "Ochiq yerga ko'chirib o'tqazish va ildiz olish." },
      { stage: "Gullash-tugish", durationDays: 35, description: "Tugunchalar hosil bo'lishi va birinchi mevalarning rivojlanishi." },
      { stage: "Pishish", durationDays: 30, description: "Mevaning rang kirishi va shakar yig'ishi." }
    ],
    commonDiseases: [
      { name: "Fuzarioz so'lish", symptoms: "Poyaning pastki barglaridan boshlab so'lishi", treatment: "Kasallikka chidamli duragaylarni ekish, tuproqni dezinfeksiya qilish" }
    ],
    expectedYieldTonsPerHectare: 45.0,
    recommendedWateringIntervalDays: 7,
    wateringAdvice: "Tomchilatib sug'orish eng samarali hisoblanadi. Bargiga suv tegishi qo'ziqorin kasalliklarini qo'zg'atadi."
  },
  "Bodring": {
    name: "Bodring",
    waterDemandLitersPerHectare: 3800000,
    growthStages: [
      { stage: "Maysalash", durationDays: 10, description: "Barg yoyish." },
      { stage: "Shoxlanish", durationDays: 20, description: "Palak otish va shoxlar yoyish." },
      { stage: "Gullash va hosil", durationDays: 45, description: "Har kuni hosil yig'ish va yangi gullar hosil qilish." }
    ],
    commonDiseases: [
      { name: "Kul (Ungurug')", symptoms: "Barg yuzasida oq unsimon g'ubor paydo bo'lishi", treatment: "Kükürtli preparatlar sepish, namlikni me'yorlashtirish" }
    ],
    expectedYieldTonsPerHectare: 30.0,
    recommendedWateringIntervalDays: 4,
    wateringAdvice: "Bodring tuproq va havo namligiga o'ta talabchan. Yozning issiq kunlarida har 3-4 kunda oz-ozdan sug'orish lozim."
  },
  "Piyoz": {
    name: "Piyoz",
    waterDemandLitersPerHectare: 3000000,
    growthStages: [
      { stage: "Maysalash", durationDays: 20, description: "Ignasimon barglarning chiqishi." },
      { stage: "Barg shakllanishi", durationDays: 40, description: "Yashil patlarning soni ko'payishi." },
      { stage: "Piyoz tugnak o'sishi", durationDays: 45, description: "Bargdagi oziq yer ostidagi piyoz boshiga o'tadi." },
      { stage: "Yetilish (Yotish)", durationDays: 15, description: "Barglar yotadi va qurishni boshlaydi." }
    ],
    commonDiseases: [
      { name: "Peredonosporoz (Soxta kul)", symptoms: "Bargda binafsha tusli g'ubor va sarg'ayish", treatment: "Fungitsid purkash, ortiqcha suv to'planishini cheklash" }
    ],
    expectedYieldTonsPerHectare: 35.0,
    recommendedWateringIntervalDays: 8,
    wateringAdvice: "Yig'im-terimdan 2-3 hafta oldin sug'orishni to'xtatish shart, aks holda piyoz chirib, uzoq saqlanmaydi."
  },
  "Sabzi": {
    name: "Sabzi",
    waterDemandLitersPerHectare: 3200000,
    growthStages: [
      { stage: "Maysalash", durationDays: 20, description: "Urug' juda sekin unib chiqadi." },
      { stage: "Barg shakllanishi", durationDays: 30, description: "Popuksimon barglarning faol rivojlanishi." },
      { stage: "Ildizmeva o'sishi", durationDays: 50, description: "Sabzi bo'yiga va eniga qalinlashadi." }
    ],
    commonDiseases: [
      { name: "Alternarioz (Qora chirish)", symptoms: "Barg uchlarining qorayib qurishi", treatment: "Fungitsid purkash, urug'larni dorilash" }
    ],
    expectedYieldTonsPerHectare: 28.0,
    recommendedWateringIntervalDays: 9,
    wateringAdvice: "Tekis sug'orish muhim. Suvsizlikdan keyin to'satdan ko'p suv berilsa, sabzi yorilib ketadi."
  },
  "Karam": {
    name: "Karam",
    waterDemandLitersPerHectare: 5000000,
    growthStages: [
      { stage: "Ko'chat", durationDays: 35, description: "Issiqxonada parvarish." },
      { stage: "Barg to'plash", durationDays: 30, description: "Keng barglar shakllanish davri." },
      { stage: "Bosh o'rash", durationDays: 45, description: "Barglar zich guruhga to'planib, bosh hosil qiladi." }
    ],
    commonDiseases: [
      { name: "Kila", symptoms: "Ildizda shishlar paydo bo'lib, ekin o'sishdan to'xtaydi", treatment: "Tuproq ohaklash, almashlab ekishga qat'iy rioya qilish" }
    ],
    expectedYieldTonsPerHectare: 40.0,
    recommendedWateringIntervalDays: 6,
    wateringAdvice: "Bosh o'rash davrida karam o'ta yuqori suv talab qiladi. Suv yetishmasa, boshlar mayda va yumshoq bo'lib qoladi."
  },
  "Qovun": {
    name: "Qovun",
    waterDemandLitersPerHectare: 2800000,
    growthStages: [
      { stage: "Maysalash", durationDays: 12, description: "Urug' unishi." },
      { stage: "Palak otish", durationDays: 25, description: "Yon shoxlarning cho'zilishi." },
      { stage: "Gullash-tugish", durationDays: 20, description: "Mevaning shakllanishi." },
      { stage: "Pishish va shakar yig'ish", durationDays: 30, description: "Meva shakari va hidining to'planish davri." }
    ],
    commonDiseases: [
      { name: "Fusarium so'lish", symptoms: "Poyaning yorilishi, qurituvchi so'lish", treatment: "Kasallikka chidamli navlar, trichodermin preparati" }
    ],
    expectedYieldTonsPerHectare: 18.0,
    recommendedWateringIntervalDays: 12,
    wateringAdvice: "Pishish bosqichida sug'orish deyarli to'xtatiladi. Aks holda meva shirin bo'lmaydi va yorilib ketadi."
  },
  "Tarvuz": {
    name: "Tarvuz",
    waterDemandLitersPerHectare: 2900000,
    growthStages: [
      { stage: "Maysalash", durationDays: 10, description: "Maysa." },
      { stage: "Palak yoyish", durationDays: 30, description: "Yon palaklarni o'sishi." },
      { stage: "Gullash-tugish", durationDays: 25, description: "Tugunchalar hosil bo'lishi." },
      { stage: "Meva kattalashishi", durationDays: 30, description: "Mevaning suv va shakar to'plash fazasi." }
    ],
    commonDiseases: [
      { name: "Antraknoz", symptoms: "Barg va mevalarda qora-jigarrang botiq dog'lar", treatment: "Mis preparatlari sepish, chidamli navlar" }
    ],
    expectedYieldTonsPerHectare: 22.0,
    recommendedWateringIntervalDays: 10,
    wateringAdvice: "Meva o'sish davrida sug'oriladi, pishish arafasida sug'orish 20 kunga kechiktirilishi tarvuzning shirinligini oshiradi."
  },
  "Uzum": {
    name: "Uzum",
    waterDemandLitersPerHectare: 3000000,
    growthStages: [
      { stage: "Uyg'onish (Kurtaklash)", durationDays: 20, description: "Bahorgi uyg'onish va barg yozish." },
      { stage: "Gullash", durationDays: 15, description: "Shoda gullash fazasi. Suv berilmaydi, to'kilib ketish xavfi bor." },
      { stage: "G'o'ra to'lishishi", durationDays: 50, description: "Mevaning eng faol o'sishi va suv talab qilishi." },
      { stage: "Pishish", durationDays: 30, description: "Rang to'plash va shakar yig'ish." }
    ],
    commonDiseases: [
      { name: "Oidium (Kukunli kul)", symptoms: "Barg va rezavorlarda kulrang unsimon dog'lar", treatment: "Kükürtli preparatlar sepish, butalash orqali havo aylanishini yaxshilash" },
      { name: "Mildiuz", symptoms: "Barg orqasida oq momiq g'ubor, ustida sarg'ish yog'li dog'lar", treatment: "Mis preparatlari (Bordo suyuqligi)" }
    ],
    expectedYieldTonsPerHectare: 12.0,
    recommendedWateringIntervalDays: 15,
    wateringAdvice: "Gullash va uzum uzish arafasida sug'ormaslik kerak. Kuzgi suv zaxirasi (yaxob suvi) qishki chidamlilik uchun juda muhim."
  },
  "Olma": {
    name: "Olma",
    waterDemandLitersPerHectare: 4500000,
    growthStages: [
      { stage: "Gullash", durationDays: 15, description: "Bahorgi gullash fazasi." },
      { stage: "Tuguncha to'kish-rivojlanish", durationDays: 60, description: "Meva shakllanishi va o'sishi." },
      { stage: "Hosil yetilishi", durationDays: 45, description: "Mevaning rang va hajm olishi." }
    ],
    commonDiseases: [
      { name: "Kaltak (Kalamush tishi - Kalmarod)", symptoms: "Mevada qora qora parsha dog'lar paydo bo'lishi", treatment: "Kuzda to'kilgan barglarni yoqish, bahorda mis preparatlari sepish" }
    ],
    expectedYieldTonsPerHectare: 20.0,
    recommendedWateringIntervalDays: 12,
    wateringAdvice: "Olma daraxtlari chuqur ildiz otgan bo'lsa-da, yozgi meva to'lishish davrida har 10-12 kunda tomchilatib sug'orish meva to'kilishining oldini oladi."
  },
  "O‘rik": {
    name: "O‘rik",
    waterDemandLitersPerHectare: 3500000,
    growthStages: [
      { stage: "Erta gullash", durationDays: 10, description: "O'zbekistonda mart oyida erta gullash fazasi." },
      { stage: "Meva o'sishi", durationDays: 45, description: "Danak shakllanishi va meva kattalashishi." },
      { stage: "Hosil yig'imi", durationDays: 20, description: "Iyun-Iyul oylarida hosil pishadi." }
    ],
    commonDiseases: [
      { name: "Klyasterosporioz (Teshikli dog')", symptoms: "Bargda qizil xalqali jigarrang dog'lar va bargning teshilishi", treatment: "Xor preparati sepish, shikastlangan shoxlarni kesish" }
    ],
    expectedYieldTonsPerHectare: 10.0,
    recommendedWateringIntervalDays: 14,
    wateringAdvice: "Mevalar pishishidan 10 kun oldin sug'orish to'xtatiladi. Kuzda to'liq nam zaxirasi berilishi lozim."
  },
  "Shaftoli": {
    name: "Shaftoli",
    waterDemandLitersPerHectare: 4000000,
    growthStages: [
      { stage: "Gullash", durationDays: 12, description: "Bahorgi gullash." },
      { stage: "Meva o'sishi", durationDays: 50, description: "Meva go'shti rivojlanishi." },
      { stage: "Pishish", durationDays: 25, description: "Tukli mevalarning yumshashi va shirin bo'lishi." }
    ],
    commonDiseases: [
      { name: "Barg buralishi", symptoms: "Barglarning qizarib, shishib, buralib to'kilishi", treatment: "Kuz va erta bahorda mis kuporosi sepish" }
    ],
    expectedYieldTonsPerHectare: 14.0,
    recommendedWateringIntervalDays: 10,
    wateringAdvice: "Shaftoli suvsizlikka o'ta ta'sirchan. Meva to'lishish davrida muntazam namlik yetishmasa, mevalar mayda va achchiq bo'lib qoladi."
  },
  "Gilos": {
    name: "Gilos",
    waterDemandLitersPerHectare: 3800000,
    growthStages: [
      { stage: "Gullash", durationDays: 12, description: "Aprel oyi gullash." },
      { stage: "Meva yetilishi", durationDays: 35, description: "Mevaning tezkorlikda qizarishi va o'sishi." },
      { stage: "Yig'imdan keyin", durationDays: 60, description: "Keyingi yil hosili uchun kurtaklar shakllanishi." }
    ],
    commonDiseases: [
      { name: "Monilioz (Kulrang chirish)", symptoms: "Gullar va shoxlarning birdaniga qurib qolishi", treatment: "Fungitsidlar sepish, quritilgan qismlarni kesib tashlash" }
    ],
    expectedYieldTonsPerHectare: 8.5,
    recommendedWateringIntervalDays: 12,
    wateringAdvice: "Meva pishishi davrida ortiqcha suv berish gilosning yorilib ketishiga olib keladi. Hosildan so'ng esa ildizlarni o'g'it bilan sug'orish muhim."
  },
  "Loviya": {
    name: "Loviya",
    waterDemandLitersPerHectare: 2500500,
    growthStages: [
      { stage: "Maysalash", durationDays: 12, description: "Murtak barglari." },
      { stage: "Gullash", durationDays: 20, description: "Gullar shakllanishi." },
      { stage: "Dukkak to'lishishi", durationDays: 30, description: "Dukkaklar bo'rtishi va don pishishi." }
    ],
    commonDiseases: [
      { name: "Bakterioz", symptoms: "Barglarda sariq hoshiyali botiq dog'lar", treatment: "Urug'larni dorilash, mis preparatlari" }
    ],
    expectedYieldTonsPerHectare: 2.2,
    recommendedWateringIntervalDays: 10,
    wateringAdvice: "Gullash va dukkak to'lishish davrida ekinni suvsiz qoldirmaslik zarur, loviya qurg'oqchilikda gullarini to'kib yuboradi."
  },
  "Kungaboqar": {
    name: "Kungaboqar",
    waterDemandLitersPerHectare: 3800000,
    growthStages: [
      { stage: "Maysalash", durationDays: 15, description: "Maysalash." },
      { stage: "Savat shakllanishi", durationDays: 30, description: "Savatning eniga o'sishi." },
      { stage: "Gullash", durationDays: 20, description: "Sariq gullarning to'liq ochilishi va changlanishi." },
      { stage: "Pishish", durationDays: 35, description: "Pistalarning to'lishib qorayishi." }
    ],
    commonDiseases: [
      { name: "Oq chirish", symptoms: "Savat osti va poyaning chirishi", treatment: "Fungitsid purkash, ekinlarni navbatlab ekish" }
    ],
    expectedYieldTonsPerHectare: 2.8,
    recommendedWateringIntervalDays: 12,
    wateringAdvice: "Gullash bosqichidan boshlab tuproqdagi suv miqdori barqaror darajada bo'lishi kerak. Bu kungaboqar tarkibidagi moy ulushini ko'paytiradi."
  }
};
