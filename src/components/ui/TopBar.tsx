"use client";

import { useState } from "react";
import { copy } from "@/config/translations";
import { Quality, useConfigurator } from "@/store/configurator";

const qualityOrder: Quality[] = ["performance", "balanced", "ultra"];

const specsCopy = {
  en: "4.0L N/A · 518 HP · 0–60 3.0 s · 184 mph",
  pt: "4.0 aspirado · 518 cv · 0–100 3,2 s · 296 km/h",
} as const;

function PorscheCrest() {
  return (
    <svg
      viewBox="0 0 72 90"
      aria-hidden="true"
      className="porsche-crest"
    >
      <defs>
        <linearGradient id="crestGold" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#d6b15f" />
          <stop offset="50%" stopColor="#c89a3c" />
          <stop offset="100%" stopColor="#9a6f22" />
        </linearGradient>
      </defs>
      <path
        d="M36 4c10 0 21 4 27 8v28c0 19-10 34-27 45C19 74 9 59 9 40V12C15 8 26 4 36 4Z"
        fill="url(#crestGold)"
        stroke="#64481a"
        strokeWidth="2"
      />
      <path
        d="M18 18h36M18 30h36M18 42h36"
        stroke="#7a1623"
        strokeWidth="7"
      />
      <path
        d="M18 24h10M44 24h10M18 36h10M44 36h10M18 48h10M44 48h10"
        stroke="#111"
        strokeWidth="2"
      />
      <rect x="28" y="22" width="16" height="28" fill="#111" rx="2" />
      <text
        x="36"
        y="15"
        textAnchor="middle"
        fontSize="7"
        fontWeight="700"
        letterSpacing="1.5"
        fill="#111"
      >
        PORSCHE
      </text>
      <text
        x="36"
        y="63"
        textAnchor="middle"
        fontSize="10"
        fontWeight="800"
        fill="#111"
      >
        S
      </text>
    </svg>
  );
}

export function TopBar() {
  const language = useConfigurator((state) => state.language);
  const setLanguage = useConfigurator((state) => state.setLanguage);
  const soundEnabled = useConfigurator((state) => state.soundEnabled);
  const setSoundEnabled = useConfigurator((state) => state.setSoundEnabled);
  const quality = useConfigurator((state) => state.quality);
  const setQuality = useConfigurator((state) => state.setQuality);

  const [copied, setCopied] = useState(false);
  const t = copy[language];

  const nextQuality = () => {
    const currentIndex = qualityOrder.indexOf(quality);
    const nextIndex = (currentIndex + 1) % qualityOrder.length;
    setQuality(qualityOrder[nextIndex]);
  };

  const copyLink = async () => {
    const url = window.location.href;

    try {
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
        <div className="hero-lockup">
          <div className="hero-identity">
            <PorscheCrest />

            <div className="identity-copy">
              <div className="nine-eleven-lockup">
                <span className="nine-eleven">911</span>
                <span className="by-marcos-script">by Marcos</span>
              </div>

              <span className="hero-specs">{specsCopy[language]}</span>
            </div>
          </div>
        </div>

        <div className="top-signature porsche-wordmark" aria-label="Porsche">
          PORSCHE
        </div>

        <div className="top-actions">
          <button
            onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
            aria-label="Change language"
          >
            {language.toUpperCase()}
          </button>

          <button onClick={() => setSoundEnabled(!soundEnabled)}>
            {t.sound}: {soundEnabled ? t.on.toUpperCase() : t.off.toUpperCase()}
          </button>

          <button onClick={nextQuality}>
            {t.quality}: {quality.toUpperCase()}
          </button>

          <button onClick={copyLink}>{t.share}</button>
        </div>
      </header>

      {copied && <div className="toast">{t.copied}</div>}
    </>
  );
}
