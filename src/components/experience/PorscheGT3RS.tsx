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

function ShowroomPlinth() {
  return (
    <group position={[0, -0.72, 0]}>
      {/* soft contact shadow around base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]}>
        <circleGeometry args={[3.6, 96]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.06} />
      </mesh>

      {/* plinth body */}
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[3.02, 3.16, 0.22, 96]} />
        <meshStandardMaterial color="#eef1f4" roughness={0.72} metalness={0.05} />
      </mesh>

      {/* top deck */}
      <mesh receiveShadow castShadow position={[0, 0.085, 0]}>
        <cylinderGeometry args={[2.92, 2.98, 0.03, 96]} />
        <meshStandardMaterial
          color="#f8fafc"
          roughness={0.24}
          metalness={0.08}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* subtle highlight ring to define silhouette */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.102, 0]}>
        <ringGeometry args={[2.72, 2.95, 96]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.32} />
      </mesh>

      {/* soft reflection area below the car */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.103, 0]}>
        <circleGeometry args={[2.3, 96]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
      </mesh>
    </group>
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
    if (!hazards) {
      setHazardOn(false);
      return;
    }

    setHazardOn(true);
    const interval = window.setInterval(() => {
      setHazardOn((value) => !value);
    }, 520);

    return () => window.clearInterval(interval);
  }, [hazards]);

  useEffect(() => {
    forEachMeshMaterial(model, (mesh, standard) => {
      const objectName = mesh.name.toLowerCase();
      const materialName = standard.name.toLowerCase();

      // Paint
      if (materialName.includes("carpaint.003")) {
        standard.color.set(paint.color);
        standard.metalness = paint.metalness;
        standard.roughness = Math.max(0.14, paint.roughness);
        standard.envMapIntensity = 1.45;
      }

      // Wheels
      if (materialName.includes("wheels_chrome")) {
        standard.color.set("#14171c");
        standard.metalness = 0.9;
        standard.roughness = 0.24;
      }

      // Calipers
      if (materialName.includes("caliper")) {
        standard.color.set("#c8101e");
        standard.metalness = 0.32;
        standard.roughness = 0.34;
      }

      // Headlights: preserve more of the original material feel
      const isHeadlightAssembly =
        objectName.includes("headlight_l_led") ||
        objectName.includes("headlight_r_led") ||
        objectName.includes("headlight");

      const isHeadlightEmitter =
        materialName.includes("led_lights") ||
        materialName.includes("headlight_high") ||
        materialName.includes("headlight_1");

      if (isHeadlightAssembly && isHeadlightEmitter) {
        // do not paint the whole surface white; keep subtle lens/emitter behavior
        if (materialName.includes("headlight_high")) {
          standard.color.set("#cfd8df");
          standard.emissive.set("#f4f8ff");
          standard.emissiveIntensity = headlights ? 1.05 : 0.0;
          standard.roughness = 0.1;
          standard.metalness = 0.06;
        } else {
          standard.color.set("#9aa6af");
          standard.emissive.set("#eef6ff");
          standard.emissiveIntensity = headlights ? 0.48 : 0.0;
          standard.roughness = 0.22;
          standard.metalness = 0.04;
        }

        standard.envMapIntensity = 1.1;
        standard.toneMapped = true;
      }

      // Front turn signals: keep the good behavior, but ensure both sides can respond
      const isFrontSignal =
        objectName.includes("signal_l_bumper") || objectName.includes("signal_r_bumper");

      if (isFrontSignal) {
        standard.color.set(hazards && hazardOn ? "#ff8a00" : "#2b1a0e");
        standard.emissive.set("#ff6a00");
        standard.emissiveIntensity = hazards && hazardOn ? 2.2 : 0;
        standard.roughness = 0.22;
        standard.metalness = 0;
        standard.toneMapped = true;
      }

      // Rear lights: only use native model materials, no extra floating mesh
      const isTailLight =
        objectName.includes("taillight_running") ||
        objectName.includes("brakelight") ||
        materialName.includes("taillight") ||
        materialName.includes("brakelight");

      if (isTailLight) {
        standard.color.set(taillights ? "#8f0010" : "#250005");
        standard.emissive.set("#ff1028");
        standard.emissiveIntensity = taillights
          ? objectName.includes("brakelight") || materialName.includes("brakelight")
            ? 1.25
            : 0.95
          : 0.03;
        standard.roughness = 0.18;
        standard.metalness = 0;
        standard.envMapIntensity = 0.52;
        standard.toneMapped = true;
      }

      standard.needsUpdate = true;
    });
  }, [hazardOn, hazards, headlights, model, paint, taillights]);

  useFrame((state) => {
    if (!group.current) return;

    const elapsed = performance.now() - transitionStart.current;
    const pulse = elapsed < 900 ? Math.sin((elapsed / 900) * Math.PI) : 0;

    group.current.position.x = pulse * 0.42;
    group.current.position.y = -0.06 + Math.sin(state.clock.elapsedTime * 0.72) * 0.006;
    group.current.rotation.y = -0.08 + state.pointer.x * 0.022 + pulse * 0.06;
  });

  return (
    <group dispose={null}>
      <ShowroomPlinth />

      <group ref={group} scale={1.1}>
        <primitive object={model} />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
