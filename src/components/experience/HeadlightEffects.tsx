"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { EnvironmentId } from "@/config/details";

const HEADLIGHT_LEFT: [number, number, number] = [0.696, 0.68, 1.82];
const HEADLIGHT_RIGHT: [number, number, number] = [-0.696, 0.68, 1.82];

function createRadialTexture() {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  const center = (size - 1) / 2;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (x - center) / center;
      const dy = (y - center) / center;
      const distance = Math.min(1, Math.sqrt(dx * dx + dy * dy));
      const alpha = Math.pow(1 - distance, 2.6);
      const offset = (y * size + x) * 4;
      data[offset] = 255;
      data[offset + 1] = 255;
      data[offset + 2] = 255;
      data[offset + 3] = Math.round(alpha * 255);
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function GlowSprite({
  position,
  scale,
  opacity,
}: {
  position: [number, number, number];
  scale: [number, number, number];
  opacity: number;
}) {
  const texture = useMemo(() => createRadialTexture(), []);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <sprite position={position} scale={scale} renderOrder={24}>
      <spriteMaterial
        map={texture}
        color="#e8f6ff"
        transparent
        opacity={opacity}
        depthWrite={false}
        depthTest
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </sprite>
  );
}

export function HeadlightEffects({
  headlights,
  environmentId,
}: {
  headlights: boolean;
  environmentId: EnvironmentId;
}) {
  const leftSpot = useRef<THREE.SpotLight>(null);
  const rightSpot = useRef<THREE.SpotLight>(null);
  const leftTarget = useRef<THREE.Object3D>(null);
  const rightTarget = useRef<THREE.Object3D>(null);
  const isNight = environmentId === "night";
  const beamIntensity = isNight ? 104 : environmentId === "studio" ? 76 : 52;

  useEffect(() => {
    if (leftSpot.current && leftTarget.current) leftSpot.current.target = leftTarget.current;
    if (rightSpot.current && rightTarget.current) rightSpot.current.target = rightTarget.current;
  }, []);

  return (
    <group name="headlight_effects">
      <object3D ref={leftTarget} position={[0.64, 0.26, 8]} />
      <object3D ref={rightTarget} position={[-0.64, 0.26, 8]} />

      <spotLight
        ref={leftSpot}
        position={HEADLIGHT_LEFT}
        color="#eaf6ff"
        intensity={headlights ? beamIntensity : 0}
        distance={18}
        angle={0.19}
        penumbra={0.78}
        decay={1.55}
      />
      <spotLight
        ref={rightSpot}
        position={HEADLIGHT_RIGHT}
        color="#eaf6ff"
        intensity={headlights ? beamIntensity : 0}
        distance={18}
        angle={0.19}
        penumbra={0.78}
        decay={1.55}
      />

      <pointLight
        position={HEADLIGHT_LEFT}
        color="#e8f5ff"
        intensity={headlights ? (isNight ? 7 : 4) : 0}
        distance={2.4}
        decay={1.6}
      />
      <pointLight
        position={HEADLIGHT_RIGHT}
        color="#e8f5ff"
        intensity={headlights ? (isNight ? 7 : 4) : 0}
        distance={2.4}
        decay={1.6}
      />

      {headlights && (
        <>
          <GlowSprite position={HEADLIGHT_LEFT} scale={[0.48, 0.48, 1]} opacity={0.62} />
          <GlowSprite position={HEADLIGHT_RIGHT} scale={[0.48, 0.48, 1]} opacity={0.62} />
          <GlowSprite position={HEADLIGHT_LEFT} scale={[0.18, 0.18, 1]} opacity={0.92} />
          <GlowSprite position={HEADLIGHT_RIGHT} scale={[0.18, 0.18, 1]} opacity={0.92} />
        </>
      )}
    </group>
  );
}
