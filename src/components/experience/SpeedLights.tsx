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
  const count = quality === "performance" ? 16 : quality === "ultra" ? 52 : 32;

  const lights = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        x: -13 + seeded(index + 1, 12.9898) * 26,
        y: 0.25 + seeded(index + 4, 78.233) * 5.8,
        z: -4.8 - seeded(index + 8, 39.346) * 11,
        width: 1.5 + seeded(index + 11, 17.13) * 6.2,
        thickness: 0.018 + seeded(index + 13, 44.3) * 0.028,
        speed: 6 + seeded(index + 16, 91.7) * 14,
        red: seeded(index + 22, 52.1) > 0.26,
        opacity: 0.42 + seeded(index + 27, 63.4) * 0.5,
      })),
    [count],
  );

  useFrame((state, delta) => {
    if (!group.current) return;

    group.current.children.forEach((child, index) => {
      child.position.x += lights[index].speed * delta;
      if (child.position.x > 16) child.position.x = -16;
      child.position.z = lights[index].z + Math.sin(state.clock.elapsedTime * 0.7 + index) * 0.15;
    });
  });

  return (
    <group ref={group}>
      {lights.map((light, index) => (
        <group key={index} position={[light.x, light.y, light.z]}>
          <mesh scale={[light.width, light.thickness, light.thickness]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial
              color={light.red ? "#ff1738" : "#f5f7ff"}
              transparent
              opacity={light.opacity}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
          <mesh scale={[light.width * 1.04, light.thickness * 5.2, light.thickness * 5.2]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial
              color={light.red ? "#c90027" : "#dfe8ff"}
              transparent
              opacity={light.opacity * 0.12}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
