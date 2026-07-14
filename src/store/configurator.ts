import { create } from "zustand";
import type { Language } from "@/config/translations";

export type Quality = "performance" | "balanced" | "ultra";
export type StepId =
  | "paint"
  | "wheels"
  | "exterior"
  | "graphics"
  | "aero"
  | "stance"
  | "lighting"
  | "summary";

type ConfiguratorState = {
  entered: boolean;
  language: Language;
  soundEnabled: boolean;
  quality: Quality;
  activeStep: StepId;
  paintId: string;
  wheelId: string;
  caliperId: string;
  headlights: boolean;
  taillights: boolean;
  hazards: boolean;
  summaryMode: boolean;
  transitionNonce: number;
  enter: (withSound: boolean) => void;
  setLanguage: (language: Language) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setQuality: (quality: Quality) => void;
  setActiveStep: (step: StepId) => void;
  setPaintId: (paintId: string) => void;
  setWheelId: (wheelId: string) => void;
  setCaliperId: (caliperId: string) => void;
  toggleHeadlights: () => void;
  toggleTaillights: () => void;
  toggleHazards: () => void;
  setSummaryMode: (enabled: boolean) => void;
  replayTransition: () => void;
};

export const useConfigurator = create<ConfiguratorState>((set) => ({
  entered: false,
  language: "en",
  soundEnabled: false,
  quality: "balanced",
  activeStep: "paint",
  paintId: "white",
  wheelId: "satin-black",
  caliperId: "red",
  headlights: false,
  taillights: true,
  hazards: false,
  summaryMode: false,
  transitionNonce: 0,
  enter: (withSound) =>
    set({ entered: true, soundEnabled: withSound, headlights: true }),
  setLanguage: (language) => set({ language }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setQuality: (quality) => set({ quality }),
  setActiveStep: (activeStep) => set({ activeStep }),
  setPaintId: (paintId) =>
    set((state) => ({ paintId, transitionNonce: state.transitionNonce + 1 })),
  setWheelId: (wheelId) => set({ wheelId }),
  setCaliperId: (caliperId) => set({ caliperId }),
  toggleHeadlights: () => set((state) => ({ headlights: !state.headlights })),
  toggleTaillights: () => set((state) => ({ taillights: !state.taillights })),
  toggleHazards: () => set((state) => ({ hazards: !state.hazards })),
  setSummaryMode: (summaryMode) => set({ summaryMode }),
  replayTransition: () =>
    set((state) => ({ transitionNonce: state.transitionNonce + 1 })),
}));
