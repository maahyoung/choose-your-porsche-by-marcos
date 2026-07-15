"use client";

import { useEffect } from "react";
import { CarScene } from "./CarScene";
import { IntroScreen } from "@/components/ui/IntroScreen";
import { ConfiguratorPanel } from "@/components/ui/ConfiguratorPanel";
import { TopBar } from "@/components/ui/TopBar";
import { RotateDevice } from "@/components/ui/RotateDevice";
import { SummaryOverlay } from "@/components/ui/SummaryOverlay";
import { copy } from "@/config/translations";
import { PAINTS } from "@/config/paints";
import { CALIPER_OPTIONS } from "@/config/brakes";
import { WHEEL_FINISH_OPTIONS } from "@/config/wheels";
import {
  CAMERA_PRESET_OPTIONS,
  ENVIRONMENT_OPTIONS,
  EXHAUST_FINISH_OPTIONS,
  MIRROR_FINISH_OPTIONS,
  ROOF_FINISH_OPTIONS,
} from "@/config/details";
import { useConfigurator } from "@/store/configurator";

const specsCopy = {
  en: ["4.0L N/A", "518 HP", "0–60 3.0 S", "184 MPH"],
  pt: ["4.0 ASPIRADO", "518 CV", "0–100 3,2 S", "296 KM/H"],
} as const;

export function ConfiguratorExperience() {
  const entered = useConfigurator((state) => state.entered);
  const language = useConfigurator((state) => state.language);
  const summaryMode = useConfigurator((state) => state.summaryMode);
  const transitionNonce = useConfigurator((state) => state.transitionNonce);
  const cameraPresetId = useConfigurator((state) => state.cameraPresetId);
  const setPaintId = useConfigurator((state) => state.setPaintId);
  const setWheelId = useConfigurator((state) => state.setWheelId);
  const setCaliperId = useConfigurator((state) => state.setCaliperId);
  const setRoofFinishId = useConfigurator((state) => state.setRoofFinishId);
  const setMirrorFinishId = useConfigurator((state) => state.setMirrorFinishId);
  const setExhaustFinishId = useConfigurator((state) => state.setExhaustFinishId);
  const setEnvironmentId = useConfigurator((state) => state.setEnvironmentId);
  const setCameraPresetId = useConfigurator((state) => state.setCameraPresetId);
  const setHoodOpen = useConfigurator((state) => state.setHoodOpen);
  const setLeftDoorOpen = useConfigurator((state) => state.setLeftDoorOpen);
  const setRightDoorOpen = useConfigurator((state) => state.setRightDoorOpen);
  const setWingInstalled = useConfigurator((state) => state.setWingInstalled);
  const setHeadlights = useConfigurator((state) => state.setHeadlights);
  const setTaillights = useConfigurator((state) => state.setTaillights);
  const t = copy[language];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paint = params.get("paint");
    const wheel = params.get("wheel");
    const caliper = params.get("caliper");
    const roof = params.get("roof");
    const mirrors = params.get("mirrors");
    const exhaust = params.get("exhaust");
    const environment = params.get("environment");
    const camera = params.get("camera");

    if (paint && PAINTS.some((option) => option.id === paint)) setPaintId(paint);
    if (wheel && WHEEL_FINISH_OPTIONS.some((option) => option.id === wheel)) {
      setWheelId(wheel);
    }
    if (caliper && CALIPER_OPTIONS.some((option) => option.id === caliper)) {
      setCaliperId(caliper);
    }
    if (roof && ROOF_FINISH_OPTIONS.some((option) => option.id === roof)) {
      setRoofFinishId(roof as (typeof ROOF_FINISH_OPTIONS)[number]["id"]);
    }
    if (mirrors && MIRROR_FINISH_OPTIONS.some((option) => option.id === mirrors)) {
      setMirrorFinishId(mirrors as (typeof MIRROR_FINISH_OPTIONS)[number]["id"]);
    }
    if (exhaust && EXHAUST_FINISH_OPTIONS.some((option) => option.id === exhaust)) {
      setExhaustFinishId(exhaust as (typeof EXHAUST_FINISH_OPTIONS)[number]["id"]);
    }
    if (
      environment &&
      ENVIRONMENT_OPTIONS.some((option) => option.id === environment)
    ) {
      setEnvironmentId(environment as (typeof ENVIRONMENT_OPTIONS)[number]["id"]);
    }
    if (camera && CAMERA_PRESET_OPTIONS.some((option) => option.id === camera)) {
      setCameraPresetId(camera as (typeof CAMERA_PRESET_OPTIONS)[number]["id"]);
    }

    const hood = params.get("hood");
    const doorL = params.get("doorL");
    const doorR = params.get("doorR");
    const wing = params.get("wing");
    const lights = params.get("lights");
    const tails = params.get("tails");

    if (hood === "1" || hood === "0") setHoodOpen(hood === "1");
    if (doorL === "1" || doorL === "0") setLeftDoorOpen(doorL === "1");
    if (doorR === "1" || doorR === "0") setRightDoorOpen(doorR === "1");
    if (wing === "1" || wing === "0") setWingInstalled(wing === "1");
    if (lights === "1" || lights === "0") setHeadlights(lights === "1");
    if (tails === "1" || tails === "0") setTaillights(tails === "1");
  }, [
    setCaliperId,
    setCameraPresetId,
    setEnvironmentId,
    setExhaustFinishId,
    setHeadlights,
    setHoodOpen,
    setLeftDoorOpen,
    setMirrorFinishId,
    setPaintId,
    setRightDoorOpen,
    setRoofFinishId,
    setTaillights,
    setWheelId,
    setWingInstalled,
  ]);

  return (
    <main className="experience-shell">
      <div className="showroom-backdrop" />
      <div className="showroom-side-falloff" />
      <div className="showroom-horizon-band" />
      <div className="showroom-floor-glow" />

      <div className="scene-layer">
        <CarScene />
      </div>

      {entered && <div key={transitionNonce} className="cinematic-transition" />}

      {entered && (
        <>
          <TopBar />
          <ConfiguratorPanel />

          {!summaryMode && cameraPresetId === "cockpit" && (
            <div className="cockpit-look-hint" role="status">
              <span aria-hidden="true">↔</span>
              {language === "pt" ? "Arraste para explorar o interior" : "Drag to explore the interior"}
            </div>
          )}

          {!summaryMode && (
            <>
              <aside className="scene-specs" aria-label="Vehicle specifications">
                {specsCopy[language].map((item, index) => (
                  <div className="scene-spec-item" key={item}>
                    <span>{item}</span>
                    {index < specsCopy[language].length - 1 && <i aria-hidden="true" />}
                  </div>
                ))}
              </aside>

              <div className="scene-notes">
                <span>
                  {cameraPresetId === "cockpit"
                    ? language === "pt"
                      ? "Arraste para olhar ao redor"
                      : "Drag to look around"
                    : t.drag}
                </span>
                <small className="model-credit">
                  <a
                    href="https://sketchfab.com/3d-models/porsche-gt3-rs-e738eae819c34d19a31dd066c45e0f3d"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {language === "pt" ? "Modelo 3D por Black Snow" : "3D model by Black Snow"}
                  </a>
                  <span aria-hidden="true"> · </span>
                  <a
                    href="https://creativecommons.org/licenses/by/4.0/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    CC BY 4.0
                  </a>
                </small>
              </div>

              <small className="project-disclaimer">
                Unofficial personal project · Not affiliated with Porsche AG
              </small>
            </>
          )}
        </>
      )}

      <SummaryOverlay />
      <IntroScreen />
      <RotateDevice />
    </main>
  );
}
