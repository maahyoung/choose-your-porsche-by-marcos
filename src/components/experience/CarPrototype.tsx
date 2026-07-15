"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getPaint } from "@/config/paints";
import { useConfigurator } from "@/store/configurator";

function Wheel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.48, 0.48, 0.36, 36]} />
        <meshStandardMaterial color="#08090b" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.19, 0]} castShadow>
        <cylinderGeometry args={[0.29, 0.29, 0.02, 18]} />
        <meshStandardMaterial color="#1a1c20" metalness={0.9} roughness={0.16} />
      </mesh>
      <mesh position={[0, 0.205, 0]}>
        <cylinderGeometry args={[0.105, 0.105, 0.025, 24]} />
        <meshStandardMaterial color="#b50b15" metalness={0.55} roughness={0.24} />
      </mesh>
    </group>
  );
}

function LightLens({
  position,
  color,
  active,
  scale,
}: {
  position: [number, number, number];
  color: string;
  active: boolean;
  scale: [number, number, number];
}) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[1, 20, 12]} />
      <meshStandardMaterial
        color={active ? color : "#26272a"}
        emissive={color}
        emissiveIntensity={active ? 8 : 0.05}
        toneMapped={false}
      />
    </mesh>
  );
}

export function CarPrototype() {
  const group = useRef<THREE.Group>(null);
  const paintId = useConfigurator((state) => state.paintId);
  const headlights = useConfigurator((state) => state.headlights);
  const taillights = useConfigurator((state) => state.taillights);
  const transitionNonce = useConfigurator((state) => state.transitionNonce);
  const paint = useMemo(() => getPaint(paintId), [paintId]);
  const transitionStart = useRef(0);

  useEffect(() => {
    transitionStart.current = performance.now();
  }, [transitionNonce]);

  useFrame((state) => {
    if (!group.current) return;
    const elapsed = performance.now() - transitionStart.current;
    const pulse = elapsed < 900 ? Math.sin((elapsed / 900) * Math.PI) : 0;
    group.current.position.x = pulse * 0.68;
    group.current.rotation.y = -0.22 + state.pointer.x * 0.035 + pulse * 0.15;
    group.current.position.y = 0.56 + Math.sin(state.clock.elapsedTime * 0.75) * 0.015;
  });

  return (
    <group ref={group} scale={1.02} dispose={null}>
      {/* Development proxy: intentionally generic until a licensed, configurable GT3 RS asset is prepared. */}
      <mesh castShadow receiveShadow position={[0, 0.18, 0]} scale={[2.9, 0.46, 1.25]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color={paint.color}
          metalness={paint.metalness}
          roughness={paint.roughness}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </mesh>

      <mesh castShadow position={[-0.18, 0.64, 0]} scale={[1.45, 0.5, 1.02]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color={paint.color}
          metalness={paint.metalness}
          roughness={paint.roughness}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </mesh>

      <mesh castShadow position={[1.16, 0.34, 0]} rotation={[0, 0, -0.13]} scale={[0.84, 0.32, 1.18]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color={paint.color}
          metalness={paint.metalness}
          roughness={paint.roughness}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </mesh>

      <mesh position={[-0.12, 0.73, 0]} scale={[1.14, 0.38, 1.035]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial color="#050609" metalness={0.15} roughness={0.08} transmission={0.1} />
      </mesh>

      <mesh position={[-1.68, 0.34, 0]} scale={[0.52, 0.16, 1.23]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#090a0d" metalness={0.82} roughness={0.18} />
      </mesh>

      <mesh position={[-1.66, 1.03, 0]} scale={[0.78, 0.09, 1.52]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#08090b" metalness={0.85} roughness={0.16} />
      </mesh>
      <mesh position={[-1.47, 0.68, -0.56]} scale={[0.08, 0.64, 0.08]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#08090b" metalness={0.85} roughness={0.16} />
      </mesh>
      <mesh position={[-1.47, 0.68, 0.56]} scale={[0.08, 0.64, 0.08]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#08090b" metalness={0.85} roughness={0.16} />
      </mesh>

      <Wheel position={[1.05, -0.13, -0.72]} />
      <Wheel position={[1.05, -0.13, 0.72]} />
      <Wheel position={[-1.25, -0.13, -0.72]} />
      <Wheel position={[-1.25, -0.13, 0.72]} />

      <LightLens position={[1.58, 0.38, -0.43]} scale={[0.16, 0.1, 0.28]} color="#eef8ff" active={headlights} />
      <LightLens position={[1.58, 0.38, 0.43]} scale={[0.16, 0.1, 0.28]} color="#eef8ff" active={headlights} />
      <LightLens position={[-1.75, 0.34, -0.44]} scale={[0.12, 0.07, 0.3]} color="#ff101c" active={taillights} />
      <LightLens position={[-1.75, 0.34, 0.44]} scale={[0.12, 0.07, 0.3]} color="#ff101c" active={taillights} />

      <mesh position={[1.76, 0.13, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.62, 0.18]} />
        <meshStandardMaterial color="#f0f0e8" roughness={0.68} />
      </mesh>
    </group>
  );
}
