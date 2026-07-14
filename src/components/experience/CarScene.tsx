"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, MeshReflectorMaterial, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { PorscheGT3RS } from "./PorscheGT3RS";
import { SpeedLights } from "./SpeedLights";
import { useConfigurator } from "@/store/configurator";

const SCENE_OFFSET_X = -0.42;

function CameraDirector() {
  const summaryMode = useConfigurator((state) => state.summaryMode);
  const camera = useThree((state) => state.camera);
  const target = useRef(new THREE.Vector3(SCENE_OFFSET_X, 0.48, 0));

  useFrame((state, delta) => {
    if (!summaryMode) return;

    const time = state.clock.elapsedTime * 0.18;
    const desired = new THREE.Vector3(
      SCENE_OFFSET_X + Math.sin(time) * 5.45,
      1.72 + Math.sin(time * 1.6) * 0.28,
      Math.cos(time) * 5.85,
    );

    camera.position.lerp(desired, 1 - Math.pow(0.002, delta));
    target.current.set(SCENE_OFFSET_X, 0.5 + Math.sin(time * 0.7) * 0.035, 0);
    camera.lookAt(target.current);
  });

  return null;
}

function DisplayPlatform({ quality }: { quality: "performance" | "balanced" | "ultra" }) {
  return (
    <group position={[SCENE_OFFSET_X, -0.3, 0]}>
      <mesh position={[0, -0.14, 0]} receiveShadow>
        <cylinderGeometry args={[4.55, 4.62, 0.22, 96]} />
        <meshStandardMaterial color="#030306" metalness={0.88} roughness={0.2} />
      </mesh>

      <mesh receiveShadow>
        <cylinderGeometry args={[4.48, 4.48, 0.11, 96]} />
        <MeshReflectorMaterial
          resolution={quality === "performance" ? 256 : quality === "ultra" ? 1024 : 512}
          blur={quality === "performance" ? [140, 36] : [320, 72]}
          mixBlur={1}
          mixStrength={quality === "performance" ? 0.5 : 0.82}
          roughness={0.13}
          depthScale={0.32}
          minDepthThreshold={0.24}
          maxDepthThreshold={1.55}
          color="#090a0f"
          metalness={0.82}
          mirror={0.68}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.061, 0]}>
        <ringGeometry args={[4.34, 4.48, 128]} />
        <meshBasicMaterial color="#ff1235" transparent opacity={0.82} toneMapped={false} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.067, 0]}>
        <ringGeometry args={[4.09, 4.13, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.2} toneMapped={false} />
      </mesh>

      <pointLight position={[0, 0.12, 0]} intensity={14} distance={8.5} color="#d80025" />
    </group>
  );
}

function SceneContent() {
  const summaryMode = useConfigurator((state) => state.summaryMode);
  const quality = useConfigurator((state) => state.quality);

  return (
    <>
      <color attach="background" args={["#020204"]} />
      <fog attach="fog" args={["#080108", 6.2, quality === "performance" ? 22 : 30]} />
      <PerspectiveCamera makeDefault position={[5.15, 2.22, 5.7]} fov={31} />

      <ambientLight intensity={0.42} />
      <hemisphereLight args={["#d9e2ff", "#160006", 0.68]} />
      <spotLight position={[4.5, 7.5, 5]} intensity={88} angle={0.34} penumbra={0.88} color="#ffffff" castShadow />
      <spotLight position={[-5.5, 4.4, -3.5]} intensity={62} angle={0.5} penumbra={0.75} color="#ff1235" />
      <pointLight position={[-1.5, 1.2, -4.5]} intensity={48} distance={15} color="#e00028" />
      <pointLight position={[2.8, 0.9, 2.8]} intensity={18} distance={9} color="#f4f7ff" />

      <SpeedLights />
      <DisplayPlatform quality={quality} />

      <group position={[SCENE_OFFSET_X, 0, 0]}>
        <PorscheGT3RS />
      </group>

      <ContactShadows
        position={[SCENE_OFFSET_X, 0.25, 0]}
        opacity={0.62}
        scale={8.2}
        blur={2.35}
        far={4.6}
      />

      <CameraDirector />
      <OrbitControls
        enabled={!summaryMode}
        enablePan={false}
        minDistance={4.3}
        maxDistance={7.7}
        minPolarAngle={Math.PI / 3.75}
        maxPolarAngle={Math.PI / 2.08}
        target={[SCENE_OFFSET_X, 0.54, 0]}
        dampingFactor={0.05}
        enableDamping
      />
    </>
  );
}

export function CarScene() {
  const quality = useConfigurator((state) => state.quality);
  const dpr = quality === "performance" ? [1, 1.15] : quality === "ultra" ? [1, 2] : [1, 1.55];

  useEffect(() => {
    document.documentElement.dataset.quality = quality;
  }, [quality]);

  return (
    <Canvas
      shadows={quality !== "performance"}
      dpr={dpr as [number, number]}
      gl={{ antialias: quality !== "performance", alpha: false, preserveDrawingBuffer: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
      }}
      className="car-canvas"
    >
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
    </Canvas>
  );
}
