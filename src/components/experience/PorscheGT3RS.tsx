"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { getPaint } from "@/config/paints";
import { getCaliperOption } from "@/config/brakes";
import { getWheelFinishOption } from "@/config/wheels";
import { useConfigurator } from "@/store/configurator";

const MODEL_URL = "/models/porsche-911-gt3-rs-992.glb";
const HOOD_NODE_NAME = "TwiXeR_992_gt3rs_carbon_hood";
const LEFT_DOOR_NODE_NAME = "TwiXeR_992_gt3rs_door_L";
const RIGHT_DOOR_NODE_NAME = "TwiXeR_992_gt3rs_door_R";
const REAR_WING_NODE_NAME = "TwiXeR_992_gt3rs_carbon_Wing";
const LEFT_DOOR_PART_NAMES = [
  "TwiXeR_992_gt3rs_door_L",
  "TwiXeR_992_doorglass_L_tint",
  "TwiXeR_992_doorpanel_L_antichrome",
  "TwiXeR_992_mirror_L",
  "TwiXeR_992_door_L_antichrome_end",
  "TwiXeR_992_door_L_chrome_end",
];
const RIGHT_DOOR_PART_NAMES = [
  "TwiXeR_992_gt3rs_door_R",
  "TwiXeR_992_doorglass_R_tint",
  "TwiXeR_992_doorpanel_R_antichrome",
  "TwiXeR_992_mirror_R",
  "TwiXeR_992_door_R_antichrome_end",
  "TwiXeR_992_door_R_chrome_end",
];

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

function objectHasNamedAncestor(object: THREE.Object3D | null, nodeName: string) {
  let current: THREE.Object3D | null = object;

  while (current) {
    if (current.name === nodeName) return true;
    current = current.parent;
  }

  return false;
}

function findNamedPart(model: THREE.Object3D, exactName: string, fallback: string) {
  const exact = model.getObjectByName(exactName);
  if (exact) return exact;

  let match: THREE.Object3D | null = null;
  model.traverse((object) => {
    if (!match && object.name.toLowerCase().includes(fallback.toLowerCase())) {
      match = object;
    }
  });

  return match;
}

