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
import { useConfigurator } from "@/store/configurator";

const specsCopy = {
  en: ["4.0L N/A", "518 HP", "0–60 3.0 S", "184 MPH"],
  pt: ["4.0 ASPIRADO", "518 CV", "0–100 3,2 S", "296 KM/H"],
} as const;

export function ConfiguratorExperience() {
  const entered = useConfigurator((state) => state.entered);
  const language = useConfigurator((state) => state.language);
  const summaryMode = useConfigurator((state) => state.summaryMode);
  const setPaintId = useConfigurator((state) => state.setPaintId);
  const setWheelId = useConfigurator((state) => state.setWheelId);
  const setCaliperId = useConfigurator((state) => state.setCaliperId);
  const setHoodOpen = useConfigurator((state) => state.setHoodOpen);
  const toggleHeadlights = useConfigurator((state) => state.toggleHeadlights);
  const toggleTaillights = useConfigurator((state) => state.toggleTaillights);
  const toggleHazards = useConfigurator((state) => state.toggleHazards);
  const t = copy[language];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paint = params.get("paint");

    if (paint && PAINTS.some((option) => option.id === paint)) {
      setPaintId(paint);
    }

    const wheel = params.get("wheel");
    if (wheel && WHEEL_FINISH_OPTIONS.some((option) => option.id === wheel)) {
      setWheelId(wheel);
    }

    const caliper = params.get("caliper");
    if (caliper && CALIPER_OPTIONS.some((option) => option.id === caliper)) {
      setCaliperId(caliper);
    }

    if (
      params.get("lights") === "1" &&
      !useConfigurator.getState().headlights
    ) {
      toggleHeadlights();
    }

    if (
      params.get("tails") === "0" &&
      useConfigurator.getState().taillights
    ) {
      toggleTaillights();
    }

    if (
      params.get("hazards") === "1" &&
      !useConfigurator.getState().hazards
    ) {
      toggleHazards();
    }

    const hood = params.get("hood");
    if (hood === "1") {
      setHoodOpen(true);
    } else if (hood === "0") {
      setHoodOpen(false);
    }
  }, [
    setCaliperId,
    setHoodOpen,
    setPaintId,
    setWheelId,
    toggleHazards,
    toggleHeadlights,
    toggleTaillights,
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

      {entered && (
        <>
          <TopBar />
          <ConfiguratorPanel />

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
                <span>{t.drag}</span>
                <small className="model-credit">
                  <a
                    href="https://sketchfab.com/3d-models/porsche-gt3-rs-e738eae819c34d19a31dd066c45e0f3d"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {language === "pt"
                      ? "Modelo 3D por Black Snow"
                      : "3D model by Black Snow"}
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
