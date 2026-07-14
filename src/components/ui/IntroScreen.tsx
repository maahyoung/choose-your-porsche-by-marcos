"use client";

import { copy } from "@/config/translations";
import { useConfigurator } from "@/store/configurator";

export function IntroScreen() {
  const entered = useConfigurator((state) => state.entered);
  const enter = useConfigurator((state) => state.enter);
  const language = useConfigurator((state) => state.language);
  const t = copy[language];

  if (entered) return null;

  return (
    <section className="intro" aria-label="Welcome">
      <div className="intro-crest-backdrop" aria-hidden="true">
        <img src="/brand/porsche-crest.svg" alt="" />
      </div>

      <div className="intro-content">
        <h1 className="intro-title">
          <span>Build your own</span>
          <span>911</span>
        </h1>

        <p className="intro-byline">{t.by}</p>
        <p className="intro-tagline">{t.tagline}</p>

        <img
          className="intro-brand-wordmark"
          src="/brand/porsche-logo-alt.svg"
          alt="Porsche"
        />

        <p className="intro-sound-note">{t.soundNote}</p>

        <div className="intro-actions">
          <button className="intro-primary" onClick={() => enter(true)}>{t.enterSound}</button>
          <button className="intro-secondary" onClick={() => enter(false)}>{t.enterMuted}</button>
        </div>
      </div>
    </section>
  );
}
