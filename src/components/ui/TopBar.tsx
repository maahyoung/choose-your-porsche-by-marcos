"use client";

import { useState } from "react";
import { copy } from "@/config/translations";
import { Quality, useConfigurator } from "@/store/configurator";

const qualityOrder: Quality[] = ["performance", "balanced", "ultra"];

const qualityLabels = {
  en: {
    performance: "Performance",
    balanced: "Balanced",
    ultra: "Ultra",
  },
  pt: {
    performance: "Desempenho",
    balanced: "Equilibrado",
    ultra: "Ultra",
  },
} as const;

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="top-action-svg">
      <path d="M4 9.4v5.2h3.4l4.4 3.7V5.7L7.4 9.4H4Z" />
      {muted ? (
        <path d="m15.4 9 5.1 6m0-6-5.1 6" />
      ) : (
        <>
          <path d="M15.2 9.2a4 4 0 0 1 0 5.6" />
          <path d="M18 6.7a7.4 7.4 0 0 1 0 10.6" />
        </>
      )}
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="top-action-svg">
      <path d="M4 7h5m4 0h7M4 17h9m4 0h3" />
      <circle cx="11" cy="7" r="2" />
      <circle cx="15" cy="17" r="2" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="top-action-svg">
      <path d="M12 3v11m0-11L8.5 6.5M12 3l3.5 3.5" />
      <path d="M6 10.5H4.8A1.8 1.8 0 0 0 3 12.3v6.9A1.8 1.8 0 0 0 4.8 21h14.4a1.8 1.8 0 0 0 1.8-1.8v-6.9a1.8 1.8 0 0 0-1.8-1.8H18" />
    </svg>
  );
}

export function TopBar() {
  const language = useConfigurator((state) => state.language);
  const setLanguage = useConfigurator((state) => state.setLanguage);
  const soundEnabled = useConfigurator((state) => state.soundEnabled);
  const setSoundEnabled = useConfigurator((state) => state.setSoundEnabled);
  const quality = useConfigurator((state) => state.quality);
  const paintId = useConfigurator((state) => state.paintId);
  const wheelId = useConfigurator((state) => state.wheelId);
  const caliperId = useConfigurator((state) => state.caliperId);
  const hoodOpen = useConfigurator((state) => state.hoodOpen);
  const leftDoorOpen = useConfigurator((state) => state.leftDoorOpen);
  const rightDoorOpen = useConfigurator((state) => state.rightDoorOpen);
  const wingInstalled = useConfigurator((state) => state.wingInstalled);
  const setQuality = useConfigurator((state) => state.setQuality);

  const [copied, setCopied] = useState(false);
  const t = copy[language];

  const nextQuality = () => {
    const currentIndex = qualityOrder.indexOf(quality);
    const nextIndex = (currentIndex + 1) % qualityOrder.length;
    setQuality(qualityOrder[nextIndex]);
  };

  const shareBuild = async () => {
    const buildUrl = new URL(window.location.href);
    buildUrl.searchParams.set("paint", paintId);
    buildUrl.searchParams.set("wheel", wheelId);
    buildUrl.searchParams.set("caliper", caliperId);
    buildUrl.searchParams.set("hood", hoodOpen ? "1" : "0");
    buildUrl.searchParams.set("doorL", leftDoorOpen ? "1" : "0");
    buildUrl.searchParams.set("doorR", rightDoorOpen ? "1" : "0");
    buildUrl.searchParams.set("wing", wingInstalled ? "1" : "0");
    const url = buildUrl.toString();

    try {
      if (navigator.share) {
        await navigator.share({ title: "911 by Marcos", url });
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <header className="top-bar">
        <div className="hero-left-lockup">
          <img
            src="/brand/porsche-crest.svg"
            alt="Porsche crest"
            className="porsche-crest"
          />

          <div className="identity-copy">
            <div className="nine-eleven-lockup">
              <span className="nine-eleven">911</span>
              <span className="by-marcos-script">by Marcos</span>
            </div>
          </div>
        </div>

        <div className="center-wordmark" aria-label="Porsche">
          <img
            src="/brand/porsche-wordmark.svg"
            alt="Porsche"
            className="porsche-wordmark-image"
          />
        </div>

        <div className="top-actions" aria-label="Experience controls">
          <button
            className="top-action-button language-action"
            onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
            aria-label="Change language"
            title="Change language"
          >
            {language.toUpperCase()}
          </button>

          <button
            className="top-action-button icon-action"
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={soundEnabled ? `${t.sound}: ${t.on}` : `${t.sound}: ${t.off}`}
            title={soundEnabled ? `${t.sound}: ${t.on}` : `${t.sound}: ${t.off}`}
          >
            <SpeakerIcon muted={!soundEnabled} />
          </button>

          <button
            className="top-action-button quality-action"
            onClick={nextQuality}
            aria-label={`${t.quality}: ${qualityLabels[language][quality]}`}
            title={`${t.quality}: ${qualityLabels[language][quality]}`}
          >
            <SlidersIcon />
            <span>{qualityLabels[language][quality]}</span>
          </button>

          <button
            className="top-action-button icon-action"
            onClick={shareBuild}
            aria-label={t.share}
            title={t.share}
          >
            <ShareIcon />
          </button>
        </div>
      </header>

      {copied && <div className="toast">{t.copied}</div>}
    </>
  );
}
