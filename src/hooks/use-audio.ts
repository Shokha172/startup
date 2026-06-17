"use client";

import { useMemo } from "react";
import { audioSystem } from "@/utils/audio";

export function useAudio() {
  return useMemo(() => ({
    playClick: () => audioSystem.playClick(),
    playSuccess: () => audioSystem.playSuccess(),
    playError: () => audioSystem.playError(),
    playNotification: () => audioSystem.playNotification(),
  }), []);
}
