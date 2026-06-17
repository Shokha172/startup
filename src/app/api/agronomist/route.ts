import { NextRequest, NextResponse } from "next/server";
import { getAgronomistAIChat } from "@/utils/gemini";
import { supabase, isSupabaseConfigured } from "@/utils/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { history, message, sessionId } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Suhbat xabari kiritilishi shart." },
        { status: 400 }
      );
    }

    const chatHistory = history || [];

    // Fetch AI response from Gemini model
    const aiReply = await getAgronomistAIChat(chatHistory, message);

    // Save logs to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      const activeSessionId = sessionId || "c05d5351-419b-4393-8ef4-6f5dfba21f10"; // Default seed session id

      // Log User message
      await supabase
        .from("chat_messages")
        .insert({
          session_id: activeSessionId,
          sender: "user",
          message: message
        });

      // Log AI reply
      await supabase
        .from("chat_messages")
        .insert({
          session_id: activeSessionId,
          sender: "ai",
          message: aiReply
        });
    }

    return NextResponse.json({ reply: aiReply });
  } catch (error: any) {
    console.error("AI Agronomist API Error:", error);
    return NextResponse.json(
      { error: "AI Agronom bilan bog'lanishda xatolik: " + (error.message || error) },
      { status: 500 }
    );
  }
}
