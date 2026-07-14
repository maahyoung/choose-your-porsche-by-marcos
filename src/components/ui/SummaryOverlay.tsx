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
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const image = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = image;
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
            transition={{ delay: 0.45, duration: 0.7 }}
          >
            <p>{t.configured}</p>
            <h2>{t.summaryTitle}</h2>
            <span>{paint.name[language]} · MARCOS911</span>
            <Signature />
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
