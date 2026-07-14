"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  MeshReflectorMaterial,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";
import { PorscheGT3RS } from "./PorscheGT3RS";
import { useConfigurator } from "@/store/configurator";

const SCENE_OFFSET_X = -1.52;

function CameraDirector() {
  const summaryMode = useConfigurator((state) => state.summaryMode);
  const camera = useThree((state) => state.camera);
  const target = useRef(new THREE.Vector3(SCENE_OFFSET_X, 0.48, 0));

  useFrame((state, delta) => {
    if (!summaryMode) return;

    const time = state.clock.elapsedTime * 0.18;
    const desired = new THREE.Vector3(
      SCENE_OFFSET_X + Math.sin(time) * 4.95,
      1.72 + Math.sin(time * 1.6) * 0.2,
      Math.cos(time) * 5.5,
    );

    camera.position.lerp(desired, 1 - Math.pow(0.002, delta));
    target.current.set(SCENE_OFFSET_X, 0.5 + Math.sin(time * 0.7) * 0.035, 0);
    camera.lookAt(target.current);
  });

  return null;
}

function DisplayPlatform({
  quality,
}: {
  quality: "performance" | "balanced" | "ultra";
}) {
  return (
    <group position={[SCENE_OFFSET_X, -0.3, 0]}>
      <mesh position={[0, -0.16, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[4.86, 4.94, 0.24, 96]} />
        <meshStandardMaterial
          color="#d4dae0"
          metalness={0.1}
          roughness={0.54}
          envMapIntensity={0.74}
        />
      </mesh>

      <mesh receiveShadow>
        <cylinderGeometry args={[4.78, 4.82, 0.115, 96]} />
        <MeshReflectorMaterial
          resolution={quality === "performance" ? 256 : quality === "ultra" ? 1024 : 512}
          blur={quality === "performance" ? [120, 34] : [280, 68]}
          mixBlur={0.9}
          mixStrength={quality === "performance" ? 0.28 : 0.46}
          roughness={0.23}
          depthScale={0.18}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.5}
          color="#f8fafb"
          metalness={0.1}
          mirror={0.31}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.061, 0]}>
        <ringGeometry args={[4.6, 4.76, 128]} />
        <meshBasicMaterial
          color="#c8cfd6"
          transparent
          opacity={0.64}
          toneMapped={false}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.067, 0]}>
        <ringGeometry args={[4.24, 4.32, 128]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.88}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function SceneContent() {
  const summaryMode = useConfigurator((state) => state.summaryMode);
  const quality = useConfigurator((state) => state.quality);

  return (
    <>
      <fog attach="fog" args={["#edf1f4", 8.4, quality === "performance" ? 24 : 35]} />
      <PerspectiveCamera makeDefault position={[4.8, 2.06, 5.7]} fov={31} />

      <ambientLight intensity={0.9} />
      <hemisphereLight args={["#ffffff", "#b8bfc7", 1.28]} />

      <spotLight
        position={[6.0, 8.8, 6.5]}
        intensity={80}
        angle={0.38}
        penumbra={0.92}
        color="#ffffff"
        castShadow
      />
      <spotLight
        position={[-6.6, 5.6, 3.4]}
        intensity={54}
        angle={0.54}
        penumbra={0.88}
        color="#f4f8fb"
      />
      <spotLight
        position={[-4.8, 4.9, -5.9]}
        intensity={45}
        angle={0.5}
        penumbra={0.86}
        color="#ffffff"
      />
      <pointLight
        position={[3.2, 1.4, 2.8]}
        intensity={9}
        distance={9}
        color="#ffffff"
      />

      <DisplayPlatform quality={quality} />

      <group position={[SCENE_OFFSET_X, 0, 0]}>
        <PorscheGT3RS />
      </group>

      <ContactShadows
        position={[SCENE_OFFSET_X, 0.25, 0]}
        opacity={0.38}
        scale={8.9}
        blur={3.2}
        far={4.8}
        color="#4f5660"
      />

      <CameraDirector />

      <OrbitControls
        enabled={!summaryMode}
        enablePan={false}
        minDistance={4.4}
        maxDistance={7.9}
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
  const dpr =
    quality === "performance"
      ? [1, 1.15]
      : quality === "ultra"
        ? [1, 2]
        : [1, 1.55];

  useEffect(() => {
    document.documentElement.dataset.quality = quality;
  }, [quality]);

  return (
    <Canvas
      shadows={quality !== "performance"}
      dpr={dpr as [number, number]}
      gl={{
        antialias: quality !== "performance",
        alpha: true,
        preserveDrawingBuffer: true,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0xffffff, 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.98;
      }}
      className="car-canvas"
    >
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
    </Canvas>
  );
}
