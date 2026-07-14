"use client";

import { useState } from "react";
import { copy } from "@/config/translations";
import { Quality, useConfigurator } from "@/store/configurator";
import { Signature } from "./Signature";

export function TopBar() {
  const language = useConfigurator((state) => state.language);
  const setLanguage = useConfigurator((state) => state.setLanguage);
  const soundEnabled = useConfigurator((state) => state.soundEnabled);
  const setSoundEnabled = useConfigurator((state) => state.setSoundEnabled);
  const quality = useConfigurator((state) => state.quality);
  const setQuality = useConfigurator((state) => state.setQuality);
  const paintId = useConfigurator((state) => state.paintId);
  const headlights = useConfigurator((state) => state.headlights);
  const taillights = useConfigurator((state) => state.taillights);
  const hazards = useConfigurator((state) => state.hazards);
  const [feedback, setFeedback] = useState("");
  const t = copy[language];

  const cycleQuality = () => {
    const qualities: Quality[] = ["performance", "balanced", "ultra"];
    const next = qualities[(qualities.indexOf(quality) + 1) % qualities.length];
    setQuality(next);
  };

  const share = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("paint", paintId);
    url.searchParams.set("lights", headlights ? "1" : "0");
    url.searchParams.set("tails", taillights ? "1" : "0");
    url.searchParams.set("hazards", hazards ? "1" : "0");
    const shareData = { title: "Choose Your Porsche — by Marcos", url: url.toString() };
    try {
      if (navigator.share) await navigator.share(shareData);
      else await navigator.clipboard.writeText(url.toString());
      setFeedback(t.copied);
      window.setTimeout(() => setFeedback(""), 1800);
    } catch {
      // User cancellation is not an application error.
    }
  };

  return (
    <header className="top-bar">
      <div className="brand-lockup">
        <p>{t.title}</p>
        <span>{t.model}</span>
      </div>
      <Signature className="top-signature" />
      <div className="top-actions">
        <button onClick={() => setLanguage(language === "en" ? "pt" : "en")}>{language === "en" ? "PT" : "EN"}</button>
        <button onClick={() => setSoundEnabled(!soundEnabled)}>{t.sound}: {soundEnabled ? t.on : t.off}</button>
        <button onClick={cycleQuality}>{t.quality}: {quality}</button>
        <button onClick={share}>{t.share}</button>
      </div>
      {feedback && <div className="toast">{feedback}</div>}
    </header>
  );
}
