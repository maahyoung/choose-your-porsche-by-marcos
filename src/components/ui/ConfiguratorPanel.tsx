"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PAINTS, getPaint } from "@/config/paints";
import { copy } from "@/config/translations";
import { StepId, useConfigurator } from "@/store/configurator";

const steps: StepId[] = ["paint", "wheels", "exterior", "graphics", "aero", "stance", "lighting", "summary"];

function Toggle({ label, active, onClick, onLabel, offLabel }: { label: string; active: boolean; onClick: () => void; onLabel: string; offLabel: string }) {
  return (
    <button className="control-row" onClick={onClick} aria-pressed={active}>
      <span>{label}</span>
      <span className={`toggle ${active ? "active" : ""}`}>
        <span />
        <small>{active ? onLabel : offLabel}</small>
      </span>
    </button>
  );
}

export function ConfiguratorPanel() {
  const language = useConfigurator((state) => state.language);
  const activeStep = useConfigurator((state) => state.activeStep);
  const setActiveStep = useConfigurator((state) => state.setActiveStep);
  const paintId = useConfigurator((state) => state.paintId);
  const setPaintId = useConfigurator((state) => state.setPaintId);
  const headlights = useConfigurator((state) => state.headlights);
  const taillights = useConfigurator((state) => state.taillights);
  const hazards = useConfigurator((state) => state.hazards);
  const toggleHeadlights = useConfigurator((state) => state.toggleHeadlights);
  const toggleTaillights = useConfigurator((state) => state.toggleTaillights);
  const toggleHazards = useConfigurator((state) => state.toggleHazards);
  const setSummaryMode = useConfigurator((state) => state.setSummaryMode);
  const t = copy[language];
  const selectedPaint = getPaint(paintId);

  const openSummary = () => {
    setActiveStep("summary");
    setSummaryMode(true);
  };

  return (
    <aside className="configurator-panel">
      <nav className="step-nav" aria-label="Configurator steps">
        {steps.map((step, index) => (
          <button
            key={step}
            className={activeStep === step ? "active" : ""}
            onClick={() => {
              setActiveStep(step);
              if (step === "summary") setSummaryMode(true);
            }}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{t[step]}</strong>
          </button>
        ))}
      </nav>

      <div className="step-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.28 }}
          >
            <p className="step-kicker">{t[activeStep]}</p>
            {activeStep === "paint" && (
              <>
                <h2>{selectedPaint.name[language]}</h2>
                <div className="paint-grid">
                  {PAINTS.map((paint) => (
                    <button
                      key={paint.id}
                      className={`paint-swatch ${paint.id === paintId ? "active" : ""}`}
                      onClick={() => setPaintId(paint.id)}
                      aria-label={paint.name[language]}
                    >
                      <span style={{ background: paint.color }} />
                      <small>{paint.name[language]}</small>
                    </button>
                  ))}
                </div>
              </>
            )}

            {activeStep === "lighting" && (
              <div className="control-stack">
                <Toggle label={t.headlights} active={headlights} onClick={toggleHeadlights} onLabel={t.on} offLabel={t.off} />
                <Toggle label={t.taillights} active={taillights} onClick={toggleTaillights} onLabel={t.on} offLabel={t.off} />
                <Toggle label={t.hazards} active={hazards} onClick={toggleHazards} onLabel={t.on} offLabel={t.off} />
              </div>
            )}

            {activeStep !== "paint" && activeStep !== "lighting" && activeStep !== "summary" && (
              <div className="coming-soon">
                <span>PHASE 02</span>
                <p>{t.comingSoon}</p>
              </div>
            )}

            {activeStep === "summary" && (
              <div className="summary-mini">
                <h2>{t.summaryTitle}</h2>
                <p>{selectedPaint.name[language]} · MARCOS911</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <button className="view-build-button" onClick={openSummary}>{t.viewBuild}</button>
    </aside>
  );
}
