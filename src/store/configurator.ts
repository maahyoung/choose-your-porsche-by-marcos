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
  stanceId: string;
  hoodOpen: boolean;
  leftDoorOpen: boolean;
  rightDoorOpen: boolean;
  wingInstalled: boolean;
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
  setStanceId: (stanceId: string) => void;
  setHoodOpen: (open: boolean) => void;
  toggleHoodOpen: () => void;
  setLeftDoorOpen: (open: boolean) => void;
  toggleLeftDoorOpen: () => void;
  setRightDoorOpen: (open: boolean) => void;
  toggleRightDoorOpen: () => void;
  setWingInstalled: (installed: boolean) => void;
  toggleWingInstalled: () => void;
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
  stanceId: "standard",
  hoodOpen: false,
  leftDoorOpen: false,
  rightDoorOpen: false,
  wingInstalled: true,
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
  setStanceId: (stanceId) => set({ stanceId }),
  setHoodOpen: (hoodOpen) => set({ hoodOpen }),
  toggleHoodOpen: () => set((state) => ({ hoodOpen: !state.hoodOpen })),
  setLeftDoorOpen: (leftDoorOpen) => set({ leftDoorOpen }),
  toggleLeftDoorOpen: () =>
    set((state) => ({ leftDoorOpen: !state.leftDoorOpen })),
  setRightDoorOpen: (rightDoorOpen) => set({ rightDoorOpen }),
  toggleRightDoorOpen: () =>
    set((state) => ({ rightDoorOpen: !state.rightDoorOpen })),
  setWingInstalled: (wingInstalled) => set({ wingInstalled }),
  toggleWingInstalled: () =>
    set((state) => ({ wingInstalled: !state.wingInstalled })),
  toggleHeadlights: () => set((state) => ({ headlights: !state.headlights })),
  toggleTaillights: () => set((state) => ({ taillights: !state.taillights })),
  toggleHazards: () => set((state) => ({ hazards: !state.hazards })),
  setSummaryMode: (summaryMode) => set({ summaryMode }),
  replayTransition: () =>
    set((state) => ({ transitionNonce: state.transitionNonce + 1 })),
}));
