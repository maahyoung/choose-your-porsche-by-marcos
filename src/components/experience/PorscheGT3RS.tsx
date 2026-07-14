"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { getPaint } from "@/config/paints";
import { useConfigurator } from "@/store/configurator";

const MODEL_URL = "/models/porsche-911-gt3-rs-992.glb";

function forEachMeshMaterial(
  object: THREE.Object3D,
  callback: (mesh: THREE.Mesh, material: THREE.MeshStandardMaterial) => void,
) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if (material instanceof THREE.MeshStandardMaterial) callback(child, material);
    });
  });
}

function RearSignalStrip({
  position,
  active,
}: {
  position: [number, number, number];
  active: boolean;
}) {
  if (!active) return null;

  return (
    <mesh position={position}>
      <boxGeometry args={[0.2, 0.025, 0.018]} />
      <meshStandardMaterial
        color="#ff7a00"
        emissive="#ff5a00"
        emissiveIntensity={3.2}
        roughness={0.18}
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

    const interval = window.setInterval(() => {
      setHazardOn((value) => !value);
    }, 520);

    return () => window.clearInterval(interval);
  }, [hazards]);

  useEffect(() => {
    forEachMeshMaterial(model, (mesh, standard) => {
      const objectName = mesh.name.toLowerCase();
      const materialName = standard.name.toLowerCase();

      if (materialName.includes("carpaint.003")) {
        standard.color.set(paint.color);
        standard.metalness = paint.metalness;
        standard.roughness = Math.max(0.12, paint.roughness);
        standard.envMapIntensity = 1.7;
      }

      if (materialName.includes("wheels_chrome")) {
        standard.color.set("#111318");
        standard.metalness = 0.92;
        standard.roughness = 0.2;
      }

      if (materialName.includes("caliper")) {
        standard.color.set("#c8101e");
        standard.metalness = 0.38;
        standard.roughness = 0.3;
      }

      const isHeadlightAssembly =
        objectName.includes("headlight_l_led") || objectName.includes("headlight_r_led");
      const isHeadlightEmitter =
        materialName.includes("led_lights") || materialName.includes("headlight_high");

      if (isHeadlightAssembly && isHeadlightEmitter) {
        standard.color.set(materialName.includes("headlight_high") ? "#d8e5ee" : "#9eabb5");
        standard.emissive.set("#dff3ff");
        standard.emissiveIntensity = headlights
          ? materialName.includes("headlight_high")
            ? 2.1
            : 1.45
          : 0;
        standard.roughness = materialName.includes("headlight_high") ? 0.08 : 0.18;
        standard.toneMapped = true;
      }

      const isFrontSignal = objectName.includes("signal_l_bumper");
      if (isFrontSignal) {
        standard.color.set(hazards && hazardOn ? "#ff8200" : "#24170b");
        standard.emissive.set("#ff6500");
        standard.emissiveIntensity = hazards && hazardOn ? 2.8 : 0;
        standard.roughness = 0.2;
        standard.metalness = 0;
        standard.toneMapped = true;
      }

      const isTailLight =
        objectName.includes("taillight_running") || objectName.includes("brakelight");
      if (isTailLight) {
        standard.color.set(taillights ? "#8f0010" : "#2a0005");
        standard.emissive.set("#ff1028");
        standard.emissiveIntensity = taillights
          ? objectName.includes("brakelight")
            ? 1.9
            : 1.55
          : 0.035;
        standard.roughness = 0.16;
        standard.metalness = 0;
        standard.envMapIntensity = 0.55;
        standard.toneMapped = true;
      }

      standard.needsUpdate = true;
    });
  }, [hazardOn, hazards, headlights, model, paint, taillights]);

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

      <RearSignalStrip position={[-0.57, 0.755, -2.205]} active={signalsActive} />
      <RearSignalStrip position={[0.57, 0.755, -2.205]} active={signalsActive} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
