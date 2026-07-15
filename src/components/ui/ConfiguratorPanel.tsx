"use client";

import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PAINTS, getPaint } from "@/config/paints";
import { CALIPER_OPTIONS, getCaliperOption } from "@/config/brakes";
import { WHEEL_FINISH_OPTIONS, getWheelFinishOption } from "@/config/wheels";
import {
  CAMERA_PRESET_OPTIONS,
  ENVIRONMENT_OPTIONS,
  EXHAUST_FINISH_OPTIONS,
  MIRROR_FINISH_OPTIONS,
  ROOF_FINISH_OPTIONS,
  getCameraPreset,
  getEnvironment,
  getExhaustFinish,
  getMirrorFinish,
  getRoofFinish,
} from "@/config/details";
import { copy, type Language } from "@/config/translations";
import { StepId, useConfigurator } from "@/store/configurator";

const steps: StepId[] = [
  "paint",
  "wheels",
  "details",
  "exterior",
  "aero",
  "lighting",
  "camera",
  "summary",
];

type NamedChoice<T extends string> = {
  id: T;
  name: Record<Language, string>;
  preview: string;
};

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

function SelectionGrid<T extends string>({
  options,
  selectedId,
  language,
  onSelect,
  previewFor,
  className = "",
}: {
  options: NamedChoice<T>[];
  selectedId: T;
  language: Language;
  onSelect: (id: T) => void;
  previewFor?: (option: NamedChoice<T>) => string;
  className?: string;
}) {
  return (
    <div className={`selection-grid ${className}`}>
      {options.map((option) => {
        const active = option.id === selectedId;
        const preview = previewFor?.(option) ?? option.preview;

        return (
          <button
            key={option.id}
            className={`selection-option ${active ? "active" : ""}`}
            onClick={() => onSelect(option.id)}
            aria-pressed={active}
          >
            <span
              className="selection-preview"
              style={{ "--selection-preview": preview } as CSSProperties}
              aria-hidden="true"
            />
            <small>{option.name[language]}</small>
            <span className="selection-check" aria-hidden="true">
              {active && <CheckIcon />}
            </span>
          </button>
        );
      })}
    </div>
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
  const wheelId = useConfigurator((state) => state.wheelId);
  const setWheelId = useConfigurator((state) => state.setWheelId);
  const caliperId = useConfigurator((state) => state.caliperId);
  const setCaliperId = useConfigurator((state) => state.setCaliperId);
  const roofFinishId = useConfigurator((state) => state.roofFinishId);
  const setRoofFinishId = useConfigurator((state) => state.setRoofFinishId);
  const mirrorFinishId = useConfigurator((state) => state.mirrorFinishId);
  const setMirrorFinishId = useConfigurator((state) => state.setMirrorFinishId);
  const exhaustFinishId = useConfigurator((state) => state.exhaustFinishId);
  const setExhaustFinishId = useConfigurator((state) => state.setExhaustFinishId);
  const environmentId = useConfigurator((state) => state.environmentId);
  const setEnvironmentId = useConfigurator((state) => state.setEnvironmentId);
  const cameraPresetId = useConfigurator((state) => state.cameraPresetId);
  const setCameraPresetId = useConfigurator((state) => state.setCameraPresetId);
  const hoodOpen = useConfigurator((state) => state.hoodOpen);
  const toggleHoodOpen = useConfigurator((state) => state.toggleHoodOpen);
  const leftDoorOpen = useConfigurator((state) => state.leftDoorOpen);
  const toggleLeftDoorOpen = useConfigurator((state) => state.toggleLeftDoorOpen);
  const rightDoorOpen = useConfigurator((state) => state.rightDoorOpen);
  const toggleRightDoorOpen = useConfigurator((state) => state.toggleRightDoorOpen);
  const wingInstalled = useConfigurator((state) => state.wingInstalled);
  const toggleWingInstalled = useConfigurator((state) => state.toggleWingInstalled);
  const headlights = useConfigurator((state) => state.headlights);
  const taillights = useConfigurator((state) => state.taillights);
  const toggleHeadlights = useConfigurator((state) => state.toggleHeadlights);
  const toggleTaillights = useConfigurator((state) => state.toggleTaillights);
  const summaryMode = useConfigurator((state) => state.summaryMode);
  const setSummaryMode = useConfigurator((state) => state.setSummaryMode);
  const replayTransition = useConfigurator((state) => state.replayTransition);

  const t = copy[language];
  const selectedPaint = getPaint(paintId);
  const selectedWheel = getWheelFinishOption(wheelId);
  const selectedCaliper = getCaliperOption(caliperId);
  const selectedRoof = getRoofFinish(roofFinishId);
  const selectedMirror = getMirrorFinish(mirrorFinishId);
  const selectedExhaust = getExhaustFinish(exhaustFinishId);
  const selectedEnvironment = getEnvironment(environmentId);
  const selectedCamera = getCameraPreset(cameraPresetId);

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

    const sceneBackground =
      environmentId === "night"
        ? "#07101e"
        : environmentId === "studio"
          ? "#171a1e"
          : "#edf1f4";
    context.fillStyle = sceneBackground;
    context.fillRect(0, 0, output.width, output.height);
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
      `${selectedPaint.name[language]} · ${selectedWheel.name[language]} · ${selectedRoof.name[language]} · ${selectedMirror.name[language]} · ${selectedExhaust.name[language]} · 518 HP`,
      52 * scale,
      output.height - 42 * scale,
    );

    const anchor = document.createElement("a");
    anchor.href = output.toDataURL("image/png");
    anchor.download = `choose-your-porsche-${paintId}-${wheelId}-${caliperId}-${roofFinishId}-${mirrorFinishId}-${exhaustFinishId}${!wingInstalled ? "-wing-removed" : ""}-by-marcos.png`;
    anchor.click();
  };

  return (
    <aside className={`configurator-panel ${summaryMode ? "summary-active" : ""}`}>
      <nav className="step-nav" aria-label="Configurator steps">
        {steps.map((step) => (
          <button
            key={step}
            className={activeStep === step ? "active" : ""}
            onClick={() => {
              setActiveStep(step);
              if (step === "summary") setSummaryMode(true);
              else if (summaryMode) setSummaryMode(false);
            }}
          >
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
              <div className="wheel-brake-options">
                <section className="wheel-finish-section">
                  <h2>{t.wheelFinish}</h2>
                  <div className="wheel-finish-grid">
                    {WHEEL_FINISH_OPTIONS.map((option) => {
                      const active = option.id === wheelId;

                      return (
                        <button
                          key={option.id}
                          className={`wheel-finish-option ${active ? "active" : ""}`}
                          onClick={() => setWheelId(option.id)}
                          aria-pressed={active}
                        >
                          <span
                            className="wheel-finish-preview"
                            style={{ "--wheel-finish": option.color } as CSSProperties}
                            aria-hidden="true"
                          >
                            <i />
                          </span>
                          <small>{option.name[language]}</small>
                          <span className="wheel-finish-check" aria-hidden="true">
                            {active && <CheckIcon />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="option-next-note">{t.wheelDesignNote}</p>
                </section>

                <section className="caliper-section">
                  <h2>{t.brakeCalipers}</h2>
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
                </section>
              </div>
            )}

            {activeStep === "details" && (
              <div className="detail-options">
                <section>
                  <h2>{t.roofFinish}</h2>
                  <SelectionGrid
                    options={ROOF_FINISH_OPTIONS}
                    selectedId={roofFinishId}
                    language={language}
                    onSelect={setRoofFinishId}
                    previewFor={(option) =>
                      option.id === "body-color" ? selectedPaint.color : option.preview
                    }
                  />
                </section>

                <section>
                  <h2>{t.mirrorFinish}</h2>
                  <SelectionGrid
                    options={MIRROR_FINISH_OPTIONS}
                    selectedId={mirrorFinishId}
                    language={language}
                    onSelect={setMirrorFinishId}
                    previewFor={(option) =>
                      option.id === "body-color" ? selectedPaint.color : option.preview
                    }
                  />
                </section>

                <section>
                  <h2>{t.exhaustFinish}</h2>
                  <SelectionGrid
                    options={EXHAUST_FINISH_OPTIONS}
                    selectedId={exhaustFinishId}
                    language={language}
                    onSelect={setExhaustFinishId}
                  />
                </section>
              </div>
            )}

            {activeStep === "exterior" && (
              <div className="control-stack">
                <h2>{t.frontHood}</h2>
                <p className="option-next-note">{t.frontHoodNote}</p>
                <Toggle
                  label={t.frontHood}
                  active={hoodOpen}
                  onClick={toggleHoodOpen}
                  onLabel={t.on}
                  offLabel={t.off}
                />

                <h2>{t.leftDoor}</h2>
                <p className="option-next-note">{t.leftDoorNote}</p>
                <Toggle
                  label={t.leftDoor}
                  active={leftDoorOpen}
                  onClick={toggleLeftDoorOpen}
                  onLabel={t.on}
                  offLabel={t.off}
                />

                <h2>{t.rightDoor}</h2>
                <p className="option-next-note">{t.rightDoorNote}</p>
                <Toggle
                  label={t.rightDoor}
                  active={rightDoorOpen}
                  onClick={toggleRightDoorOpen}
                  onLabel={t.on}
                  offLabel={t.off}
                />
              </div>
            )}

            {activeStep === "aero" && (
              <div className="control-stack">
                <h2>{t.rearWing}</h2>
                <p className="option-next-note">{t.rearWingNote}</p>
                <Toggle
                  label={t.rearWing}
                  active={wingInstalled}
                  onClick={toggleWingInstalled}
                  onLabel={t.on}
                  offLabel={t.off}
                />
              </div>
            )}

            {activeStep === "lighting" && (
              <div className="lighting-options">
                <section>
                  <h2>{t.environment}</h2>
                  <p className="option-next-note">{t.environmentNote}</p>
                  <SelectionGrid
                    options={ENVIRONMENT_OPTIONS}
                    selectedId={environmentId}
                    language={language}
                    onSelect={setEnvironmentId}
                    className="environment-grid"
                  />
                </section>

                <section className="control-stack light-controls">
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
                </section>
              </div>
            )}

            {activeStep === "camera" && (
              <div className="camera-options">
                <h2>{t.cameraPresets}</h2>
                <p className="option-next-note">{t.cameraNote}</p>
                <SelectionGrid
                  options={CAMERA_PRESET_OPTIONS}
                  selectedId={cameraPresetId}
                  language={language}
                  onSelect={setCameraPresetId}
                  className="camera-grid"
                />
              </div>
            )}

            {activeStep === "summary" && (
              <div className="summary-mini">
                <h2>{t.summaryTitle}</h2>
                <p>
                  {selectedPaint.name[language]} · {selectedWheel.name[language]} · {selectedCaliper.name[language]} {t.calipers} · {selectedRoof.name[language]} · {selectedMirror.name[language]} · {selectedExhaust.name[language]} · {selectedEnvironment.name[language]} · {selectedCamera.name[language]}{hoodOpen ? ` · ${t.frontHood}` : ""}{leftDoorOpen ? ` · ${t.leftDoor}` : ""}{rightDoorOpen ? ` · ${t.rightDoor}` : ""}{!wingInstalled ? ` · ${t.rearWing}: ${t.off}` : ""} · MARCOS911
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
