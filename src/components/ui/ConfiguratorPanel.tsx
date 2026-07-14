"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PAINTS, getPaint } from "@/config/paints";
import { CALIPER_OPTIONS, getCaliperOption } from "@/config/brakes";
import { copy } from "@/config/translations";
import { StepId, useConfigurator } from "@/store/configurator";

const steps: StepId[] = [
  "paint",
  "wheels",
  "exterior",
  "graphics",
  "aero",
  "stance",
  "lighting",
  "summary",
];

function Toggle({
  label,
  active,
  onClick,
  onLabel,
  offLabel,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  onLabel: string;
  offLabel: string;
}) {
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

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m4 20 4.2-1 10.6-10.6a2 2 0 0 0-2.8-2.8L5.4 16.2 4 20Z" />
      <path d="m14.8 6.8 2.4 2.4" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v11m0 0 4-4m-4 4-4-4" />
      <path d="M5 17v3h14v-3" />
    </svg>
  );
}

function ReplayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      <path d="M20 5v6h-6" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 12.5 3.4 3.4L18 7.8" />
    </svg>
  );
}

export function ConfiguratorPanel() {
  const language = useConfigurator((state) => state.language);
  const activeStep = useConfigurator((state) => state.activeStep);
  const setActiveStep = useConfigurator((state) => state.setActiveStep);
  const paintId = useConfigurator((state) => state.paintId);
  const setPaintId = useConfigurator((state) => state.setPaintId);
  const caliperId = useConfigurator((state) => state.caliperId);
  const setCaliperId = useConfigurator((state) => state.setCaliperId);
  const headlights = useConfigurator((state) => state.headlights);
  const taillights = useConfigurator((state) => state.taillights);
  const hazards = useConfigurator((state) => state.hazards);
  const toggleHeadlights = useConfigurator((state) => state.toggleHeadlights);
  const toggleTaillights = useConfigurator((state) => state.toggleTaillights);
  const toggleHazards = useConfigurator((state) => state.toggleHazards);
  const summaryMode = useConfigurator((state) => state.summaryMode);
  const setSummaryMode = useConfigurator((state) => state.setSummaryMode);
  const replayTransition = useConfigurator((state) => state.replayTransition);
  const t = copy[language];
  const selectedPaint = getPaint(paintId);
  const selectedCaliper = getCaliperOption(caliperId);

  const openSummary = () => {
    setActiveStep("summary");
    setSummaryMode(true);
  };

  const editConfiguration = () => {
    setSummaryMode(false);
    setActiveStep("paint");
  };

  const saveImage = () => {
    const source = document.querySelector<HTMLCanvasElement>("canvas");
    if (!source) return;

    const output = document.createElement("canvas");
    output.width = source.width;
    output.height = source.height;

    const context = output.getContext("2d");
    if (!context) return;

    context.drawImage(source, 0, 0, output.width, output.height);

    const scale = Math.max(1, output.width / 1600);
    const gradient = context.createLinearGradient(
      0,
      output.height * 0.56,
      0,
      output.height,
    );
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(1, "rgba(239,242,246,0.94)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, output.width, output.height);

    context.fillStyle = "#11151a";
    context.font = `600 ${34 * scale}px Arial`;
    context.fillText("911 GT3 RS", 52 * scale, output.height - 72 * scale);

    context.fillStyle = "rgba(17,21,26,0.66)";
    context.font = `${14 * scale}px Arial`;
    context.fillText(
      `${selectedPaint.name[language]} · ${selectedCaliper.name[language]} ${t.calipers} · 518 HP`,
      52 * scale,
      output.height - 42 * scale,
    );

    const anchor = document.createElement("a");
    anchor.href = output.toDataURL("image/png");
    anchor.download = `choose-your-porsche-${paintId}-${caliperId}-by-marcos.png`;
    anchor.click();
  };

  return (
    <aside className={`configurator-panel ${summaryMode ? "summary-active" : ""}`}>
      <nav className="step-nav" aria-label="Configurator steps">
        {steps.map((step, index) => (
          <button
            key={step}
            className={activeStep === step ? "active" : ""}
            onClick={() => {
              setActiveStep(step);
              if (step === "summary") setSummaryMode(true);
              else if (summaryMode) setSummaryMode(false);
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
            key={`${activeStep}-${summaryMode ? "summary" : "edit"}`}
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

            {activeStep === "wheels" && (
              <section className="caliper-section" aria-labelledby="caliper-heading">
                <h2 id="caliper-heading">{t.brakeCalipers}</h2>
                <div className="caliper-grid">
                  {CALIPER_OPTIONS.map((option) => {
                    const active = option.id === caliperId;

                    return (
                      <button
                        key={option.id}
                        className={`caliper-option ${active ? "active" : ""}`}
                        onClick={() => setCaliperId(option.id)}
                        aria-pressed={active}
                      >
                        <span
                          className="caliper-color"
                          style={{ backgroundColor: option.color }}
                          aria-hidden="true"
                        />
                        <span className="caliper-option-copy">
                          <strong>{option.name[language]}</strong>
                          <small>{t.brakeCalipers}</small>
                        </span>
                        <span className="caliper-check" aria-hidden="true">
                          {active && <CheckIcon />}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="option-next-note">{t.wheelsNext}</p>
              </section>
            )}

            {activeStep === "lighting" && (
              <div className="control-stack">
                <Toggle
                  label={t.headlights}
                  active={headlights}
                  onClick={toggleHeadlights}
                  onLabel={t.on}
                  offLabel={t.off}
                />
                <Toggle
                  label={t.taillights}
                  active={taillights}
                  onClick={toggleTaillights}
                  onLabel={t.on}
                  offLabel={t.off}
                />
                <Toggle
                  label={t.hazards}
                  active={hazards}
                  onClick={toggleHazards}
                  onLabel={t.on}
                  offLabel={t.off}
                />
              </div>
            )}

            {activeStep !== "paint" &&
              activeStep !== "wheels" &&
              activeStep !== "lighting" &&
              activeStep !== "summary" && (
                <div className="coming-soon">
                  <span>PHASE 02</span>
                  <p>{t.comingSoon}</p>
                </div>
              )}

            {activeStep === "summary" && (
              <div className="summary-mini">
                <h2>{t.summaryTitle}</h2>
                <p>
                  {selectedPaint.name[language]} · {selectedCaliper.name[language]} {t.calipers} · MARCOS911
                </p>

                {summaryMode && (
                  <div className="summary-panel-actions" aria-label="Summary actions">
                    <button onClick={editConfiguration}>
                      <PencilIcon />
                      <span>{t.edit}</span>
                    </button>
                    <button onClick={saveImage}>
                      <DownloadIcon />
                      <span>{t.save}</span>
                    </button>
                    <button onClick={replayTransition}>
                      <ReplayIcon />
                      <span>{t.replay}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {!summaryMode && (
        <button className="view-build-button" onClick={openSummary}>
          <span>{t.viewBuild}</span>
          <ArrowRightIcon />
        </button>
      )}
    </aside>
  );
}
