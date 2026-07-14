"use client";

import { useState } from "react";
import { copy } from "@/config/translations";
import { Quality, useConfigurator } from "@/store/configurator";

const qualityOrder: Quality[] = ["performance", "balanced", "ultra"];

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
