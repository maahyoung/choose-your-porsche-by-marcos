import { create } from "zustand";
import type { Language } from "@/config/translations";
import type {
  CameraPresetId,
  EnvironmentId,
  ExhaustFinishId,
  MirrorFinishId,
  RoofFinishId,
} from "@/config/details";

export type Quality = "performance" | "balanced" | "ultra";
export type StepId =
  | "paint"
  | "wheels"
  | "details"
  | "exterior"
  | "aero"
  | "lighting"
  | "camera"
  | "summary";

type ConfiguratorState = {
  entered: boolean;
  language: Language;
  quality: Quality;
  activeStep: StepId;
  paintId: string;
  wheelId: string;
  caliperId: string;
  roofFinishId: RoofFinishId;
  mirrorFinishId: MirrorFinishId;
  exhaustFinishId: ExhaustFinishId;
  environmentId: EnvironmentId;
  cameraPresetId: CameraPresetId;
  hoodOpen: boolean;
  leftDoorOpen: boolean;
  rightDoorOpen: boolean;
  wingInstalled: boolean;
  headlights: boolean;
  taillights: boolean;
  summaryMode: boolean;
  transitionNonce: number;
  cameraTransitionNonce: number;
  enter: () => void;
  setLanguage: (language: Language) => void;
  setQuality: (quality: Quality) => void;
  setActiveStep: (step: StepId) => void;
  setPaintId: (paintId: string) => void;
  setWheelId: (wheelId: string) => void;
  setCaliperId: (caliperId: string) => void;
  setRoofFinishId: (finish: RoofFinishId) => void;
  setMirrorFinishId: (finish: MirrorFinishId) => void;
  setExhaustFinishId: (finish: ExhaustFinishId) => void;
  setEnvironmentId: (environment: EnvironmentId) => void;
  setCameraPresetId: (preset: CameraPresetId) => void;
  setHoodOpen: (open: boolean) => void;
  toggleHoodOpen: () => void;
  setLeftDoorOpen: (open: boolean) => void;
  toggleLeftDoorOpen: () => void;
  setRightDoorOpen: (open: boolean) => void;
  toggleRightDoorOpen: () => void;
  setWingInstalled: (installed: boolean) => void;
  toggleWingInstalled: () => void;
  setHeadlights: (enabled: boolean) => void;
  toggleHeadlights: () => void;
  setTaillights: (enabled: boolean) => void;
  toggleTaillights: () => void;
  setSummaryMode: (enabled: boolean) => void;
  replayTransition: () => void;
};

const withTransition = (state: ConfiguratorState) => ({
  transitionNonce: state.transitionNonce + 1,
});

export const useConfigurator = create<ConfiguratorState>((set) => ({
  entered: false,
  language: "en",
  quality: "balanced",
  activeStep: "paint",
  paintId: "white",
  wheelId: "satin-black",
  caliperId: "red",
  roofFinishId: "carbon",
  mirrorFinishId: "body-color",
  exhaustFinishId: "matte-black",
  environmentId: "showroom",
  cameraPresetId: "three-quarter",
  hoodOpen: false,
  leftDoorOpen: false,
  rightDoorOpen: false,
  wingInstalled: true,
  headlights: true,
  taillights: true,
  summaryMode: false,
  transitionNonce: 0,
  cameraTransitionNonce: 0,
  enter: () => set({ entered: true }),
  setLanguage: (language) => set({ language }),
  setQuality: (quality) => set({ quality }),
  setActiveStep: (activeStep) => set({ activeStep }),
  setPaintId: (paintId) =>
    set((state) => ({ paintId, ...withTransition(state) })),
  setWheelId: (wheelId) =>
    set((state) => ({ wheelId, ...withTransition(state) })),
  setCaliperId: (caliperId) =>
    set((state) => ({ caliperId, ...withTransition(state) })),
  setRoofFinishId: (roofFinishId) =>
    set((state) => ({ roofFinishId, ...withTransition(state) })),
  setMirrorFinishId: (mirrorFinishId) =>
    set((state) => ({ mirrorFinishId, ...withTransition(state) })),
  setExhaustFinishId: (exhaustFinishId) =>
    set((state) => ({ exhaustFinishId, ...withTransition(state) })),
  setEnvironmentId: (environmentId) =>
    set((state) => ({ environmentId, ...withTransition(state) })),
  setCameraPresetId: (cameraPresetId) =>
    set((state) => ({
      cameraPresetId,
      cameraTransitionNonce: state.cameraTransitionNonce + 1,
    })),
  setHoodOpen: (hoodOpen) =>
    set((state) => ({ hoodOpen, ...withTransition(state) })),
  toggleHoodOpen: () =>
    set((state) => ({
      hoodOpen: !state.hoodOpen,
      ...withTransition(state),
    })),
  setLeftDoorOpen: (leftDoorOpen) =>
    set((state) => ({ leftDoorOpen, ...withTransition(state) })),
  toggleLeftDoorOpen: () =>
    set((state) => ({
      leftDoorOpen: !state.leftDoorOpen,
      ...withTransition(state),
    })),
  setRightDoorOpen: (rightDoorOpen) =>
    set((state) => ({ rightDoorOpen, ...withTransition(state) })),
  toggleRightDoorOpen: () =>
    set((state) => ({
      rightDoorOpen: !state.rightDoorOpen,
      ...withTransition(state),
    })),
  setWingInstalled: (wingInstalled) =>
    set((state) => ({ wingInstalled, ...withTransition(state) })),
  toggleWingInstalled: () =>
    set((state) => ({
      wingInstalled: !state.wingInstalled,
      ...withTransition(state),
    })),
  setHeadlights: (headlights) => set({ headlights }),
  toggleHeadlights: () => set((state) => ({ headlights: !state.headlights })),
  setTaillights: (taillights) => set({ taillights }),
  toggleTaillights: () => set((state) => ({ taillights: !state.taillights })),
  setSummaryMode: (summaryMode) => set({ summaryMode }),
  replayTransition: () =>
    set((state) => ({
      transitionNonce: state.transitionNonce + 1,
      cameraTransitionNonce: state.cameraTransitionNonce + 1,
    })),
}));
