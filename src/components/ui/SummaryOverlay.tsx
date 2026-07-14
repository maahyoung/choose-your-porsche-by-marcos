"use client";

import { AnimatePresence, motion } from "framer-motion";
import { copy } from "@/config/translations";
import { getPaint } from "@/config/paints";
import { useConfigurator } from "@/store/configurator";
import { Signature } from "./Signature";

export function SummaryOverlay() {
  const language = useConfigurator((state) => state.language);
  const summaryMode = useConfigurator((state) => state.summaryMode);
  const setSummaryMode = useConfigurator((state) => state.setSummaryMode);
  const replayTransition = useConfigurator((state) => state.replayTransition);
  const paintId = useConfigurator((state) => state.paintId);
  const t = copy[language];
  const paint = getPaint(paintId);

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
    const gradient = context.createLinearGradient(0, output.height * 0.56, 0, output.height);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.78)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, output.width, output.height);

    context.fillStyle = "rgba(255,255,255,0.6)";
    context.font = `${12 * scale}px Arial`;
    context.letterSpacing = `${3 * scale}px`;
    context.fillText("CHOOSE YOUR PORSCHE", 52 * scale, output.height - 114 * scale);

    context.fillStyle = "#ffffff";
    context.font = `600 ${34 * scale}px Arial`;
    context.letterSpacing = "0px";
    context.fillText("911 GT3 RS", 52 * scale, output.height - 72 * scale);

    context.fillStyle = "rgba(255,255,255,0.66)";
    context.font = `${14 * scale}px Arial`;
    context.fillText(`${paint.name[language]} · MARCOS911`, 52 * scale, output.height - 42 * scale);

    context.textAlign = "right";
    context.fillStyle = "rgba(255,255,255,0.92)";
    context.font = `700 ${17 * scale}px Arial`;
    context.letterSpacing = `${7 * scale}px`;
    context.fillText("PORSCHE", output.width - 46 * scale, output.height - 70 * scale);

    context.fillStyle = "rgba(255,255,255,0.42)";
    context.font = `${9 * scale}px Arial`;
    context.letterSpacing = "0px";
    context.fillText(
      "Unofficial personal project · Not affiliated with Porsche AG",
      output.width - 46 * scale,
      output.height - 42 * scale,
    );

    const anchor = document.createElement("a");
    anchor.href = output.toDataURL("image/png");
    anchor.download = `choose-your-porsche-${paintId}-by-marcos.png`;
    anchor.click();
  };

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
            transition={{ delay: 0.35, duration: 0.72 }}
          >
            <p>{t.configured}</p>
            <h2>{t.summaryTitle}</h2>
            <div className="summary-specs">
              <span>992 · 911 GT3 RS</span>
              <span>{paint.name[language]} · MARCOS911</span>
            </div>
            <Signature />
            <small className="summary-disclaimer">Unofficial personal project · Not affiliated with Porsche AG</small>
          </motion.div>
          <div className="summary-actions">
            <button onClick={() => setSummaryMode(false)}>{t.edit}</button>
            <button onClick={saveImage}>{t.save}</button>
            <button onClick={replayTransition}>{t.replay}</button>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
