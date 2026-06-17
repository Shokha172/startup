"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar, DashboardTab } from "@/components/layout/sidebar";
import { MetricCard } from "@/components/dashboard/metric-card";
import { WaterChart } from "@/components/dashboard/water-chart";
import { RiskGauge } from "@/components/dashboard/risk-gauge";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { GlassSelect } from "@/components/ui/glass-select";
import { AnalysisLoader } from "@/components/ui/loader";
import { useAudio } from "@/hooks/use-audio";
import { REGIONS_DATA, CROPS_DATA } from "@/utils/agriculture-data";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import {
  Droplets,
  Sprout,
  TrendingUp,
  Activity,
  Calendar,
  Layers,
  Send,
  Sparkles,
  MapPin,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  Compass,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  FileDown,
  CloudSun,
  Wind,
  CloudRain,
  Trash2
} from "lucide-react";

// Dynamic import of Leaflet Map to avoid SSR failures
const MapView = dynamic(() => import("@/components/map/map-view"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] flex items-center justify-center bg-slate-100 dark:bg-slate-900/60 rounded-2xl animate-pulse">
      <span className="text-sm text-slate-500">{"Xarita yuklanmoqda..."}</span>
    </div>
  ),
});

interface WateringReport {
  shouldWater: boolean;
  nextWatering: string;
  recommendedVolumeLiters: number;
  waterSavingPotential: number;
  riskLevel: string;
  aiRaisonDtre: string;
  metaCropType?: string;
  metaAreaSize?: string;
  metaRegion?: string;
  metaDistrict?: string;
  metaLatitude?: string;
  metaLongitude?: string;
}

interface CropReport {
  disease: string;
  riskLevel: string;
  confidence: number;
  recommendations: string[];
  description: string;
  metaCropType?: string;
}

interface WeatherReport {
  temp: number;
  rainChance: number;
  windSpeed: number;
  advice: string;
}

interface YieldReport {
  expectedYieldTons: number;
  confidenceScore: number;
  riskFactors: string[];
  yieldIncreaseRecommendations: string[];
}

// Pure helper function declared outside the component to satisfy React 19 compiler purity rule
function getRandomWindSpeed(): number {
  return Math.round(4 + Math.random() * 8);
}

const mockAnalyticsData = [
  { label: "Dush", consumption: 1200, savings: 15 },
  { label: "Se", consumption: 950, savings: 20 },
  { label: "Cho", consumption: 1400, savings: 10 },
  { label: "Pa", consumption: 1100, savings: 25 },
  { label: "Ju", consumption: 850, savings: 35 },
  { label: "Sha", consumption: 1300, savings: 12 },
  { label: "Yak", consumption: 750, savings: 40 },
];

const REGION_COORDINATES: Record<string, { lat: string; lng: string }> = {
  "Toshkent shahri": { lat: "41.311081", lng: "69.240562" },
  "Toshkent viloyati": { lat: "41.2213", lng: "69.2246" },
  "Sirdaryo": { lat: "40.5011", lng: "68.7772" },
  "Samarqand": { lat: "39.6542", lng: "66.9597" },
  "Jizzax": { lat: "40.1158", lng: "67.8422" },
  "Buxoro": { lat: "39.7747", lng: "64.4286" },
  "Navoiy": { lat: "40.0844", lng: "65.3792" },
  "Qashqadaryo": { lat: "38.8612", lng: "65.7847" },
  "Surxondaryo": { lat: "37.2242", lng: "67.2783" },
  "Andijon": { lat: "40.7821", lng: "72.3442" },
  "Namangan": { lat: "40.9983", lng: "71.6726" },
  "Farg‘ona": { lat: "40.3864", lng: "71.7864" },
  "Xorazm": { lat: "41.5569", lng: "60.6306" },
  "Qoraqalpog‘iston Respublikasi": { lat: "42.4603", lng: "59.6122" },
};

function mapNominatimToRegion(stateName: string = ""): string {
  const norm = stateName.toLowerCase();
  if (norm.includes("tashkent") || norm.includes("toshkent")) {
    if (norm.includes("shahar") || norm.includes("city")) return "Toshkent shahri";
    return "Toshkent viloyati";
  }
  if (norm.includes("sirdaryo") || norm.includes("syrdarya")) return "Sirdaryo";
  if (norm.includes("samarqand") || norm.includes("samarkand")) return "Samarqand";
  if (norm.includes("jizzax") || norm.includes("jizzakh")) return "Jizzax";
  if (norm.includes("buxoro") || norm.includes("bukhara")) return "Buxoro";
  if (norm.includes("navoiy") || norm.includes("navoi")) return "Navoiy";
  if (norm.includes("qashqadaryo") || norm.includes("kashkadarya")) return "Qashqadaryo";
  if (norm.includes("surxondaryo") || norm.includes("surkhandarya")) return "Surxondaryo";
  if (norm.includes("andijon") || norm.includes("andijan")) return "Andijon";
  if (norm.includes("namangan")) return "Namangan";
  if (norm.includes("farg") || norm.includes("fergana")) return "Farg‘ona";
  if (norm.includes("xorazm") || norm.includes("khorezm")) return "Xorazm";
  if (norm.includes("qoraqalpog") || norm.includes("karakalpakstan")) return "Qoraqalpog‘iston Respublikasi";
  
  return "Buxoro"; // Default fallback
}

