"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { EnvironmentId } from "@/config/details";

const HEADLIGHT_LEFT: [number, number, number] = [0.696, 0.68, 1.82];
const HEADLIGHT_RIGHT: [number, number, number] = [-0.696, 0.68, 1.82];
const MIRROR_LEFT: [number, number, number] = [0.94, 0.895, 0.418];
const MIRROR_RIGHT: [number, number, number] = [-0.94, 0.895, 0.418];
const TAIL_LEFT: [number, number, number] = [0.705, 0.758, -2.205];
const TAIL_RIGHT: [number, number, number] = [-0.705, 0.758, -2.205];

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
  color,
  opacity,
}: {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  opacity: number;
}) {
  const texture = useMemo(() => createRadialTexture(), []);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <sprite position={position} scale={scale} renderOrder={24}>
      <spriteMaterial
        map={texture}
        color={color}
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

function SignalStrip({
  position,
  rotation,
  scale,
  active,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  active: boolean;
}) {
  return (
    <mesh position={position} rotation={rotation} scale={scale} renderOrder={25}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        color={active ? "#ff9a16" : "#3a210c"}
        transparent
        opacity={active ? 0.98 : 0.28}
        depthWrite={false}
        depthTest
        blending={active ? THREE.AdditiveBlending : THREE.NormalBlending}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function VehicleLightEffects({
  headlights,
  indicatorsOn,
  environmentId,
  leftMirrorVisible,
  rightMirrorVisible,
}: {
  headlights: boolean;
  indicatorsOn: boolean;
  environmentId: EnvironmentId;
  leftMirrorVisible: boolean;
  rightMirrorVisible: boolean;
}) {
  const leftSpot = useRef<THREE.SpotLight>(null);
  const rightSpot = useRef<THREE.SpotLight>(null);
  const leftTarget = useRef<THREE.Object3D>(null);
  const rightTarget = useRef<THREE.Object3D>(null);
  const isNight = environmentId === "night";
  const beamIntensity = isNight ? 115 : environmentId === "studio" ? 82 : 58;

  useEffect(() => {
    if (leftSpot.current && leftTarget.current) {
      leftSpot.current.target = leftTarget.current;
    }
    if (rightSpot.current && rightTarget.current) {
      rightSpot.current.target = rightTarget.current;
    }
  }, []);

  return (
    <group name="v27_vehicle_light_effects">
      <object3D ref={leftTarget} position={[0.64, 0.26, 8]} />
      <object3D ref={rightTarget} position={[-0.64, 0.26, 8]} />

      <spotLight
        ref={leftSpot}
        position={HEADLIGHT_LEFT}
        color="#eaf6ff"
        intensity={headlights ? beamIntensity : 0}
        distance={18}
        angle={0.19}
        penumbra={0.76}
        decay={1.55}
      />
      <spotLight
        ref={rightSpot}
        position={HEADLIGHT_RIGHT}
        color="#eaf6ff"
        intensity={headlights ? beamIntensity : 0}
        distance={18}
        angle={0.19}
        penumbra={0.76}
        decay={1.55}
      />

      <pointLight
        position={HEADLIGHT_LEFT}
        color="#e8f5ff"
        intensity={headlights ? (isNight ? 7.5 : 4.5) : 0}
        distance={2.4}
        decay={1.6}
      />
      <pointLight
        position={HEADLIGHT_RIGHT}
        color="#e8f5ff"
        intensity={headlights ? (isNight ? 7.5 : 4.5) : 0}
        distance={2.4}
        decay={1.6}
      />

      {headlights && (
        <>
          <GlowSprite position={HEADLIGHT_LEFT} scale={[0.54, 0.54, 1]} color="#dff4ff" opacity={0.72} />
          <GlowSprite position={HEADLIGHT_RIGHT} scale={[0.54, 0.54, 1]} color="#dff4ff" opacity={0.72} />
          <GlowSprite position={HEADLIGHT_LEFT} scale={[0.2, 0.2, 1]} color="#ffffff" opacity={0.96} />
          <GlowSprite position={HEADLIGHT_RIGHT} scale={[0.2, 0.2, 1]} color="#ffffff" opacity={0.96} />
        </>
      )}

      {leftMirrorVisible && (
        <SignalStrip
          position={MIRROR_LEFT}
          rotation={[0, -0.12, -0.04]}
          scale={[0.15, 0.022, 1]}
          active={indicatorsOn}
        />
      )}
      {rightMirrorVisible && (
        <SignalStrip
          position={MIRROR_RIGHT}
          rotation={[0, 0.12, 0.04]}
          scale={[0.15, 0.022, 1]}
          active={indicatorsOn}
        />
      )}
      <SignalStrip
        position={TAIL_LEFT}
        rotation={[0, Math.PI, 0]}
        scale={[0.19, 0.038, 1]}
        active={indicatorsOn}
      />
      <SignalStrip
        position={TAIL_RIGHT}
        rotation={[0, Math.PI, 0]}
        scale={[0.19, 0.038, 1]}
        active={indicatorsOn}
      />

      {indicatorsOn && (
        <>
          {leftMirrorVisible && (
            <GlowSprite position={MIRROR_LEFT} scale={[0.28, 0.13, 1]} color="#ff8a00" opacity={0.72} />
          )}
          {rightMirrorVisible && (
            <GlowSprite position={MIRROR_RIGHT} scale={[0.28, 0.13, 1]} color="#ff8a00" opacity={0.72} />
          )}
          <GlowSprite position={TAIL_LEFT} scale={[0.31, 0.17, 1]} color="#ff8a00" opacity={0.86} />
          <GlowSprite position={TAIL_RIGHT} scale={[0.31, 0.17, 1]} color="#ff8a00" opacity={0.86} />
          <pointLight position={TAIL_LEFT} color="#ff7900" intensity={3.4} distance={1.15} decay={1.8} />
          <pointLight position={TAIL_RIGHT} color="#ff7900" intensity={3.4} distance={1.15} decay={1.8} />
        </>
      )}
    </group>
  );
}
