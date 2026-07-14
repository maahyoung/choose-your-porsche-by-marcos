"use client";

import { AnimatePresence, motion } from "framer-motion";
import { copy } from "@/config/translations";
import { useConfigurator } from "@/store/configurator";
import { Signature } from "./Signature";

function playSyntheticIntro() {
  const AudioContextClass = window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const sub = context.createOscillator();
  const gain = context.createGain();
  const subGain = context.createGain();
  oscillator.type = "sawtooth";
  sub.type = "sine";
  oscillator.frequency.setValueAtTime(54, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(118, context.currentTime + 1.15);
  oscillator.frequency.exponentialRampToValueAtTime(72, context.currentTime + 1.8);
  sub.frequency.setValueAtTime(38, context.currentTime);
  sub.frequency.exponentialRampToValueAtTime(62, context.currentTime + 1.3);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.055, context.currentTime + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.9);
  subGain.gain.setValueAtTime(0.0001, context.currentTime);
  subGain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.12);
  subGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.9);
  oscillator.connect(gain).connect(context.destination);
  sub.connect(subGain).connect(context.destination);
  oscillator.start();
  sub.start();
  oscillator.stop(context.currentTime + 2);
  sub.stop(context.currentTime + 2);
}

export function IntroScreen() {
  const entered = useConfigurator((state) => state.entered);
  const language = useConfigurator((state) => state.language);
  const setLanguage = useConfigurator((state) => state.setLanguage);
  const enter = useConfigurator((state) => state.enter);
  const t = copy[language];

  const handleEnter = (withSound: boolean) => {
    if (withSound) playSyntheticIntro();
    enter(withSound);
  };

  return (
    <AnimatePresence>
      {!entered && (
        <motion.section
          className="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.035 }}
          transition={{ duration: 1.05, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="intro-beam" />
          <div className="intro-top">
            <button className="language-toggle" onClick={() => setLanguage(language === "en" ? "pt" : "en")}>
              {language === "en" ? "PT" : "EN"}
            </button>
          </div>
          <motion.div
            className="intro-copy"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.95, delay: 0.2 }}
          >
            <p className="eyebrow">MARCOS / 911 CONFIGURATOR</p>
            <h1>{t.title}</h1>
            <p className="intro-by">{t.by}</p>
            <p className="tagline">{t.tagline}</p>
            <Signature />
          </motion.div>
          <motion.div
            className="intro-actions"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
          >
            <p className="sound-note">{t.soundNote}</p>
            <div className="button-row">
              <button className="primary-button" onClick={() => handleEnter(true)}>{t.enterSound}</button>
              <button className="secondary-button" onClick={() => handleEnter(false)}>{t.enterMuted}</button>
            </div>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
