"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { getPaint } from "@/config/paints";
import { useConfigurator } from "@/store/configurator";

const MODEL_URL = "/models/porsche-911-gt3-rs-992.glb";

type MaterialDefaults = {
  color: THREE.Color;
  emissive: THREE.Color;
  emissiveIntensity: number;
  roughness: number;
  metalness: number;
  envMapIntensity: number;
  toneMapped: boolean;
};

function forEachMeshMaterial(
  object: THREE.Object3D,
  callback: (mesh: THREE.Mesh, material: THREE.MeshStandardMaterial) => void,
) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if (material instanceof THREE.MeshStandardMaterial) {
        callback(child, material);
      }
    });
  });
}

function captureDefaults(material: THREE.MeshStandardMaterial): MaterialDefaults {
  return {
    color: material.color.clone(),
    emissive: material.emissive.clone(),
    emissiveIntensity: material.emissiveIntensity,
    roughness: material.roughness,
    metalness: material.metalness,
    envMapIntensity: material.envMapIntensity,
    toneMapped: material.toneMapped,
  };
}

export function PorscheGT3RS() {
  const group = useRef<THREE.Group>(null);
  const materialDefaults = useRef(
    new WeakMap<THREE.MeshStandardMaterial, MaterialDefaults>(),
  );
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

      const cloneMaterial = (material: THREE.Material) => {
        const cloned = material.clone();

        if (cloned instanceof THREE.MeshStandardMaterial) {
          materialDefaults.current.set(cloned, captureDefaults(cloned));
        }

        return cloned;
      };

      child.material = Array.isArray(child.material)
        ? child.material.map(cloneMaterial)
        : cloneMaterial(child.material);
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
      const defaults = materialDefaults.current.get(standard);

      if (materialName.includes("carpaint.003")) {
        standard.color.set(paint.color);
        standard.metalness = paint.metalness;
        standard.roughness = Math.max(0.14, paint.roughness);
        standard.envMapIntensity = 1.42;
      }

      if (materialName.includes("wheels_chrome")) {
        standard.color.set("#15181d");
        standard.metalness = 0.9;
        standard.roughness = 0.24;
        standard.envMapIntensity = 1.1;
      }

      if (materialName.includes("caliper")) {
        standard.color.set("#c8101e");
        standard.metalness = 0.32;
        standard.roughness = 0.34;
      }

      const isHeadlightAssembly =
        objectName.includes("headlight_l_led") ||
        objectName.includes("headlight_r_led") ||
        objectName.includes("headlight");

      const isHeadlightEmitter =
        materialName.includes("led_lights") ||
        materialName.includes("headlight_high") ||
        materialName.includes("headlight_1");

      if (isHeadlightAssembly && isHeadlightEmitter) {
        if (defaults) {
          standard.color.copy(defaults.color);
          standard.roughness = defaults.roughness;
          standard.metalness = defaults.metalness;
          standard.envMapIntensity = Math.max(defaults.envMapIntensity, 0.9);
          standard.toneMapped = defaults.toneMapped;
        }

        standard.emissive.set("#eef7ff");
        standard.emissiveIntensity = headlights
          ? materialName.includes("headlight_high")
            ? 0.72
            : 0.34
          : 0;
      }

      const isFrontSignal =
        objectName.includes("signal_l_bumper") ||
        objectName.includes("signal_r_bumper");

      if (isFrontSignal) {
        standard.color.set(hazards && hazardOn ? "#ff8a00" : "#2b1a0e");
        standard.emissive.set("#ff6a00");
        standard.emissiveIntensity = hazards && hazardOn ? 2.2 : 0;
        standard.roughness = 0.22;
        standard.metalness = 0;
        standard.toneMapped = true;
      }

      const isNativeRearSignal =
        (objectName.includes("signal") || materialName.includes("signal")) &&
        (objectName.includes("rear") ||
          objectName.includes("tail") ||
          materialName.includes("rear") ||
          materialName.includes("tail"));

      if (isNativeRearSignal) {
        standard.color.set(hazards && hazardOn ? "#ff7a00" : "#33180a");
        standard.emissive.set("#ff6500");
        standard.emissiveIntensity = hazards && hazardOn ? 1.8 : 0;
        standard.roughness = 0.2;
        standard.metalness = 0;
      }

      const isTailLight =
        objectName.includes("taillight_running") ||
        objectName.includes("brakelight") ||
        materialName.includes("taillight_running") ||
        materialName.includes("brakelight");

      if (isTailLight && !isNativeRearSignal) {
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
    group.current.position.y =
      -0.14 + Math.sin(state.clock.elapsedTime * 0.72) * 0.006;
    group.current.rotation.y =
      -0.08 + state.pointer.x * 0.022 + pulse * 0.06;
  });

  return (
    <group ref={group} scale={1.1} dispose={null}>
      <primitive object={model} />

      {headlights && (
        <>
          <pointLight
            position={[-0.65, 0.62, 2.3]}
            intensity={2.3}
            distance={3.2}
            decay={2}
            color="#eaf6ff"
          />
          <pointLight
            position={[0.65, 0.62, 2.3]}
            intensity={2.3}
            distance={3.2}
            decay={2}
            color="#eaf6ff"
          />
        </>
      )}
    </group>
  );
}

useGLTF.preload(MODEL_URL);
