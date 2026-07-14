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
import { useConfigurator } from "@/store/configurator";

export function ConfiguratorExperience() {
  const entered = useConfigurator((state) => state.entered);
  const language = useConfigurator((state) => state.language);
  const setPaintId = useConfigurator((state) => state.setPaintId);
  const toggleHeadlights = useConfigurator((state) => state.toggleHeadlights);
  const toggleTaillights = useConfigurator((state) => state.toggleTaillights);
  const toggleHazards = useConfigurator((state) => state.toggleHazards);
  const t = copy[language];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paint = params.get("paint");
    if (paint && PAINTS.some((option) => option.id === paint)) setPaintId(paint);
    if (params.get("lights") === "1" && !useConfigurator.getState().headlights) toggleHeadlights();
    if (params.get("tails") === "0" && useConfigurator.getState().taillights) toggleTaillights();
    if (params.get("hazards") === "1" && !useConfigurator.getState().hazards) toggleHazards();
  }, [setPaintId, toggleHazards, toggleHeadlights, toggleTaillights]);

  return (
    <main className="experience-shell">
      <div className="scene-layer"><CarScene /></div>
      <div className="vignette" />
      <div className="speed-overlay" />
      {entered && (
        <>
          <TopBar />
          <ConfiguratorPanel />
          <div className="scene-notes">
            <span>{t.drag}</span>
            <small>{t.placeholder}</small>
          </div>
        </>
      )}
      <SummaryOverlay />
      <IntroScreen />
      <RotateDevice />
    </main>
  );
}