export function PorscheGT3RS() {
  const group = useRef<THREE.Group>(null);
  const hoodPivot = useRef<THREE.Group | null>(null);
  const leftDoorPivot = useRef<THREE.Group | null>(null);
  const rightDoorPivot = useRef<THREE.Group | null>(null);
  const materialDefaults = useRef(
    new WeakMap<THREE.MeshStandardMaterial, MaterialDefaults>(),
  );
  const { scene } = useGLTF(MODEL_URL);

  const paintId = useConfigurator((state) => state.paintId);
  const wheelId = useConfigurator((state) => state.wheelId);
  const caliperId = useConfigurator((state) => state.caliperId);
  const hoodOpen = useConfigurator((state) => state.hoodOpen);
  const toggleHoodOpen = useConfigurator((state) => state.toggleHoodOpen);
  const leftDoorOpen = useConfigurator((state) => state.leftDoorOpen);
  const toggleLeftDoorOpen = useConfigurator((state) => state.toggleLeftDoorOpen);
  const rightDoorOpen = useConfigurator((state) => state.rightDoorOpen);
  const toggleRightDoorOpen = useConfigurator((state) => state.toggleRightDoorOpen);
  const wingInstalled = useConfigurator((state) => state.wingInstalled);
  const headlights = useConfigurator((state) => state.headlights);
  const taillights = useConfigurator((state) => state.taillights);
  const hazards = useConfigurator((state) => state.hazards);
  const transitionNonce = useConfigurator((state) => state.transitionNonce);

  const paint = useMemo(() => getPaint(paintId), [paintId]);
  const wheel = useMemo(() => getWheelFinishOption(wheelId), [wheelId]);
  const caliper = useMemo(() => getCaliperOption(caliperId), [caliperId]);
  const transitionStart = useRef(0);
  const [hazardOn, setHazardOn] = useState(true);

  const model = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      child.matrixAutoUpdate = true;

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
    const hood = findNamedPart(model, HOOD_NODE_NAME, "carbon_hood");
    if (hood && hood.parent && !hoodPivot.current) {
      hood.updateWorldMatrix(true, true);

      const bounds = new THREE.Box3().setFromObject(hood);
      const hoodParent = hood.parent;
      const pivot = new THREE.Group();
      pivot.name = "hood_pivot_manual";

      const worldPivot = new THREE.Vector3(
        (bounds.min.x + bounds.max.x) / 2,
        bounds.max.y - 0.03,
        bounds.min.z + 0.08,
      );

      const localPivot = hoodParent.worldToLocal(worldPivot.clone());
      pivot.position.copy(localPivot);
      hoodParent.add(pivot);
      pivot.attach(hood);

      pivot.rotation.x = hoodOpen ? -0.88 : 0;
      hoodPivot.current = pivot;
    }

    const leftDoor = model.getObjectByName(LEFT_DOOR_NODE_NAME);
    if (leftDoor && leftDoor.parent && !leftDoorPivot.current) {
      leftDoor.updateWorldMatrix(true, true);

      const bounds = new THREE.Box3().setFromObject(leftDoor);
      const doorParent = leftDoor.parent;
      const pivot = new THREE.Group();
      pivot.name = "left_door_pivot_manual";

      const worldPivot = new THREE.Vector3(
        bounds.max.x - 0.012,
        bounds.min.y + (bounds.max.y - bounds.min.y) * 0.5,
        bounds.max.z - 0.04,
      );

      const localPivot = doorParent.worldToLocal(worldPivot.clone());
      pivot.position.copy(localPivot);
      doorParent.add(pivot);

      LEFT_DOOR_PART_NAMES.forEach((partName) => {
        const part = model.getObjectByName(partName);
        if (part) pivot.attach(part);
      });

      pivot.rotation.y = leftDoorOpen ? -1.08 : 0;
      leftDoorPivot.current = pivot;
    }

    const rightDoor = model.getObjectByName(RIGHT_DOOR_NODE_NAME);
    if (rightDoor && rightDoor.parent && !rightDoorPivot.current) {
      rightDoor.updateWorldMatrix(true, true);

      const bounds = new THREE.Box3().setFromObject(rightDoor);
      const doorParent = rightDoor.parent;
      const pivot = new THREE.Group();
      pivot.name = "right_door_pivot_manual";

      const worldPivot = new THREE.Vector3(
        bounds.min.x + 0.012,
        bounds.min.y + (bounds.max.y - bounds.min.y) * 0.5,
        bounds.max.z - 0.04,
      );

      const localPivot = doorParent.worldToLocal(worldPivot.clone());
      pivot.position.copy(localPivot);
      doorParent.add(pivot);

      RIGHT_DOOR_PART_NAMES.forEach((partName) => {
        const part = model.getObjectByName(partName);
        if (part) pivot.attach(part);
      });

      pivot.rotation.y = rightDoorOpen ? 1.08 : 0;
      rightDoorPivot.current = pivot;
    }
  }, [hoodOpen, leftDoorOpen, rightDoorOpen, model]);

  useEffect(() => {
    transitionStart.current = performance.now();
  }, [transitionNonce]);

  useEffect(() => {
    const rearWing = model.getObjectByName(REAR_WING_NODE_NAME);
    if (rearWing) {
      rearWing.visible = wingInstalled;
    }
  }, [model, wingInstalled]);

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

      const isCarbon =
        materialName.includes("carbon") || objectName.includes("carbon");
      const isGlossBlack =
        isCarbon ||
        materialName.includes("antichrome") ||
        materialName.includes("gt3rs_black");
      const isExteriorDarkPlastic =
        materialName.includes("plastic_mgl_060606") &&
        /(gt3rs|bumper|spoiler|sideskirts|wing|hood|fender)/.test(objectName);
      const isBrakeDiscAssembly =
        objectName.includes("brakedisc") || materialName.includes("brakedisc");
      const isBrakeRotorSurface =
        (materialName.includes("amdb11_brake") || materialName.includes("brake.002")) &&
        !materialName.includes("caliper");
      const isBrakeRotorHat =
        isBrakeDiscAssembly && materialName.includes("misc_chrome");
      const isBrakeRotorHardware =
        isBrakeDiscAssembly && materialName.includes("misc.002");

      if (materialName.includes("carpaint.003")) {
        standard.color.set(paint.color);
        standard.metalness = Math.max(0.24, paint.metalness * 0.92);
        standard.roughness = Math.min(
          0.11,
          Math.max(0.06, paint.roughness * 0.42),
        );
        standard.envMapIntensity = 2.55;
      }

      if (isGlossBlack) {
        standard.color.set(isCarbon ? "#080b10" : "#06080d");
        standard.metalness = isCarbon ? 0.44 : 0.62;
        standard.roughness = isCarbon ? 0.12 : 0.08;
        standard.envMapIntensity = 2.55;
      } else if (isExteriorDarkPlastic) {
        standard.color.set("#0b0d11");
        standard.metalness = 0.34;
        standard.roughness = 0.16;
        standard.envMapIntensity = 2.0;
      }

      if (materialName.includes("wheels_chrome")) {
        standard.color.set(wheel.color);
        standard.metalness = wheel.metalness;
        standard.roughness = wheel.roughness;
        standard.envMapIntensity = wheel.envMapIntensity;
      }

      if (isBrakeRotorSurface) {
        standard.color.set("#505861");
        standard.metalness = 0.56;
        standard.roughness = 0.4;
        standard.envMapIntensity = 1.08;
      } else if (isBrakeRotorHat) {
        standard.color.set("#676f78");
        standard.metalness = 0.62;
        standard.roughness = 0.3;
        standard.envMapIntensity = 1.2;
      } else if (isBrakeRotorHardware) {
        standard.color.set("#434a53");
        standard.metalness = 0.42;
        standard.roughness = 0.48;
        standard.envMapIntensity = 0.96;
      }

      if (materialName.includes("glass")) {
        standard.roughness = Math.min(0.06, standard.roughness);
        standard.envMapIntensity = Math.max(1.55, standard.envMapIntensity);
      }

      if (materialName.includes("caliper")) {
        standard.color.set(caliper.color);
        standard.metalness = caliper.metalness;
        standard.roughness = caliper.roughness;
        standard.envMapIntensity = caliper.envMapIntensity;
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
          standard.envMapIntensity = Math.max(defaults.envMapIntensity, 1.15);
          standard.toneMapped = defaults.toneMapped;
        }

        standard.emissive.set("#eef7ff");
        standard.emissiveIntensity = headlights
          ? materialName.includes("headlight_high")
            ? 0.12
            : 0.03
          : 0;
      }

      const isFrontSignal =
        objectName.includes("signal_l_bumper") ||
        objectName.includes("signal_r_bumper") ||
        materialName.includes("signal_l_bumper") ||
        materialName.includes("signal_r_bumper");

      if (isFrontSignal) {
        standard.color.set(hazards && hazardOn ? "#ff8a00" : "#2b1a0e");
        standard.emissive.set("#ff6a00");
        standard.emissiveIntensity = hazards && hazardOn ? 2.2 : 0;
        standard.roughness = 0.22;
        standard.metalness = 0;
        standard.toneMapped = true;
      }

      const isTailLight =
        objectName.includes("taillight") ||
        objectName.includes("brakelight") ||
        materialName.includes("taillight") ||
        materialName.includes("brakelight");

      if (isTailLight) {
        standard.color.set(taillights ? "#8f0010" : "#250005");
        standard.emissive.set("#ff1028");
        standard.emissiveIntensity = taillights
          ? objectName.includes("brakelight") || materialName.includes("brakelight")
            ? 1.1
            : 0.86
          : 0.03;
        standard.roughness = 0.18;
        standard.metalness = 0;
        standard.envMapIntensity = 0.72;
        standard.toneMapped = true;
      }

      standard.needsUpdate = true;
    });
  }, [caliper, hazardOn, hazards, headlights, model, paint, taillights, wheel]);

  useFrame((state, delta) => {
    if (!group.current) return;

    const elapsed = performance.now() - transitionStart.current;
    const pulse = elapsed < 900 ? Math.sin((elapsed / 900) * Math.PI) : 0;

    group.current.position.x = pulse * 0.4;
    group.current.position.y =
      -0.14 + Math.sin(state.clock.elapsedTime * 0.72) * 0.006;
    group.current.rotation.y =
      -0.08 + state.pointer.x * 0.022 + pulse * 0.06;

    if (hoodPivot.current) {
      const target = hoodOpen ? -0.88 : 0;
      hoodPivot.current.rotation.x = THREE.MathUtils.damp(
        hoodPivot.current.rotation.x,
        target,
        6.5,
        delta,
      );
    }

    if (leftDoorPivot.current) {
      const target = leftDoorOpen ? -1.08 : 0;
      leftDoorPivot.current.rotation.y = THREE.MathUtils.damp(
        leftDoorPivot.current.rotation.y,
        target,
        6.5,
        delta,
      );
    }

    if (rightDoorPivot.current) {
      const target = rightDoorOpen ? 1.08 : 0;
      rightDoorPivot.current.rotation.y = THREE.MathUtils.damp(
        rightDoorPivot.current.rotation.y,
        target,
        6.5,
        delta,
      );
    }
  });

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (objectHasNamedAncestor(event.object, HOOD_NODE_NAME)) {
      event.stopPropagation();
      toggleHoodOpen();
      return;
    }

    let current: THREE.Object3D | null = event.object;
    while (current) {
      if (LEFT_DOOR_PART_NAMES.includes(current.name)) {
        event.stopPropagation();
        toggleLeftDoorOpen();
        return;
      }
      if (RIGHT_DOOR_PART_NAMES.includes(current.name)) {
        event.stopPropagation();
        toggleRightDoorOpen();
        return;
      }
      current = current.parent;
    }
  };

  return (
    <group ref={group} scale={1.1} dispose={null}>
      <primitive object={model} onPointerDown={handlePointerDown} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
