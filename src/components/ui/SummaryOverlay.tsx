"use client";

import { AnimatePresence, motion } from "framer-motion";
import { copy } from "@/config/translations";
import { getPaint } from "@/config/paints";
import { getCaliperOption } from "@/config/brakes";
import { getWheelFinishOption } from "@/config/wheels";
import { useConfigurator } from "@/store/configurator";

const performanceSpecs = [
  ["Engine", "4.0L naturally aspirated flat-six"],
  ["Power", "518 hp"],
  ["0–60 mph", "3.0 s"],
  ["Top speed", "184 mph / 296 km/h"],
];

export function SummaryOverlay() {
  const language = useConfigurator((state) => state.language);
  const summaryMode = useConfigurator((state) => state.summaryMode);
  const paintId = useConfigurator((state) => state.paintId);
  const wheelId = useConfigurator((state) => state.wheelId);
  const caliperId = useConfigurator((state) => state.caliperId);
  const hoodOpen = useConfigurator((state) => state.hoodOpen);
  const leftDoorOpen = useConfigurator((state) => state.leftDoorOpen);
  const t = copy[language];
  const paint = getPaint(paintId);
  const wheel = getWheelFinishOption(wheelId);
  const caliper = getCaliperOption(caliperId);

  return (
    <AnimatePresence>
      {summaryMode && (
        <motion.section
          className="summary-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="summary-title"
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.28, duration: 0.72 }}
          >
            <p>{t.configured}</p>

            <h2 className="summary-hero-title">
              <span className="summary-hero-prefix">
                {language === "pt" ? "Seu" : "Your"}
              </span>
              <span className="summary-hero-model">911 GT3 RS</span>
            </h2>

            <div className="summary-specs">
              <span>992 · 911 GT3 RS</span>
              <span>{paint.name[language]} · {wheel.name[language]} · {caliper.name[language]} {t.calipers}{hoodOpen ? ` · ${t.frontHood}: ${t.on}` : ""}{leftDoorOpen ? ` · ${t.leftDoor}: ${t.on}` : ""} · by Marcos</span>
            </div>

            <div className="summary-spec-grid">
              {performanceSpecs.map(([label, value]) => (
                <div key={label} className="spec-card">
                  <small>{label}</small>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="summary-bottom-brand">
            <img src="/brand/porsche-wordmark.svg" alt="Porsche" />
            <small>Unofficial personal project</small>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
