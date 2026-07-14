"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useConfigurator } from "@/store/configurator";

const seeded = (index: number, factor: number) => {
  const value = Math.sin(index * factor) * 43758.5453;
  return value - Math.floor(value);
};

export function SpeedLights() {
  const group = useRef<THREE.Group>(null);
  const quality = useConfigurator((state) => state.quality);
  const count = quality === "performance" ? 12 : quality === "ultra" ? 34 : 22;

  const lights = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        x: -10 + seeded(index + 1, 12.9898) * 20,
        y: 0.4 + seeded(index + 4, 78.233) * 5,
        z: -5 - seeded(index + 8, 39.346) * 9,
        width: 1.2 + seeded(index + 11, 17.13) * 4.8,
        speed: 5 + seeded(index + 16, 91.7) * 10,
        red: seeded(index + 22, 52.1) > 0.34,
      })),
    [count],
  );

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.children.forEach((child, index) => {
      child.position.x += lights[index].speed * delta;
      if (child.position.x > 13) child.position.x = -13;
      child.position.z = lights[index].z + Math.sin(state.clock.elapsedTime * 0.8 + index) * 0.12;
    });
  });

  return (
    <group ref={group}>
      {lights.map((light, index) => (
        <mesh key={index} position={[light.x, light.y, light.z]} scale={[light.width, 0.025, 0.025]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={light.red ? "#ff142f" : "#f4f6ff"} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
