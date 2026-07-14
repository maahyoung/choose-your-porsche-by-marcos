"use client";

import { copy } from "@/config/translations";
import { useConfigurator } from "@/store/configurator";
import { Signature } from "./Signature";

export function RotateDevice() {
  const language = useConfigurator((state) => state.language);
  const t = copy[language];
  return (
    <div className="rotate-device">
      <div className="phone-icon"><span /></div>
      <h2>{t.rotate}</h2>
      <p>{t.rotateDetail}</p>
      <Signature />
    </div>
  );
}
