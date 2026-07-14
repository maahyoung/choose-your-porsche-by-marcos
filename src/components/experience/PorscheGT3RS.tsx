"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { getPaint } from "@/config/paints";
import { useConfigurator } from "@/store/configurator";

const MODEL_URL = "/models/porsche-911-gt3-rs-992.glb";

function forEachMaterial(
  object: THREE.Object3D,
  callback: (material: THREE.Material) => void,
) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach(callback);
  });
}

function updateStandardMaterial(
  material: THREE.Material,
  callback: (material: THREE.MeshStandardMaterial) => void,
) {
  if (material instanceof THREE.MeshStandardMaterial) callback(material);
}

function TurnSignal({
  position,
  active,
}: {
  position: [number, number, number];
  active: boolean;
}) {
  return (
    <mesh position={position} scale={[0.085, 0.032, 0.045]}>
      <sphereGeometry args={[1, 18, 10]} />
      <meshStandardMaterial
        color={active ? "#ff8a00" : "#2b2117"}
        emissive="#ff7900"
        emissiveIntensity={active ? 10 : 0.03}
        roughness={0.24}
        toneMapped={false}
      />
    </mesh>
  );
}

export function PorscheGT3RS() {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL);
  const paintId = useConfigurator((state) => state.paintId);
  const headlights = useConfigurator((state) => state.headlights);
  const taillights = useConfigurator((state) => state.taillights);
  const hazards = useConfigurator((state) => state.hazards);
  const transitionNonce = useConfigurator((state) => state.transitionNonce);
  const paint = useMemo(() => getPaint(paintId), [paintId]);
  const transitionStart = useRef(0);
  const [hazardOn, setHazardOn] = useState(true);

  const model = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      child.castShadow = true;
      child.receiveShadow = true;
      child.material = Array.isArray(child.material)
        ? child.material.map((material) => material.clone())
        : child.material.clone();
    });

    return clone;
  }, [scene]);

  useEffect(() => {
    transitionStart.current = performance.now();
  }, [transitionNonce]);

  useEffect(() => {
    if (!hazards) return;

    const start = window.setTimeout(() => setHazardOn(true), 0);
    const interval = window.setInterval(() => {
      setHazardOn((value) => !value);
    }, 520);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [hazards]);

  useEffect(() => {
    forEachMaterial(model, (material) => {
      const name = material.name.toLowerCase();

      updateStandardMaterial(material, (standard) => {
        if (name.includes("carpaint.003")) {
          standard.color.set(paint.color);
          standard.metalness = paint.metalness;
          standard.roughness = Math.max(0.12, paint.roughness);
          standard.envMapIntensity = 1.7;
        }

        if (name.includes("wheels_chrome")) {
          standard.color.set("#111318");
          standard.metalness = 0.92;
          standard.roughness = 0.2;
        }

        if (name.includes("caliper")) {
          standard.color.set("#c8101e");
          standard.metalness = 0.38;
          standard.roughness = 0.3;
        }

        if (
          name.includes("led_lights") ||
          name.includes("headlight_high") ||
          name.includes("headlight_1")
        ) {
          standard.emissive.set("#eaf7ff");
          standard.emissiveIntensity = headlights ? 5.5 : 0.02;
        }

        if (name.includes("taillight_running") || name.includes("brakelight")) {
          standard.emissive.set("#ff0b20");
          standard.emissiveIntensity = taillights ? 5.2 : 0.03;
        }

        standard.needsUpdate = true;
      });
    });
  }, [headlights, model, paint, taillights]);

  useFrame((state) => {
    if (!group.current) return;

    const elapsed = performance.now() - transitionStart.current;
    const pulse = elapsed < 900 ? Math.sin((elapsed / 900) * Math.PI) : 0;

    group.current.position.x = pulse * 0.48;
    group.current.position.y = -0.14 + Math.sin(state.clock.elapsedTime * 0.72) * 0.008;
    group.current.rotation.y = -0.08 + state.pointer.x * 0.025 + pulse * 0.08;
  });

  const signalsActive = hazards && hazardOn;

  return (
    <group ref={group} scale={1.1} dispose={null}>
      <primitive object={model} />

      <TurnSignal position={[-0.76, 0.42, 2.22]} active={signalsActive} />
      <TurnSignal position={[0.76, 0.42, 2.22]} active={signalsActive} />
      <TurnSignal position={[-0.79, 0.58, -2.34]} active={signalsActive} />
      <TurnSignal position={[0.79, 0.58, -2.34]} active={signalsActive} />

      {headlights && (
        <>
          <pointLight position={[-0.65, 0.62, 2.35]} intensity={8} distance={4.2} color="#eaf7ff" />
          <pointLight position={[0.65, 0.62, 2.35]} intensity={8} distance={4.2} color="#eaf7ff" />
        </>
      )}
    </group>
  );
}

useGLTF.preload(MODEL_URL);