export default function Dashboard() {
  const { playClick, playSuccess, playError, playNotification } = useAudio();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Coordinates & GPS Locating
  const [latitude, setLatitude] = useState("41.311081");
  const [longitude, setLongitude] = useState("69.240562");
  const [isGPSLocating, setIsGPSLocating] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState("");

  // Dynamic dashboard overview metrics states
  const [waterEfficiency, setWaterEfficiency] = useState(94.2);
  const [moistureLevel, setMoistureLevel] = useState(48.5);
  const [droughtRisk, setDroughtRisk] = useState(15);
  const [overallYieldForecast, setOverallYieldForecast] = useState(88.4);

  // Smart Watering Form State
  const [cropType, setCropType] = useState("Paxta");
  const [areaSize, setAreaSize] = useState("12");
  const [lastWatered, setLastWatered] = useState("");

  // Watering Report State
  const [isWaterAnalyzing, setIsWaterAnalyzing] = useState(false);
  const [waterLoaderStep, setWaterLoaderStep] = useState(0);
  const [showWaterReport, setShowWaterReport] = useState(false);
  const [wateringReport, setWateringReport] = useState<WateringReport | null>(null);

  // Crop Analysis Upload State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cropTypeAnalysis, setCropTypeAnalysis] = useState("Bug‘doy");
  const [isCropAnalyzing, setIsCropAnalyzing] = useState(false);
  const [cropLoaderStep, setCropLoaderStep] = useState(0);
  const [showCropReport, setShowCropReport] = useState(false);
  const [cropReport, setCropReport] = useState<CropReport | null>(null);

  // AI Chat State
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      role: "ai",
      text: "Assalomu alaykum! Men AquaMind AI agronom yordamchisiman. Fermerligingiz, ekinlar kasalliklari yoki sug'orish bo'yicha qanday maslahat kerak?",
      time: "12:00"
    }
  ]);
  const [isChatTyping, setIsChatTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isChatTyping, activeTab]);

  // Ob-havo (AI Weather Analysis) State
  const [weatherAdvice, setWeatherAdvice] = useState<string>("Buxoro viloyatida bugun havo ochiq va issiq. Sug'orishni kechki tungi soatlarda tomchilatib bajarish tavsiya qilinadi.");
  const [isWeatherAnalyzing, setIsWeatherAnalyzing] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherReport>({
    temp: 36,
    rainChance: 10,
    windSpeed: 5,
    advice: ""
  });

  // Hosildorlik Prognozi (AI Crop Yield) State
  const [yieldCropType, setYieldCropType] = useState("Paxta");
  const [yieldArea, setYieldArea] = useState("12");
  const [yieldHealth, setYieldHealth] = useState("Yaxshi (Stressiz)");
  const [yieldReport, setYieldReport] = useState<YieldReport | null>(null);
  const [isYieldAnalyzing, setIsYieldAnalyzing] = useState(false);

  // IoT Valve States
  const [valves, setValves] = useState([
    { id: 1, name: "G'arbiy hudud (Valf 1)", open: true, flow: 22.4 },
    { id: 2, name: "Janubiy hudud (Valf 2)", open: false, flow: 0.0 },
    { id: 3, name: "Tomchilatib sug'orish (Valf 3)", open: true, flow: 18.2 }
  ]);

  // Toast State
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    visible: boolean;
  }>({
    message: "",
    type: "info",
    visible: false
  });

  const triggerToast = useCallback((message: string, type: "success" | "error" | "info") => {
    setToast({ message, type, visible: true });
    if (type === "success") playSuccess();
    else if (type === "error") playError();
    else playNotification();

    // Auto close toast after 4s
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4000);
  }, [playSuccess, playError, playNotification]);

  // Region and District State (Uzbekistan Regions Data)
  const [region, setRegion] = useState("Buxoro");
  const [district, setDistrict] = useState("Kogon");
  const [districtsList, setDistrictsList] = useState<string[]>(REGIONS_DATA["Buxoro"].districts);

  // OpenStreetMap Reverse Geocoding Callback
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const res = await fetch(url, {
        headers: {
          "Accept-Language": "uz,ru,en"
        }
      });
      if (!res.ok) throw new Error("OSM Nominatim API error");
      const data = await res.json();
      
      if (data && data.address) {
        const addr = data.address;
        const state = addr.state || addr.region || "";
        const county = addr.county || addr.district || addr.city_district || "";
        const city = addr.city || addr.town || addr.village || addr.suburb || "";
        
        const mappedReg = mapNominatimToRegion(state);
        
        let displayAddr = "";
        if (county) displayAddr += `${county}, `;
        if (city && city !== county) displayAddr += `${city}, `;
        displayAddr += mappedReg;

        setRegion(mappedReg);
        
        if (REGIONS_DATA[mappedReg]) {
          const defaultData = REGIONS_DATA[mappedReg];
          const list = defaultData.districts;
          setDistrictsList(list);
          
          if (county) {
            const cleanCounty = county.replace(" tumani", "").replace(" District", "").trim();
            const match = list.find(d => d.toLowerCase().includes(cleanCounty.toLowerCase()));
            setDistrict(match || list[0] || "");
          } else {
            setDistrict(list[0] || "");
          }

          // Compute dynamic overview metrics based on scarcity
          let efficiency = 95.0;
          let moisture = 55.0;
          let risk = 12;
          let yieldEstimate = 88.0;

          if (defaultData.waterScarcityLevel === "Critical") {
            efficiency = 74.5;
            moisture = 28.2;
            risk = 89;
            yieldEstimate = 71.2;
          } else if (defaultData.waterScarcityLevel === "High") {
            efficiency = 84.1;
            moisture = 36.8;
            risk = 62;
            yieldEstimate = 81.5;
          } else if (defaultData.waterScarcityLevel === "Medium") {
            efficiency = 91.4;
            moisture = 44.5;
            risk = 35;
            yieldEstimate = 89.6;
          } else {
            efficiency = 96.8;
            moisture = 52.1;
            risk = 14;
            yieldEstimate = 94.2;
          }

          setWaterEfficiency(efficiency);
          setMoistureLevel(moisture);
          setDroughtRisk(risk);
          setOverallYieldForecast(yieldEstimate);
          
          const simulatedRain = defaultData.waterScarcityLevel === "Critical" ? 5 : defaultData.waterScarcityLevel === "High" ? 15 : 45;
          setWeatherData({
            temp: defaultData.averageTempSummer,
            rainChance: simulatedRain,
            windSpeed: getRandomWindSpeed(),
            advice: defaultData.wateringAdvice
          });
          setWeatherAdvice(defaultData.wateringAdvice);
        }
        
        setResolvedAddress(displayAddr);

        // Save to localStorage
        localStorage.setItem("aquamind_lat", lat.toString());
        localStorage.setItem("aquamind_lng", lng.toString());
        localStorage.setItem("aquamind_region", mappedReg);
        localStorage.setItem("aquamind_address", displayAddr);
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    }
  }, []);

  const handleRegionChange = (val: string) => {
    setRegion(val);
    if (REGIONS_DATA[val]) {
      const list = REGIONS_DATA[val].districts;
      setDistrictsList(list);
      setDistrict(list[0] || "");
      
      const defaultData = REGIONS_DATA[val];
      const simulatedRain = defaultData.waterScarcityLevel === "Critical" ? 5 : defaultData.waterScarcityLevel === "High" ? 15 : 45;
      setWeatherData({
        temp: defaultData.averageTempSummer,
        rainChance: simulatedRain,
        windSpeed: getRandomWindSpeed(),
        advice: defaultData.wateringAdvice
      });
      setWeatherAdvice(defaultData.wateringAdvice);

      // Pan the map to the selected region center coordinates
      const coords = REGION_COORDINATES[val];
      if (coords) {
        setLatitude(coords.lat);
        setLongitude(coords.lng);
        setResolvedAddress(`${val} viloyati`);
      }

      // Compute dynamic metrics based on scarcity
      let efficiency = 95.0;
      let moisture = 55.0;
      let risk = 12;
      let yieldEstimate = 88.0;

      if (defaultData.waterScarcityLevel === "Critical") {
        efficiency = 74.5;
        moisture = 28.2;
        risk = 89;
        yieldEstimate = 71.2;
      } else if (defaultData.waterScarcityLevel === "High") {
        efficiency = 84.1;
        moisture = 36.8;
        risk = 62;
        yieldEstimate = 81.5;
      } else if (defaultData.waterScarcityLevel === "Medium") {
        efficiency = 91.4;
        moisture = 44.5;
        risk = 35;
        yieldEstimate = 89.6;
      } else {
        efficiency = 96.8;
        moisture = 52.1;
        risk = 14;
        yieldEstimate = 94.2;
      }

      setWaterEfficiency(efficiency);
      setMoistureLevel(moisture);
      setDroughtRisk(risk);
      setOverallYieldForecast(yieldEstimate);
    }
  };

  // Sync coordinates, drawn fields, and check Geolocation on Mount
  useEffect(() => {
    const handleMapClick = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { lat, lng } = customEvent.detail;
      setLatitude(lat);
      setLongitude(lng);
      triggerToast(`Xaritadan yangi koordinatalar belgilandi: ${lat}, ${lng}`, "info");
      
      // Resolve name dynamically
      reverseGeocode(parseFloat(lat), parseFloat(lng));
    };

    const handleFieldDrawn = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { areaHectares, lat, lng } = customEvent.detail;
      setLatitude(lat);
      setLongitude(lng);
      setAreaSize(areaHectares);
      setYieldArea(areaHectares);
      triggerToast(`Yangi maydon chegarasi chizildi! Maydoni: ${areaHectares} Ha`, "success");
      
      reverseGeocode(parseFloat(lat), parseFloat(lng));
    };

    window.addEventListener("map-click", handleMapClick);
    window.addEventListener("field-drawn", handleFieldDrawn);

    // Initial Geolocation setup
    const savedLat = localStorage.getItem("aquamind_lat");
    const savedLng = localStorage.getItem("aquamind_lng");
    const savedRegion = localStorage.getItem("aquamind_region");
    const savedAddress = localStorage.getItem("aquamind_address");

    if (savedLat && savedLng && savedRegion) {
      setTimeout(() => {
        setLatitude(savedLat);
        setLongitude(savedLng);
        setRegion(savedRegion);
        setResolvedAddress(savedAddress || `${savedRegion} viloyati`);
        
        if (REGIONS_DATA[savedRegion]) {
          const defaultData = REGIONS_DATA[savedRegion];
          setDistrictsList(defaultData.districts);
          
          let efficiency = 95.0;
          let moisture = 55.0;
          let risk = 12;
          let yieldEstimate = 88.0;

          if (defaultData.waterScarcityLevel === "Critical") {
            efficiency = 74.5;
            moisture = 28.2;
            risk = 89;
            yieldEstimate = 71.2;
          } else if (defaultData.waterScarcityLevel === "High") {
            efficiency = 84.1;
            moisture = 36.8;
            risk = 62;
            yieldEstimate = 81.5;
          } else if (defaultData.waterScarcityLevel === "Medium") {
            efficiency = 91.4;
            moisture = 44.5;
            risk = 35;
            yieldEstimate = 89.6;
          } else {
            efficiency = 96.8;
            moisture = 52.1;
            risk = 14;
            yieldEstimate = 94.2;
          }

          setWaterEfficiency(efficiency);
          setMoistureLevel(moisture);
          setDroughtRisk(risk);
          setOverallYieldForecast(yieldEstimate);
        }
      }, 0);
    } else {
      // Auto prompt Geolocation perm on mount
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude: lat, longitude: lng } = position.coords;
            setTimeout(() => {
              setLatitude(lat.toFixed(6));
              setLongitude(lng.toFixed(6));
            }, 0);
            triggerToast("GPS joylashuv aniqlandi, manzil tahlil qilinmoqda...", "info");
            await reverseGeocode(lat, lng);
          },
          (error) => {
            console.warn("Geolocation permission error or rejected:", error);
            setTimeout(() => {
              setResolvedAddress("Buxoro viloyati, Kogon");
            }, 0);
          }
        );
      } else {
        setTimeout(() => {
          setResolvedAddress("Buxoro viloyati, Kogon");
        }, 0);
      }
    }

    return () => {
      window.removeEventListener("map-click", handleMapClick);
      window.removeEventListener("field-drawn", handleFieldDrawn);
    };
  }, [triggerToast, reverseGeocode]);

  // Geolocation detector via button
  const handleGPSLocate = () => {
    if (!navigator.geolocation) {
      triggerToast("GPS aniqlash brauzeringiz tomonidan qo'llab-quvvatlanmaydi.", "error");
      return;
    }

    setIsGPSLocating(true);
    triggerToast("GPS joylashuvingiz aniqlanmoqda...", "info");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        const latStr = lat.toFixed(6);
        const lngStr = lng.toFixed(6);
        setLatitude(latStr);
        setLongitude(lngStr);
        setIsGPSLocating(false);
        triggerToast("GPS joylashuv muvaffaqiyatli aniqlandi!", "success");
        await reverseGeocode(lat, lng);
      },
      (error) => {
        console.error(error);
        setIsGPSLocating(false);
        triggerToast("GPS aniqlashda xatolik yuz berdi. Iltimos, xaritadan tanlang.", "error");
      }
    );
  };

  // Voice Assistant Settings
  const [isListening, setIsListening] = useState(false);
  const [voiceActive, setVoiceActive] = useState(true);

  // Speech Synthesizer
  const speakText = (text: string) => {
    if (!voiceActive || typeof window === "undefined" || !window.speechSynthesis) return;

    // Cancel currently spoken speech
    window.speechSynthesis.cancel();

    // Remove markdown
    const cleanText = text.replace(/[*#`_\-]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Choose appropriate voice: Prioritize uz-UZ, then tr-TR, then ru-RU
    const voices = window.speechSynthesis.getVoices();
    let uzVoice = voices.find(v => v.lang.startsWith("uz") || v.lang.toLowerCase() === "uz-uz");
    if (!uzVoice) {
      uzVoice = voices.find(v => v.lang.startsWith("tr") || v.lang.toLowerCase() === "tr-tr");
    }
    if (!uzVoice) {
      uzVoice = voices.find(v => v.lang.startsWith("ru") || v.lang.toLowerCase() === "ru-ru");
    }
    if (uzVoice) {
      utterance.voice = uzVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Speech Recognition listener
  const toggleListening = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      triggerToast("Sizning brauzeringiz ovozli yozishni qo'llab-quvvatlamaydi. Iltimos Chrome ishlating.", "error");
      return;
    }

    if (isListening) {
      const rec = (window as any)._recognitionInstance;
      if (rec) rec.stop();
      setIsListening(false);
      playClick();
      return;
    }

    playClick();
    const recognition = new SpeechRecognition();
    recognition.lang = "uz-UZ";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      triggerToast("Ovozli buyruq tizimi faol, gapiring...", "info");
      (window as any)._recognitionInstance = recognition;
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      triggerToast(`Ovoz aniqlandi: "${speechToText}"`, "success");
      
      if (activeTab === "agronomist") {
        setChatMessage("");
        // Pass textOverride directly to handleSendMessage to submit immediately
        handleSendMessage(speechToText);
      } else {
        setChatMessage(speechToText);
      }
    };

    recognition.onerror = (event: any) => {
      console.error(event);
      setIsListening(false);
      triggerToast("Ovoz yozishda xatolik yuz berdi.", "error");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleToggleValve = (id: number) => {
    playClick();
    setValves(prev => prev.map(valve => {
      if (valve.id === id) {
        const nextOpen = !valve.open;
        triggerToast(`${valve.name} muvaffaqiyatli ${nextOpen ? "ochildi" : "yopildi"}!`, "success");
        return {
          ...valve,
          open: nextOpen,
          flow: nextOpen ? parseFloat((15 + Math.random() * 10).toFixed(1)) : 0.0
        };
      }
      return valve;
    }));
  };

  // Form states and reports relocated to the top of the component to prevent early access checks

  // Synchronized via handleRegionChange callback

  // Action: Smart Watering Analysis API Query
  const handleWaterAnalyze = async () => {
    setIsWaterAnalyzing(true);
    setWaterLoaderStep(0);
    setShowWaterReport(false);

    let progressInterval: NodeJS.Timeout | null = null;
    let apiCompleted = false;
    let apiData: WateringReport | null = null;
    let apiError: string | null = null;

    progressInterval = setInterval(() => {
      setWaterLoaderStep((prev) => {
        if (prev < waterLoaderSteps.length - 1) {
          playNotification();
          return prev + 1;
        } else {
          if (progressInterval) clearInterval(progressInterval);
          
          const checkCompletion = setInterval(() => {
            if (apiCompleted) {
              clearInterval(checkCompletion);
              setIsWaterAnalyzing(false);
              
              if (apiError) {
                triggerToast(apiError, "error");
              } else if (apiData) {
                const reportWithMeta = {
                  ...apiData,
                  metaCropType: cropType,
                  metaAreaSize: areaSize,
                  metaRegion: region,
                  metaDistrict: district,
                  metaLatitude: latitude,
                  metaLongitude: longitude
                };
                setWateringReport(reportWithMeta);
                setShowWaterReport(true);
                triggerToast("Sug'orish rejasi muvaffaqiyatli hisoblandi!", "success");
                speakText(`Tashkil qilingan sug'orish rejasi muvaffaqiyatli tuzildi. Navbatdagi sug'orish sanasi ${apiData.nextWatering}.`);
              }
            }
          }, 200);

          return prev;
        }
      });
    }, 900);

    try {
      const response = await fetch("/api/watering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropType,
          areaSize,
          lastWatered,
          region
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Tahlil qilishda xatolik yuz berdi");
      }
      apiData = data;
    } catch (err: any) {
      console.error(err);
      apiError = err.message || "Tahlilda xatolik";
    } finally {
      apiCompleted = true;
    }
  };

  // Action: Crop Leaf Gemini Vision analysis API Query
  const handleCropAnalyze = async () => {
    if (!selectedImage) {
      triggerToast("Iltimos, ekin bargining suratini yuklang!", "error");
      return;
    }

    setIsCropAnalyzing(true);
    setCropLoaderStep(0);
    setShowCropReport(false);

    let progressInterval: NodeJS.Timeout | null = null;
    let apiCompleted = false;
    let apiData: CropReport | null = null;
    let apiError: string | null = null;

    progressInterval = setInterval(() => {
      setCropLoaderStep((prev) => {
        if (prev < cropLoaderSteps.length - 1) {
          playNotification();
          return prev + 1;
        } else {
          if (progressInterval) clearInterval(progressInterval);

          const checkCompletion = setInterval(() => {
            if (apiCompleted) {
              clearInterval(checkCompletion);
              setIsCropAnalyzing(false);
              
              if (apiError) {
                triggerToast(apiError, "error");
              } else if (apiData) {
                const reportWithMeta = {
                  ...apiData,
                  metaCropType: cropTypeAnalysis
                };
                setCropReport(reportWithMeta);
                setShowCropReport(true);
                triggerToast("Ekin diagnostikasi yakunlandi!", "success");
                speakText(`Ekin bargi diagnostikasi yakunlandi. Aniqlangan kasallik: ${apiData.disease}.`);
              }
            }
          }, 200);

          return prev;
        }
      });
    }, 900);

    try {
      const response = await fetch("/api/crop-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: selectedImage,
          cropType: cropTypeAnalysis
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Tasvir tahlilida xatolik yuz berdi");
      }
      apiData = data;
    } catch (err: any) {
      console.error(err);
      apiError = err.message || "Tahlil jarayonida xatolik";
    } finally {
      apiCompleted = true;
    }
  };

  // Action: AI Weather Analysis API Call
  const handleWeatherAIAdvice = async () => {
    setIsWeatherAnalyzing(true);
    playClick();

    try {
      const response = await fetch("/api/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region,
          temp: weatherData.temp,
          rainChance: weatherData.rainChance,
          windSpeed: weatherData.windSpeed
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "API error");

      setWeatherAdvice(data.advice);
      triggerToast("AI Ob-havo maslahati yangilandi!", "success");
      speakText(data.advice);
    } catch (err: any) {
      console.error(err);
      triggerToast("Weather AI tahlilida xatolik yuz berdi", "error");
    } finally {
      setIsWeatherAnalyzing(false);
    }
  };

  // Action: AI Crop Yield Forecast API Call
  const handleYieldForecast = async () => {
    setIsYieldAnalyzing(true);
    playClick();

    try {
      const response = await fetch("/api/yield-forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropType: yieldCropType,
          region,
          areaSize: yieldArea,
          healthStatus: yieldHealth
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "API error");

      setYieldReport(data);
      triggerToast("AI Hosil prognozi hisoblandi!", "success");
      speakText(`Dalangizdan kutilayotgan umumiy hosildorlik: ${data.expectedYieldTons} tonna. Ishonchlilik darajasi ${data.confidenceScore} foiz.`);
    } catch (err: any) {
      console.error(err);
      triggerToast("Hosil prognozini hisoblab bo'lmadi.", "error");
    } finally {
      setIsYieldAnalyzing(false);
    }
  };

  // Action: AI Chat Query
  const handleSendMessage = async (textOverride?: string) => {
    const messageToSend = textOverride || chatMessage;
    if (!messageToSend.trim()) return;

    const userMsg = {
      role: "user",
      text: messageToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    const currentMsg = messageToSend;
    if (!textOverride) {
      setChatMessage("");
    }
    setIsChatTyping(true);
    playClick();

    try {
      const response = await fetch("/api/agronomist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: updatedHistory,
          message: currentMsg
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Chat xatosi");
      }

      setChatHistory([
        ...updatedHistory,
        {
          role: "ai",
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      triggerToast("AI Agronomdan yangi javob!", "info");
      speakText(data.reply);
    } catch (err: any) {
      console.error(err);
      triggerToast("AI bilan bog'lanishda xatolik", "error");
    } finally {
      setIsChatTyping(false);
    }
  };

  const handleClearChat = () => {
    playClick();
    setChatHistory([
      {
        role: "ai",
        text: "Assalomu alaykum! Men AquaMind AI agronom yordamchisiman. Fermerligingiz, ekinlar kasalliklari yoki sug'orish bo'yicha qanday maslahat kerak?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    triggerToast("Chat tarixi tozalandi", "info");
  };

  // Helper to clean up text for jsPDF to prevent crashes on unicode characters (e.g. Uzbek quotes, Cyrillic, emojis)
  const cleanTextForPDF = (text: string | undefined | null): string => {
    if (!text) return "";
    
    // Transliterate Cyrillic to Latin if any
    const cyrillicToLatin: Record<string, string> = {
      'А': 'A', 'а': 'a', 'Б': 'B', 'б': 'b', 'В': 'V', 'в': 'v', 'Г': 'G', 'г': 'g',
      'Д': 'D', 'д': 'd', 'Е': 'E', 'е': 'e', 'Ё': 'Yo', 'ё': 'yo', 'Ж': 'J', 'ж': 'j',
      'З': 'Z', 'з': 'z', 'И': 'I', 'и': 'i', 'Й': 'Y', 'й': 'y', 'К': 'K', 'к': 'k',
      'Л': 'L', 'л': 'l', 'М': 'M', 'м': 'm', 'Н': 'N', 'н': 'n', 'О': 'O', 'о': 'o',
      'П': 'P', 'п': 'p', 'Р': 'R', 'р': 'r', 'С': 'S', 'с': 's', 'Т': 'T', 'т': 't',
      'У': 'U', 'у': 'u', 'Ф': 'F', 'ф': 'f', 'Х': 'X', 'х': 'x', 'Ц': 'Ts', 'ц': 'ts',
      'Ч': 'Ch', 'ч': 'ch', 'Ш': 'Sh', 'ш': 'sh', 'Щ': 'Shch', 'щ': 'shch', 'Ъ': '', 'ъ': '',
      'Ы': 'I', 'ы': 'i', 'Ь': '', 'ь': '', 'Э': 'E', 'э': 'e', 'Ю': 'Yu', 'ю': 'yu', 'Я': 'Ya', 'я': 'ya',
      'Ў': "O'", 'ў': "o'", 'Қ': 'Q', 'қ': 'q', 'Ғ': "G'", 'ғ': "g'", 'Ҳ': 'H', 'ҳ': 'h'
    };
    
    let cleaned = text.split('').map(char => cyrillicToLatin[char] || char).join('');
    
    // Clean quotes, dashes, and other typical non-CP1252 characters
    cleaned = cleaned
      .replace(/[\u2018\u2019\u02bb\u02bc\u0060\u00b4]/g, "'") // single quotes, modifiers, backticks, accents
      .replace(/[\u201c\u201d]/g, '"') // curly double quotes
      .replace(/[\u2013\u2014]/g, "-") // dashes
      .replace(/\u200b/g, ""); // zero-width space
      
    // Strip emojis and any other character outside the standard CP1252 range
    return cleaned.replace(/[^\x00-\x7F]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 160 && code <= 255) {
        return char;
      }
      return ""; // strip everything else (emojis, unsupported unicode symbols)
    });
  };

  // PDF Download Trigger
  const handleDownloadPDF = (type: "watering" | "crop" | "esg") => {
    playClick();
    
    try {
      const doc = new jsPDF();
      
      // Theme colors definitions [R, G, B]
      const colors = {
        primary: type === "watering" ? [6, 182, 212] : type === "crop" ? [239, 68, 68] : [16, 185, 129], // cyan vs red vs emerald
        darkSlate: [15, 23, 42],
        lightGrey: [248, 250, 252],
        borderGrey: [226, 232, 240],
        textDark: [30, 41, 59],
        textMuted: [100, 116, 139]
      };
      
      // Page drawing helpers
      const drawHeader = (docTitle: string) => {
        // Dark header block
        doc.setFillColor(colors.darkSlate[0], colors.darkSlate[1], colors.darkSlate[2]); 
        doc.rect(0, 0, 210, 40, "F");
        
        // Brand logo decoration
        doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.rect(15, 12, 4, 16, "F");
        
        doc.setTextColor(255, 255, 255);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(18);
        doc.text("AquaMind AI", 24, 20);
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(150, 180, 220);
        doc.text(cleanTextForPDF(docTitle), 24, 28);
        
        // Date and Time on top right
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Chop etilgan sana: ${new Date().toLocaleString()}`, 145, 25);
        
        // Thin accent line below header
        doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.rect(0, 40, 210, 2, "F");
      };
      
      const drawFooter = () => {
        doc.setFillColor(241, 245, 249);
        doc.rect(0, 280, 210, 17, "F");
        
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("AquaMind AI - Suv tejash va ekin muhofazasi uchun professional agrotexnika hisoboti.", 20, 290);
        
        // Page border
        doc.setDrawColor(colors.borderGrey[0], colors.borderGrey[1], colors.borderGrey[2]);
        doc.setLineWidth(0.5);
        doc.rect(5, 5, 200, 287);
      };
      
      const drawSectionTitle = (title: string, yPos: number) => {
        // Bullet
        doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.roundedRect(15, yPos - 4, 4, 6, 1, 1, "F");
        
        // Text
        doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(12);
        doc.text(cleanTextForPDF(title), 24, yPos);
        
        // Underline
        doc.setDrawColor(colors.borderGrey[0], colors.borderGrey[1], colors.borderGrey[2]);
        doc.setLineWidth(0.5);
        doc.line(15, yPos + 3, 195, yPos + 3);
      };

      if (type === "watering" && wateringReport) {
        drawHeader("AQLLI SUG'ORISH VA IQLIM TAHLILI");
        
        let y = 55;
        
        // Section 1: Dala va Iqlim ma'lumotlari
        drawSectionTitle("1. DALA VA REGIONAL IQLIM MA'LUMOTLARI", y);
        y += 10;
        
        // Light Card for inputs
        doc.setFillColor(colors.lightGrey[0], colors.lightGrey[1], colors.lightGrey[2]);
        doc.roundedRect(15, y, 180, 52, 2, 2, "F");
        doc.setDrawColor(colors.borderGrey[0], colors.borderGrey[1], colors.borderGrey[2]);
        doc.setLineWidth(0.3);
        doc.roundedRect(15, y, 180, 52, 2, 2, "S");
        
        // Fetch detailed data from db
        const selectedRegionData = REGIONS_DATA[wateringReport.metaRegion || region] || REGIONS_DATA["Buxoro"];
        const selectedCropData = CROPS_DATA[wateringReport.metaCropType || cropType] || CROPS_DATA["Paxta"];
        
        doc.setFontSize(9.5);
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
        
        doc.text(cleanTextForPDF(`Ekin turi: ${wateringReport.metaCropType || cropType}`), 22, y + 8);
        doc.text(cleanTextForPDF(`Ekin maydoni: ${wateringReport.metaAreaSize || areaSize} Hektar`), 22, y + 16);
        doc.text(cleanTextForPDF(`Hudud: ${wateringReport.metaRegion || region} viloyati, ${wateringReport.metaDistrict || district} tumani`), 22, y + 24);
        doc.text(cleanTextForPDF(`Dala koordinatalari: Latitude ${wateringReport.metaLatitude || latitude}, Longitude ${wateringReport.metaLongitude || longitude}`), 22, y + 32);
        
        // Sub-column of card: region details
        doc.text(cleanTextForPDF(`Tuproq turi: ${selectedRegionData.soilType}`), 115, y + 8);
        doc.text(cleanTextForPDF(`Iqlim turi: ${selectedRegionData.climateType}`), 115, y + 16);
        doc.text(cleanTextForPDF(`Yillik yog'ingarchilik: ${selectedRegionData.annualPrecipitationMm} mm`), 115, y + 24);
        doc.text(cleanTextForPDF(`Suv tanqisligi darajasi: ${selectedRegionData.waterScarcityLevel}`), 115, y + 32);
        
        // Ekin suv talabi description
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
        doc.setFontSize(8.5);
        doc.text(
          cleanTextForPDF(`* Ekinning mavsumiy suv talabi: ${selectedCropData.waterDemandLitersPerHectare.toLocaleString()} litr/gektar. Kutilayotgan hosil: ${selectedCropData.expectedYieldTonsPerHectare} t/ha.`),
          22, y + 43
        );
        doc.text(
          cleanTextForPDF(`* Tavsiya etilgan sug'orish oralig'i: ${selectedCropData.recommendedWateringIntervalDays} kun.`),
          22, y + 48
        );
        
        y += 62;
        
        // Section 2: AI Sug'orish rejasi
        drawSectionTitle("2. SUN'IY INTELLEKT TAQSIMOTI VA SUG'ORISH JADVALI", y);
        y += 10;
        
        // Primary stats table
        doc.setFillColor(colors.lightGrey[0], colors.lightGrey[1], colors.lightGrey[2]);
        doc.roundedRect(15, y, 180, 32, 2, 2, "F");
        doc.roundedRect(15, y, 180, 32, 2, 2, "S");
        
        // Draw vertical division lines inside table
        doc.line(75, y, 75, y + 32);
        doc.line(135, y, 135, y + 32);
        
        // Column 1: Next date
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
        doc.text("NAV BARDAGI SUG'ORISH", 20, y + 8);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]); // primary color
        doc.text(cleanTextForPDF(wateringReport.nextWatering), 20, y + 18);
        
        // Column 2: Volume
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
        doc.text("TAVSIYA ETILGAN SUV HAJMI", 80, y + 8);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(16, 185, 129); // emerald
        doc.text(`${wateringReport.recommendedVolumeLiters.toLocaleString()} Litr`, 80, y + 18);
        
        // Column 3: Savings
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
        doc.text("SUV TEJASH IMKONI YATI", 140, y + 8);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(6, 182, 212);
        doc.text(`${wateringReport.waterSavingPotential}% tejaladi`, 140, y + 18);
        
        // Status detail at bottom
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
        doc.text(
          cleanTextForPDF(`Ekin xavf darajasi: ${wateringReport.riskLevel || "Kam"} | Optimal sug'orish vaqti: Kechki yoki tungi soatlar`),
          20, y + 27
        );
        
        y += 42;
        
        // Section 3: AI Ilmiy tavsiyasi (Raison D'etre)
        drawSectionTitle("3. ILMIY AGRONOMIK TAVSIYA VA TAHLIL (AI)", y);
        y += 10;
        
        doc.setFillColor(colors.lightGrey[0], colors.lightGrey[1], colors.lightGrey[2]);
        doc.roundedRect(15, y, 180, 48, 2, 2, "F");
        doc.roundedRect(15, y, 180, 48, 2, 2, "S");
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
        
        const splitText = doc.splitTextToSize(cleanTextForPDF(wateringReport.aiRaisonDtre), 170);
        doc.text(splitText, 20, y + 8);
        
        y += 58;
        
        // Section 4: Mintaqaviy dehqonchilik tavsiyalari (Mavzuga oid ma'lumotlar)
        drawSectionTitle("4. MINTAQAVIY DEHQONCHILIK VA EKO-TAVSIYALAR", y);
        y += 10;
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
        
        // Point 1: Region specific advice
        doc.setFont("Helvetica", "bold");
        doc.text(cleanTextForPDF(`Mintaqa sug'orish tavsiyasi:`), 15, y);
        doc.setFont("Helvetica", "normal");
        const regionAdviceSplit = doc.splitTextToSize(cleanTextForPDF(selectedRegionData.wateringAdvice), 180);
        doc.text(regionAdviceSplit, 15, y + 5);
        y += 12 + (regionAdviceSplit.length * 3);
        
        // Point 2: Regional crop advice
        doc.setFont("Helvetica", "bold");
        doc.text(cleanTextForPDF(`Agrotexnik maslahat:`), 15, y);
        doc.setFont("Helvetica", "normal");
        const regionAgAdviceSplit = doc.splitTextToSize(cleanTextForPDF(selectedRegionData.agricultureAdvice), 180);
        doc.text(regionAgAdviceSplit, 15, y + 5);
        y += 12 + (regionAgAdviceSplit.length * 3);
        
        // Clean water saving bullet points at the bottom
        doc.setFont("Helvetica", "bold");
        doc.text("Umumiy suvni tejash texnologiyalari:", 15, y);
        doc.setFont("Helvetica", "normal");
        doc.text(cleanTextForPDF("- Mulchalash: Tuproq yuzasini plyonka yoki quruq o't bilan yopish bug'lanishni 30% kamaytiradi."), 15, y + 6);
        doc.text(cleanTextForPDF("- Yomg'irlatib sug'orish: G'alla ekinlarida suv yo'qotilishini 40% gacha tejaydi."), 15, y + 12);
        
        drawFooter();
        
      } else if (type === "crop" && cropReport) {
        drawHeader("EKIN KASALLIKLARI DIAGNOSTIKA HISOBOTI");
        
        let y = 55;
        
        // Section 1: Diagnostika natijalari
        drawSectionTitle("1. DIAGNOSTIKA VA STRESS TAFSILOTLARI", y);
        y += 10;
        
        doc.setFillColor(254, 242, 242); // very soft light red
        doc.roundedRect(15, y, 180, 48, 2, 2, "F");
        doc.setDrawColor(252, 165, 165); // light red border
        doc.setLineWidth(0.4);
        doc.roundedRect(15, y, 180, 48, 2, 2, "S");
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(185, 28, 28); // deep red
        
        doc.text(cleanTextForPDF(`Ekin turi: ${cropReport.metaCropType || cropTypeAnalysis}`), 22, y + 8);
        doc.text(cleanTextForPDF(`Aniqlangan kasallik/stress: ${cropReport.disease}`), 22, y + 17);
        doc.text(cleanTextForPDF(`Xavf darajasi: ${cropReport.riskLevel}`), 22, y + 26);
        doc.text(cleanTextForPDF(`Tashxis ishonchliligi (Gemini AI Vision): ${Math.round(cropReport.confidence * 100)}%`), 22, y + 35);
        
        // Sub-details from crop database if matches
        const activeCropData = CROPS_DATA[cropReport.metaCropType || cropTypeAnalysis] || CROPS_DATA["Paxta"];
        
        y += 58;
        
        // Section 2: Kasallikning ilmiy tavsifi
        drawSectionTitle("2. PATOLOGIK TAFSILOT VA TUSHUNTIRISH", y);
        y += 10;
        
        doc.setFillColor(colors.lightGrey[0], colors.lightGrey[1], colors.lightGrey[2]);
        doc.roundedRect(15, y, 180, 45, 2, 2, "F");
        doc.setDrawColor(colors.borderGrey[0], colors.borderGrey[1], colors.borderGrey[2]);
        doc.roundedRect(15, y, 180, 45, 2, 2, "S");
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
        
        const descSplit = doc.splitTextToSize(cleanTextForPDF(cropReport.description), 170);
        doc.text(descSplit, 20, y + 8);
        
        y += 55;
        
        // Section 3: Davolash va agronomik choralar
        drawSectionTitle("3. ZUDLIK BILAN AMALGA OSHIRILADIGAN CHORALAR", y);
        y += 10;
        
        // Draw recommendations list with bullet numbers inside colored cards
        cropReport.recommendations.forEach((rec, idx) => {
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(15, y, 180, 12, 1.5, 1.5, "F");
          doc.roundedRect(15, y, 180, 12, 1.5, 1.5, "S");
          
          doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
          doc.circle(22, y + 6, 3, "F");
          
          doc.setTextColor(255, 255, 255);
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(8);
          doc.text(`${idx + 1}`, 21, y + 8.5);
          
          doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(9);
          doc.text(cleanTextForPDF(rec), 28, y + 7.5);
          
          y += 15;
        });
        
        y += 5;
        
        // Section 4: Crop Disease Database details (Mavzuga oid boy ma'lumotlar)
        drawSectionTitle("4. BARCHA KASALLIKLAR MA'LUMOTLAR BAZASI VA PREVENTIV AGRONOMIYA", y);
        y += 10;
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
        
        doc.text(cleanTextForPDF(`Ushbu ekin (${activeCropData.name}) uchun tavsiya qilinadigan umumiy preventiv choralar:`), 15, y);
        y += 6;
        
        activeCropData.commonDiseases.forEach((disease) => {
          doc.setFont("Helvetica", "bold");
          doc.text(cleanTextForPDF(`- ${disease.name}:`), 15, y);
          doc.setFont("Helvetica", "normal");
          const diseaseSymSplit = doc.splitTextToSize(cleanTextForPDF(`Simptomlari: ${disease.symptoms}. Davolash: ${disease.treatment}`), 170);
          doc.text(diseaseSymSplit, 20, y + 5);
          y += 8 + (diseaseSymSplit.length * 3.5);
        });
        
        drawFooter();
        
      } else if (type === "esg" && wateringReport) {
        // Grand Eco Certificate formatting
        // Emerald border
        doc.setDrawColor(16, 185, 129); // Emerald
        doc.setLineWidth(1.5);
        doc.rect(5, 5, 200, 287); // Outer border
        
        // Gold border inner
        doc.setDrawColor(217, 119, 6); // Gold
        doc.setLineWidth(0.6);
        doc.rect(7, 7, 196, 283); // Inner gold border
        
        // Solid top header block
        doc.setFillColor(16, 185, 129); 
        doc.rect(7, 7, 196, 45, "F");
        
        // Seal and title inside block
        doc.setTextColor(255, 255, 255);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(22);
        doc.text("AQUAMIND AI - YASHIL DALA SERTIFIKATI", 15, 28);
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(209, 250, 229);
        doc.text("Ekologik Sug'orish va Suv Resurslarini Barqaror Boshqarish Kafolati", 15, 38);
        
        // Thick divider
        doc.setDrawColor(217, 119, 6); // Gold
        doc.setLineWidth(2.5);
        doc.line(7, 52, 203, 52);
        
        let y = 70;
        
        doc.setTextColor(30, 41, 59);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(12);
        doc.text(cleanTextForPDF("Ushbu ekologik yashil sertifikat ekin maydonida AquaMind AI tizimining"), 20, y);
        doc.text(cleanTextForPDF("aqlli va tejamkor sug'orish ko'rsatkichlari joriy qilinganligini tasdiqlaydi."), 20, y + 8);
        
        y += 25;
        
        // Large box for certification metrics
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(15, y, 180, 85, 3, 3, "F");
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(1);
        doc.roundedRect(15, y, 180, 85, 3, 3, "S");
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
        
        doc.text(cleanTextForPDF(`Fermerlik / Ekin Maydoni Joylashuvi:`), 25, y + 10);
        doc.setFont("Helvetica", "normal");
        doc.text(cleanTextForPDF(`${wateringReport.metaRegion || region} viloyati, ${wateringReport.metaDistrict || district} tumani`), 25, y + 16);
        
        doc.setFont("Helvetica", "bold");
        doc.text(cleanTextForPDF(`Ekin turi va maydoni:`), 25, y + 28);
        doc.setFont("Helvetica", "normal");
        doc.text(cleanTextForPDF(`${wateringReport.metaCropType || cropType} ekin turi, ${wateringReport.metaAreaSize || areaSize} Gektar  umumiy maydon`), 25, y + 34);
        
        // Draw division line in box
        doc.setDrawColor(226, 232, 240);
        doc.line(15, y + 42, 195, y + 42);
        
        // Highlight metrics: Water saved, efficiency, carbon offsets
        const savedLiters = wateringReport.recommendedVolumeLiters * (wateringReport.waterSavingPotential / 100);
        const carbonOffsetKg = savedLiters * 0.00015; // standard pump saving coefficient
        
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(16, 185, 129); // emerald
        doc.text(cleanTextForPDF(`Tejalgan suv hajmi: ${Math.round(savedLiters).toLocaleString()} Litr`), 25, y + 52);
        doc.text(cleanTextForPDF(`Suv tejash samaradorligi: ${wateringReport.waterSavingPotential}% kam suv sarflandi`), 25, y + 62);
        
        doc.setTextColor(217, 119, 6); // gold
        doc.text(cleanTextForPDF(`Energiya / Karbon Krediti: ${carbonOffsetKg.toFixed(2)} kg CO2e karbon emissiyasi kamaydi`), 25, y + 74);
        
        y += 100;
        
        // Detailed ESG Definition (Mavzuga oid boy ma'lumot)
        doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.text("BARQAROR RIVOJLANISH (ESG) ME'YORLARI:", 15, y);
        y += 8;
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
        
        doc.text(
          cleanTextForPDF("- E (ENVIRONMENTAL): Suv havzalarining qurishi (Orol dengizi havzasi) va tuproq sho'rlanishini"),
          15, y
        );
        doc.text(
          cleanTextForPDF("  kuchayishining oldini olish uchun ekinlar optimallashtirilgan hajmda sug'orildi."),
          15, y + 5
        );
        y += 12;
        
        doc.text(
          cleanTextForPDF("- S (SOCIAL): Mahalliy qishloq jamoalari va aholisining suv resurslariga bo'lgan ehtiyojlarini"),
          15, y
        );
        doc.text(
          cleanTextForPDF("  himoya qilish va ichimlik suvi zaxiralarini saqlab qolish ta'minlandi."),
          15, y + 5
        );
        y += 12;
        
        doc.text(
          cleanTextForPDF("- G (GOVERNANCE): Suv sarfi hisoboti datchiklar yordamida to'liq shaffoflashtirildi va klapanlarning"),
          15, y
        );
        doc.text(
          cleanTextForPDF("  ishlash vaqti raqamli monitoring orqali mustahkamlandi."),
          15, y + 5
        );
        y += 20;
        
        // Signature details
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
        doc.text("AquaMind AI Eco Board", 20, y + 10);
        doc.setFont("Helvetica", "normal");
        doc.text("Bosh auditor imzosi", 20, y + 15);
        doc.line(20, y + 8, 70, y + 8); // signature line
        
        // Stamp stamp visual
        doc.setDrawColor(16, 185, 129);
        doc.setLineWidth(1.5);
        doc.circle(165, y + 5, 20, "S");
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(16, 185, 129);
        doc.text("AQUAMIND", 152, y + 2);
        doc.text("ECO TRUST", 152, y + 8);
        
        // Stamp inner details
        doc.setFontSize(6);
        doc.text("UZBEKISTAN", 155, y + 15);
        
        drawFooter();
      }
      
      doc.save(type === "esg" ? `aquamind-esg-sertifikat.pdf` : `aquamind-${type}-hisobot.pdf`);
      triggerToast(type === "esg" ? "Yashil ESG sertifikati yuklab olindi!" : "PDF hisoboti muvaffaqiyatli yuklab olindi!", "success");
    } catch (err: any) {
      console.error(err);
      triggerToast("PDF hosil qilishda xatolik yuz berdi: " + err.message, "error");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        triggerToast("Rasm yuklandi. Tahlil qilishga tayyor!", "info");
      };
      reader.readAsDataURL(file);
    }
  };

  // Dynamic step titles for loading
  const waterLoaderSteps = [
    "Sun'iy yo'ldosh monitoring tizimiga ulanmoqda...",
    "Viloyat iqlim va harorat ma'lumotlari yuklanmoqda...",
    "Tuproq namligi va ekin vegetatsiya davri solishtirilmoqda...",
    "Optimal sug'orish va suv tejash hisoboti tuzilmoqda..."
  ];

  const cropLoaderSteps = [
    "Surat sifati va piksellar baholanmoqda...",
    "Gemini Vision tahlil moduli faollashtirilmoqda...",
    "Ekin bargidagi zararkunanda va mineral yetishmovchiligi tekshirilmoqda...",
    "Professional agronomik tavsiyalar shakllantirilmoqda..."
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070a13] text-slate-800 dark:text-slate-100 flex flex-col pt-16 relative overflow-hidden">
      
      {/* Background ambient glowing lights */}
      <div className="absolute top-24 left-1/4 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-24 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '12s' }} />
      
      {/* Top Navbar */}
      <Navbar showSidebarToggle={true} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Dashboard Layout */}
      <div className="flex flex-1 relative">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        {/* Dynamic tab contents viewport */}
        <main
          className={`flex-1 p-4 sm:p-8 transition-all duration-300 ${
            sidebarOpen ? "lg:pl-72" : "lg:pl-24"
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Boshqaruv Paneli
                      </h1>
                      <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 font-medium">
                        Salom, Fermer! AquaMind AI real-vaqt monitoring tizimi muvaffaqiyatli faol.
                      </span>
                    </div>

                    {/* Speech assistant mute controls */}
                    <div className="flex items-center gap-3 bg-white/40 dark:bg-slate-950/40 border border-white/40 dark:border-white/10 p-1.5 rounded-2xl backdrop-blur-md">
                      <button
                        onClick={() => {
                          playClick();
                          setVoiceActive(!voiceActive);
                        }}
                        className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                          voiceActive ? "bg-cyan-500 text-white shadow-sm" : "text-slate-400 dark:text-slate-500"
                        }`}
                        title={voiceActive ? "Ovozli agronom faol" : "Ovozli agronom o'chirilgan"}
                      >
                        {voiceActive ? <Volume2 size={18} /> : <VolumeX size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Summary metrics counts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                      title="Suv samaradorligi"
                      value={waterEfficiency}
                      suffix="%"
                      trend={{ value: waterEfficiency > 85 ? 4.8 : 8.5, isPositive: waterEfficiency > 85 }}
                      icon={<Droplets size={22} />}
                    />
                    <MetricCard
                      title="Namlik Ko'rsatkichi"
                      value={moistureLevel}
                      suffix="%"
                      trend={{ value: 1.2, isPositive: moistureLevel > 40 }}
                      icon={<Activity size={22} />}
                    />
                    <MetricCard
                      title="Qurg'oqchilik xavfi"
                      value={droughtRisk}
                      suffix="%"
                      trend={{ value: 8.5, isPositive: droughtRisk < 40 }}
                      icon={<AlertTriangle size={22} />}
                    />
                    <MetricCard
                      title="Hosil Prognozi"
                      value={overallYieldForecast}
                      suffix="%"
                      trend={{ value: 2.3, isPositive: true }}
                      icon={<TrendingUp size={22} />}
                    />
                  </div>

                  {/* Map tracking and Weather Panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* GIS tracking map */}
                    <div className="lg:col-span-2 flex flex-col gap-3">
                      <div className="flex items-center justify-between pl-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Xarita orqali datchiklar nazorati (Tanlash uchun bosing)
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                          <MapPin size={14} className="text-cyan-500" /> {resolvedAddress || `${district || "HQ"}, ${region}`}
                        </div>
                      </div>
                      <GlassCard hoverEffect={false} className="p-0 border-white/40 overflow-hidden shadow-md">
                        <MapView latitude={latitude} longitude={longitude} />
                      </GlassCard>

                      {/* IoT Smart Valves Card */}
                      <GlassCard className="border-cyan-500/10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-2">
                            <Activity size={18} className="text-cyan-500 animate-pulse" />
                            <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Aqlli Dala IoT Tizimi: Klapanlar Nazorati</h4>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 animate-pulse">
                            Tizim Aloqasi: Onlayn
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {valves.map((valve) => (
                            <div
                              key={valve.id}
                              className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between h-[110px] ${
                                valve.open
                                  ? "bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                                  : "bg-slate-100/40 dark:bg-slate-900/30 border-slate-200/50 dark:border-white/5"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-350 leading-tight">
                                  {valve.name}
                                </span>
                                <span className={`w-2 h-2 rounded-full ${valve.open ? "bg-emerald-500 animate-ping" : "bg-red-500"}`} />
                              </div>
                              <div className="flex justify-between items-center mt-4">
                                <div className="flex flex-col">
                                  <span className="text-[9px] text-slate-400 uppercase">Suv oqimi</span>
                                  <span className="text-xs font-black text-slate-800 dark:text-white">
                                    {valve.open ? `${valve.flow} L/min` : "0.0 L/min"}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleToggleValve(valve.id)}
                                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                                    valve.open
                                      ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20"
                                      : "bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-white/20"
                                  }`}
                                >
                                  {valve.open ? "Yopish" : "Ochish"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    </div>

                    {/* Integrated AI Weather Panel */}
                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">
                        AI Ob-havo Tahlili
                      </span>
                      <GlassCard className="flex flex-col gap-4 relative overflow-hidden h-full justify-between">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                          <CloudSun size={120} className="text-cyan-500" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CloudSun className="text-cyan-500" size={24} />
                            <span className="text-sm font-extrabold text-slate-800 dark:text-white">Hozirgi Ob-havo</span>
                          </div>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-500">
                            {region}
                          </span>
                        </div>

                        {/* Weather metrics row */}
                        {(() => {
                          const calculatedET = Math.round((weatherData.temp * 0.11 + weatherData.windSpeed * 0.12 + (100 - weatherData.rainChance) * 0.015) * 10) / 10;
                          return (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 my-2 border-y border-slate-100 dark:border-white/5 text-center">
                              <div className="flex flex-col">
                                <span className="text-[9px] text-slate-400 uppercase tracking-wider">Harorat</span>
                                <span className="text-sm font-black text-slate-800 dark:text-white mt-1">{weatherData.temp}°C</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[9px] text-slate-400 uppercase tracking-wider">Yomg'ir</span>
                                <span className="text-sm font-black text-cyan-500 mt-1 flex justify-center items-center gap-0.5">
                                  <CloudRain size={12} /> {weatherData.rainChance}%
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[9px] text-slate-400 uppercase tracking-wider">Shamol</span>
                                <span className="text-sm font-black text-emerald-500 mt-1 flex justify-center items-center gap-0.5">
                                  <Wind size={12} /> {weatherData.windSpeed}m/s
                                </span>
                              </div>
                              <div className="flex flex-col border-l border-slate-150 dark:border-white/10 pl-1 max-sm:border-l-0">
                                <span className="text-[9px] text-orange-400 uppercase tracking-wider">ET0 (Bug'lanish)</span>
                                <span className="text-sm font-black text-orange-500 mt-1" title="Daily Evapotranspiration score">
                                  {calculatedET}mm
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* AI Weather Advice box */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Ob-havo Tavsiyasi</span>
                            <button
                              onClick={handleWeatherAIAdvice}
                              disabled={isWeatherAnalyzing}
                              className="text-[10px] text-cyan-500 hover:text-cyan-400 font-bold transition cursor-pointer flex items-center gap-1"
                            >
                              <Sparkles size={10} /> {isWeatherAnalyzing ? "Yuklanmoqda..." : "Yangilash"}
                            </button>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-100/30 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/50 dark:border-white/5 min-h-[70px]">
                            {weatherAdvice}
                          </p>
                        </div>
                      </GlassCard>
                    </div>
                  </div>

                  {/* Yield Forecaster & Risk Gauge */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Dynamic crop yield forecaster */}
                    <div className="lg:col-span-2 flex flex-col gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">
                        AI Hosildorlik Prognozi (Hosil tahlilchisi)
                      </span>
                      <GlassCard className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                          <GlassSelect
                            label="Ekin turi"
                            value={yieldCropType}
                            onChange={(e) => setYieldCropType(e.target.value)}
                            options={Object.keys(CROPS_DATA).map(c => ({ value: c, label: c }))}
                          />
                          <GlassInput
                            label="Maydon (Ha)"
                            type="number"
                            value={yieldArea}
                            onChange={(e) => setYieldArea(e.target.value)}
                          />
                          <GlassSelect
                            label="Ekin Sog'ligi"
                            value={yieldHealth}
                            onChange={(e) => setYieldHealth(e.target.value)}
                            options={[
                              { value: "Yaxshi (Stressiz)", label: "Yaxshi (Stressiz)" },
                              { value: "Zang kasalligi xavfi", label: "Zang kasalligi xavfi" },
                              { value: "Qisman suvsizlik", label: "Qisman suvsizlik" }
                            ]}
                          />
                          <GlassButton
                            variant="primary"
                            onClick={handleYieldForecast}
                            disabled={isYieldAnalyzing}
                            className="py-3 px-2 text-xs font-bold w-full uppercase"
                            glow
                          >
                            <TrendingUp size={14} /> {isYieldAnalyzing ? "Prognozlash..." : "Hisoblash"}
                          </GlassButton>
                        </div>

                        {/* Yield output cards row */}
                        <AnimatePresence mode="wait">
                          {yieldReport && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-white/5 pt-4 mt-2"
                            >
                              <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 flex flex-col">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Kutilayotgan Hosildorlik</span>
                                <span className="text-xl font-black text-cyan-500 mt-1">{yieldReport.expectedYieldTons} tonna</span>
                                <span className="text-[9px] text-slate-500 mt-0.5">gektariga o'rtacha {Math.round(yieldReport.expectedYieldTons / parseFloat(yieldArea) * 10) / 10} t/ha</span>
                              </div>
                              <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 flex flex-col">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Ishonchlilik Darajasi</span>
                                <span className="text-xl font-black text-emerald-500 mt-1">{yieldReport.confidenceScore}%</span>
                              </div>
                              <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 flex flex-col">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Hosil Xavf Omili</span>
                                <span className="text-xs font-bold text-red-500 mt-1 truncate">{yieldReport.riskFactors[0] || "Past xavf darajasi"}</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </GlassCard>
                    </div>

                    {/* Risk Gauge dial */}
                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">
                        Monitoring Xavflari
                      </span>
                      <RiskGauge value={droughtRisk} label="Dalada Sho'rlanish va Evaporatsiya Xavfi" />
                    </div>
                  </div>

                  {/* Weekly SVG chart & ESG Dashboard widget */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <WaterChart title="Haftalik Sug'orish va Suv Tejash Diagrammasi" data={mockAnalyticsData} />
                    </div>
                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">
                        Ekologik ESG & Karbon Monitoringi
                      </span>
                      <GlassCard className="flex flex-col justify-between h-full min-h-[260px] border-emerald-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-emerald-500 font-extrabold text-sm">
                            <Sparkles size={16} className="animate-spin" style={{ animationDuration: '4s' }} />
                            <span>ESG Yashil Tizim</span>
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                            Sertifikatlangan
                          </span>
                        </div>

                        <div className="flex flex-col gap-3 my-2">
                          <div className="flex justify-between items-center bg-slate-100/40 dark:bg-slate-900/45 p-2.5 rounded-xl border border-slate-200/40 dark:border-white/5">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-slate-400 uppercase">Tejalgan Jami Suv</span>
                              <span className="text-sm font-black text-slate-800 dark:text-white">
                                {wateringReport ? `${Math.round(wateringReport.recommendedVolumeLiters * (wateringReport.waterSavingPotential / 100) * 8.5).toLocaleString()} L` : "24,500 L"}
                              </span>
                            </div>
                            <span className="text-[10px] font-extrabold text-emerald-500">+12% tejam</span>
                          </div>

                          <div className="flex justify-between items-center bg-slate-100/40 dark:bg-slate-900/45 p-2.5 rounded-xl border border-slate-200/40 dark:border-white/5">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-slate-400 uppercase">Karbon Krediti (Offset)</span>
                              <span className="text-sm font-black text-orange-500">
                                {wateringReport ? `${(wateringReport.recommendedVolumeLiters * (wateringReport.waterSavingPotential / 100) * 8.5 * 0.00015).toFixed(2)} kg CO2` : "3.68 kg CO2"}
                              </span>
                            </div>
                            <span className="text-[10px] font-extrabold text-orange-500">Faol</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 mt-2">
                          <span className="text-[10px] text-slate-450 dark:text-slate-400 font-medium leading-relaxed">
                            AquaMind AI yashil sug'orish rejasi orqali suv nasoslari uchun sarflanadigan elektr energiyasi va uglerod izini tejash koeffitsiyenti.
                          </span>
                          {wateringReport && (
                            <button
                              onClick={() => handleDownloadPDF("esg")}
                              className="mt-2 w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 transition text-white font-black text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10"
                            >
                              <Sparkles size={12} /> Yashil Sertifikatni Yuklash
                            </button>
                          )}
                        </div>
                      </GlassCard>
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: SMART WATERING */}
              {activeTab === "watering" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      Aqlli Sug'orish Tizimi
                    </h1>
                    <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-450 font-medium">
                      Ekin va iqlim ma'lumotlarini kiriting va AI orqali optimal sug'orish muddatini hisoblang.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* User inputs card */}
                    <div className="lg:col-span-1">
                      <GlassCard className="flex flex-col gap-6">
                        <h3 className="font-extrabold text-base border-b border-slate-100 dark:border-white/5 pb-3">
                          Dala Parametrlari
                        </h3>

                        <GlassSelect
                          label="Ekin Turi"
                          value={cropType}
                          onChange={(e) => setCropType(e.target.value)}
                          options={Object.keys(CROPS_DATA).map(c => ({ value: c, label: c }))}
                        />

                        <GlassInput
                          label="Maydon Hajmi (Gektar)"
                          type="number"
                          value={areaSize}
                          onChange={(e) => setAreaSize(e.target.value)}
                          placeholder="Masalan, 12"
                        />

                        <GlassInput
                          label="Oxirgi Sug'orilgan Sana"
                          type="date"
                          value={lastWatered}
                          onChange={(e) => setLastWatered(e.target.value)}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <GlassSelect
                            label="Viloyat"
                            value={region}
                            onChange={(e) => handleRegionChange(e.target.value)}
                            options={Object.keys(REGIONS_DATA).map(r => ({ value: r, label: r }))}
                          />

                          <GlassSelect
                            label="Tuman"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            options={districtsList.map(d => ({ value: d, label: d }))}
                          />
                        </div>

                        {/* Latitude & Longitude manual inputs with GPS locator */}
                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 pl-1">
                            Koordinatalar (Xaritadan yoki GPS)
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            <GlassInput
                              type="text"
                              value={latitude}
                              onChange={(e) => setLatitude(e.target.value)}
                              placeholder="Kenglik"
                            />
                            <GlassInput
                              type="text"
                              value={longitude}
                              onChange={(e) => setLongitude(e.target.value)}
                              placeholder="Uzoqlik"
                            />
                          </div>
                          <button
                            onClick={handleGPSLocate}
                            disabled={isGPSLocating}
                            className="mt-2 text-xs font-bold text-cyan-500 hover:text-cyan-400 transition cursor-pointer flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cyan-500/5 border border-cyan-500/10"
                          >
                            <Compass size={14} className={isGPSLocating ? "animate-spin" : ""} />
                            {isGPSLocating ? "GPS aniqlanmoqda..." : "GPS Joylashuvni Aniqlash"}
                          </button>
                        </div>

                        <GlassButton
                          variant="primary"
                          className="w-full font-bold uppercase mt-2"
                          onClick={handleWaterAnalyze}
                          disabled={isWaterAnalyzing}
                          glow
                        >
                          Tahlil Qilish <Sparkles size={16} />
                        </GlassButton>
                      </GlassCard>
                    </div>

                    {/* Result panel */}
                    <div className="lg:col-span-2">
                      <AnimatePresence mode="wait">
                        {!showWaterReport && !isWaterAnalyzing && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-[430px] rounded-2xl border border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center text-center p-8 bg-slate-100/30 dark:bg-slate-900/10"
                          >
                            <div className="bg-cyan-500/10 text-cyan-500 p-4 rounded-full mb-4 animate-bounce">
                              <Droplets size={32} />
                            </div>
                            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 mb-2">
                              Tahlil Natijalari Kutish Rejimida
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-550 max-w-sm">
                              Parametrlarni kiritib, "Tahlil Qilish" tugmasini bosing va sun'iy intellekt tavsiyalarini oling.
                            </p>
                          </motion.div>
                        )}

                        {showWaterReport && wateringReport && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            {/* Water Suggestion Primary Card */}
                            <GlassCard className="border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)] overflow-hidden">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
                                <div className="flex items-center gap-3.5">
                                  <div className="bg-cyan-500/10 p-2.5 rounded-xl text-cyan-500">
                                    <CheckCircle size={20} />
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sug'orish Tavsiyasi</span>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                      {wateringReport.shouldWater ? "Sug'orish Tavsiya Etiladi!" : "Hozircha Sug'orish Shart Emas"}
                                    </h3>
                                  </div>
                                </div>
                                <div className="flex gap-2 self-start sm:self-auto">
                                  <GlassButton
                                    variant="glass"
                                    onClick={() => handleDownloadPDF("watering")}
                                    className="px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 border-white/20 hover:bg-cyan-500/10 hover:text-cyan-500"
                                  >
                                    <FileDown size={14} /> PDF Hisobot
                                  </GlassButton>
                                  <GlassButton
                                    variant="glass"
                                    onClick={() => handleDownloadPDF("esg")}
                                    className="px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 border-white/20 hover:bg-emerald-500/10 hover:text-emerald-500 text-emerald-500 animate-pulse"
                                  >
                                    <Sparkles size={14} /> Eko-Sertifikat ESG
                                  </GlassButton>
                                </div>
                              </div>

                              {/* Numbers Row */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-slate-100 dark:border-white/5 py-4 my-4">
                                <div className="flex flex-col">
                                  <span className="text-xs text-slate-400">Navbatdagi Sug'orish</span>
                                  <span className="text-lg font-extrabold text-cyan-500 flex items-center gap-1.5 mt-1">
                                    <Calendar size={16} /> {wateringReport.nextWatering}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs text-slate-400">Suv Hajmi (Tavsiya)</span>
                                  <span className="text-lg font-extrabold text-emerald-500 flex items-center gap-1.5 mt-1">
                                    <Layers size={16} /> {wateringReport.recommendedVolumeLiters.toLocaleString()} Litr
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs text-slate-400">Suv Tejash Imkoniyati</span>
                                  <span className="text-lg font-extrabold text-cyan-400 flex items-center gap-1.5 mt-1">
                                    <TrendingUp size={16} /> {wateringReport.waterSavingPotential}% tejaladi
                                  </span>
                                </div>
                              </div>

                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 pl-0.5">AI Tushuntirishi</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                                {wateringReport.aiRaisonDtre}
                              </p>
                            </GlassCard>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>

                  {/* Water Loading Scanner Animation */}
                  <AnalysisLoader
                    isLoading={isWaterAnalyzing}
                    steps={waterLoaderSteps}
                    currentStepIndex={waterLoaderStep}
                  />
                </>
              )}

              {/* TAB 3: CROP ANALYSIS */}
              {activeTab === "crop-analysis" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      Ekin Analizi (Gemini Vision)
                    </h1>
                    <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-450 font-medium">
                      Ekin bargi yoki shikastlangan soha suratini yuklang, sun'iy intellekt uning kasalliklarini aniqlaydi.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Image Drag and Drop */}
                    <div className="lg:col-span-1">
                      <GlassCard className="flex flex-col gap-6">
                        <h3 className="font-extrabold text-base border-b border-slate-100 dark:border-white/5 pb-3">
                          Rasm Yuklash
                        </h3>

                        <div className="relative w-full h-52 border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-cyan-500/50 rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-300 overflow-hidden bg-slate-100/25 dark:bg-slate-950/25">
                          {selectedImage ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={selectedImage}
                                alt="Selected Leaf"
                                className="w-full h-full object-cover rounded-xl"
                              />
                              <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg cursor-pointer"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <label className="flex flex-col items-center gap-2 cursor-pointer w-full h-full justify-center">
                              <Upload size={32} className="text-cyan-500 animate-bounce" />
                              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Ekin bargi rasmini tanlang
                              </span>
                              <span className="text-[10px] text-slate-400">
                                PNG, JPG formatlar (maks 5MB)
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                              />
                            </label>
                          )}
                        </div>

                        <GlassSelect
                          label="Ekin Turi"
                          value={cropTypeAnalysis}
                          onChange={(e) => setCropTypeAnalysis(e.target.value)}
                          options={Object.keys(CROPS_DATA).map(c => ({ value: c, label: c }))}
                        />

                        <GlassButton
                          variant="primary"
                          className="w-full font-bold uppercase"
                          onClick={handleCropAnalyze}
                          disabled={isCropAnalyzing}
                          glow
                        >
                          Tahlilni Boshlash <Sparkles size={16} />
                        </GlassButton>
                      </GlassCard>
                    </div>

                    {/* Diagnosis display */}
                    <div className="lg:col-span-2">
                      <AnimatePresence mode="wait">
                        {!showCropReport && !isCropAnalyzing && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-[430px] rounded-2xl border border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center text-center p-8 bg-slate-100/30 dark:bg-slate-900/10"
                          >
                            <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-full mb-4 animate-bounce">
                              <Sprout size={32} />
                            </div>
                            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 mb-2">
                              Tashxis Natijalari Kutish Rejimida
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-550 max-w-sm">
                              Ekin rasmini yuklab, "Tahlilni Boshlash" tugmasini bosing va Gemini Vision tashxisini ko'ring.
                            </p>
                          </motion.div>
                        )}

                        {showCropReport && cropReport && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col gap-6"
                          >
                            {/* Diagnosis detail card */}
                            <GlassCard className="border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.05)] overflow-hidden">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
                                <div className="flex items-center gap-3.5">
                                  <div className="bg-red-500/10 p-2.5 rounded-xl text-red-500">
                                    <AlertTriangle size={20} />
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Kasallik Aniqlash Tahlili</span>
                                    <h3 className="font-bold text-lg text-slate-950 dark:text-white">
                                      {cropReport.disease}
                                    </h3>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold px-3 py-1 rounded-lg bg-red-500/10 text-red-500">
                                    {cropReport.riskLevel} Risk
                                  </span>
                                  <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500">
                                    {Math.round(cropReport.confidence * 100)}% Ishonchlilik
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col gap-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Professional Agronomik Tavsiyalar</h4>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  {cropReport.recommendations.map((rec, index) => (
                                    <div key={index} className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 flex flex-col">
                                      <div className="flex items-center gap-2 mb-2">
                                        {index === 0 ? (
                                          <Clock size={16} className="text-cyan-500" />
                                        ) : index === 1 ? (
                                          <Sprout size={16} className="text-emerald-500" />
                                        ) : (
                                          <Sparkles size={16} className="text-yellow-500" />
                                        )}
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                          Tavsiya #{index + 1}
                                        </span>
                                      </div>
                                      <span className="text-xs text-slate-400">{rec}</span>
                                    </div>
                                  ))}
                                </div>

                                <div className="mt-2 text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-150 dark:border-white/5 leading-relaxed">
                                  {cropReport.description}
                                </div>
                              </div>
                            </GlassCard>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>

                  {/* Crop Scanning Loader Animation */}
                  <AnalysisLoader
                    isLoading={isCropAnalyzing}
                    steps={cropLoaderSteps}
                    currentStepIndex={cropLoaderStep}
                  />
                </>
              )}

              {/* TAB 4: AI AGRONOMIST */}
              {activeTab === "agronomist" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      AI Agronom (Chat va Ovozli Yordamchi)
                    </h1>
                    <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-450 font-medium">
                      Ekin parvarishi, mineral moddalar va suv tejash masalalari bo'yicha sun'iy intellektdan ovozli muloqot orqali maslahat oling.
                    </span>
                  </div>

                  {/* Chat interface */}
                  <GlassCard className="flex flex-col h-[500px] sm:h-[600px] lg:h-[calc(100vh-260px)] p-0 overflow-hidden relative border-white/20">
                    
                    {/* Header */}
                    <div className="px-4 sm:px-6 py-4 bg-slate-100/50 dark:bg-slate-900/40 border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white dark:border-slate-950" />
                          <div className="bg-gradient-to-tr from-cyan-500 to-emerald-500 text-white p-2 rounded-xl">
                            <Sparkles size={16} />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">AquaMind AI Agronomist</span>
                          <span className="text-[10px] text-slate-400">Faol (Gemini Pro)</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Clear Chat Button */}
                        <button
                          onClick={handleClearChat}
                          className="p-2 rounded-xl border border-white/25 dark:border-white/5 transition cursor-pointer text-xs flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:border-red-500/20 hover:bg-red-500/5"
                          title="Chat tarixini tozalash"
                        >
                          <Trash2 size={16} />
                          <span className="hidden sm:inline">Tozalash</span>
                        </button>

                        {/* Mute speaker indicator */}
                        <button
                          onClick={() => {
                            playClick();
                            setVoiceActive(!voiceActive);
                          }}
                          className={`p-2 rounded-xl border transition cursor-pointer text-xs flex items-center gap-1.5 ${
                            voiceActive 
                              ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-500" 
                              : "bg-white/40 dark:bg-slate-950/45 border-white/40 dark:border-white/5 text-slate-500 hover:text-cyan-500 hover:border-cyan-500/20"
                          }`}
                          title={voiceActive ? "Ovozli agronom faol" : "Ovozli agronom o'chirilgan"}
                        >
                          {voiceActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
                          <span className="hidden sm:inline">{voiceActive ? "Ovoz Yoqilgan" : "Ovoz O'chirilgan"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
                      {chatHistory.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex flex-col max-w-[85%] sm:max-w-[80%] ${
                            msg.role === "user" ? "self-end items-end" : "self-start items-start"
                          }`}
                        >
                          <div
                            className={`px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm shadow-sm ${
                              msg.role === "user"
                                ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-tr-none"
                                : "liquid-glass border-white/20 text-slate-800 dark:text-slate-200 rounded-tl-none"
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 pl-1 pr-1">{msg.time}</span>
                        </div>
                      ))}

                      {isChatTyping && (
                        <div className="flex items-center gap-2 self-start bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 rounded-2xl rounded-tl-none">
                          <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-200 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-200 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-200 rounded-full animate-bounce" />
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Box Input with microphone button */}
                    <div className="p-4 bg-slate-100/50 dark:bg-slate-900/40 border-t border-slate-200/50 dark:border-white/5 flex items-center gap-3">
                      {/* Microphone speech recorder */}
                      <button
                        onClick={toggleListening}
                        className={`p-3 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                          isListening
                            ? "bg-red-500 border-red-500 text-white animate-pulse"
                            : "bg-white/40 dark:bg-slate-950/45 border-white/40 dark:border-white/5 text-slate-500 hover:text-cyan-500 hover:border-cyan-500/20"
                        }`}
                        title="Ovoz orqali yozish"
                      >
                        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                      </button>

                      {isListening ? (
                        <div className="flex-1 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm flex items-center justify-between">
                          <span className="text-red-500 font-bold animate-pulse text-xs sm:text-sm">Ovozingizni eshityapman, gapiring...</span>
                          <div className="flex items-center gap-1">
                            <div className="w-1 h-3 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-1 h-6 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-1 h-4 bg-red-500 rounded-full animate-bounce" />
                            <div className="w-1 h-5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.45s]" />
                          </div>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSendMessage();
                          }}
                          placeholder="AI Agronomdan so'rang..."
                          className="flex-1 px-4 py-3 rounded-xl bg-white/40 dark:bg-slate-950/45 border border-white/40 dark:border-white/5 text-sm focus:outline-none focus:border-cyan-500/50"
                        />
                      )}
                      <button
                        onClick={() => handleSendMessage()}
                        disabled={isListening}
                        className="p-3 bg-cyan-500 hover:bg-cyan-400 transition-colors text-white rounded-xl flex items-center justify-center cursor-pointer shadow-md shadow-cyan-500/20 disabled:opacity-55"
                      >
                        <Send size={16} />
                      </button>
                    </div>

                  </GlassCard>
                </>
              )}

              {/* TAB 5: ANALYTICS */}
              {activeTab === "analytics" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      Tahlil & Statistika
                    </h1>
                    <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-450 font-medium">
                      Oylik va yillik suv sarfi dinamikasi, tejalgan xarajatlar va o'lchov datchiklari ma'lumotlari.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main chart */}
                    <div className="lg:col-span-2">
                      <WaterChart title="Oylik Suv Sarfi va Optimizatsiyasi" data={mockAnalyticsData} />
                    </div>

                    {/* Sensor log list */}
                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">
                        Dala Datchiklari Logs
                      </span>
                      <GlassCard className="flex flex-col gap-4">
                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-white/5 pb-2">
                          Sensorlar Statusi
                        </h4>
                        
                        <div className="flex flex-col gap-3.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Buxoro-1 (Tuproq namligi)</span>
                                <span className="text-[10px] text-slate-400">Status: Faol & Sog'lom</span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-150">48.2%</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Buxoro-2 (Harorat datchigi)</span>
                                <span className="text-[10px] text-slate-400">Status: Faol & Sog'lom</span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-150">37.8°C</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="w-2 h-2 rounded-full bg-yellow-500" />
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Buxoro-3 (Oqim hisoblagich)</span>
                                <span className="text-[10px] text-slate-400">Status: Kalibratsiya talab etiladi</span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-150">28 L/min</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="w-2 h-2 rounded-full bg-red-500" />
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Buxoro-4 (Tuzlanish datchigi)</span>
                                <span className="text-[10px] text-slate-400">Status: Aloqa uzilgan</span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-red-500">Noma'lum</span>
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  </div>
                </>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Toast Notification Banner overlay */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3.5 max-w-sm ${
              toast.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/35 text-slate-800 dark:text-slate-200"
                : toast.type === "error"
                ? "bg-red-500/10 border-red-500/35 text-slate-800 dark:text-slate-200"
                : "bg-cyan-500/10 border-cyan-500/35 text-slate-800 dark:text-slate-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={20} className="text-emerald-500 shrink-0" />
            ) : toast.type === "error" ? (
              <AlertTriangle size={20} className="text-red-500 shrink-0" />
            ) : (
              <Droplets size={20} className="text-cyan-500 shrink-0" />
            )}
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-extrabold uppercase tracking-wider">
                {toast.type === "success" ? "Muvaffaqiyat" : toast.type === "error" ? "Xatolik" : "Eslatma"}
              </span>
              <span className="text-xs font-medium text-slate-650 dark:text-slate-300">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
