"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, MeshReflectorMaterial, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { CarPrototype } from "./CarPrototype";
import { SpeedLights } from "./SpeedLights";
import { useConfigurator } from "@/store/configurator";

function CameraDirector() {
  const summaryMode = useConfigurator((state) => state.summaryMode);
  const camera = useThree((state) => state.camera);
  const target = useRef(new THREE.Vector3(0, 0.45, 0));

  useFrame((state, delta) => {
    if (!summaryMode) return;
    const time = state.clock.elapsedTime * 0.23;
    const radius = 6.4;
    const desired = new THREE.Vector3(
      Math.sin(time) * radius,
      2.25 + Math.sin(time * 1.7) * 0.25,
      Math.cos(time) * radius,
    );
    camera.position.lerp(desired, 1 - Math.pow(0.001, delta));
    camera.lookAt(target.current);
  });
  return null;
}

function SceneContent() {
  const summaryMode = useConfigurator((state) => state.summaryMode);
  const quality = useConfigurator((state) => state.quality);

  return (
    <>
      <color attach="background" args={["#030305"]} />
      <fog attach="fog" args={["#070307", 7, quality === "performance" ? 23 : 31]} />
      <PerspectiveCamera makeDefault position={[5.8, 2.55, 5.8]} fov={34} />
      <ambientLight intensity={0.52} />
      <hemisphereLight args={["#b9c7ff", "#120006", 0.65]} />
      <spotLight position={[4, 7, 5]} intensity={72} angle={0.36} penumbra={0.85} color="#ffffff" castShadow />
      <spotLight position={[-5, 4, -3]} intensity={48} angle={0.48} penumbra={0.72} color="#ff1833" />
      <pointLight position={[0, 1, -4]} intensity={38} distance={14} color="#e10020" />
      <pointLight position={[2, 0.6, 2]} intensity={15} distance={8} color="#f4f7ff" />

      <SpeedLights />

      <group position={[0, -0.28, 0]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[4.15, 4.15, 0.16, 96]} />
          <MeshReflectorMaterial
            resolution={quality === "performance" ? 256 : quality === "ultra" ? 1024 : 512}
            blur={quality === "performance" ? [160, 40] : [340, 80]}
            mixBlur={1}
            mixStrength={quality === "performance" ? 0.45 : 0.72}
            roughness={0.18}
            depthScale={0.25}
            minDepthThreshold={0.3}
            maxDepthThreshold={1.4}
            color="#08090c"
            metalness={0.72}
            mirror={0.54}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.075, 0]}>
          <ringGeometry args={[4.12, 4.21, 96]} />
          <meshBasicMaterial color="#db0024" toneMapped={false} />
        </mesh>
      </group>

      <CarPrototype />
      <ContactShadows position={[0, 0.25, 0]} opacity={0.58} scale={7.5} blur={2.2} far={4.3} />
      <CameraDirector />
      <OrbitControls
        enabled={!summaryMode}
        enablePan={false}
        minDistance={4.7}
        maxDistance={8.4}
        minPolarAngle={Math.PI / 3.6}
        maxPolarAngle={Math.PI / 2.08}
        target={[0, 0.52, 0]}
        dampingFactor={0.055}
        enableDamping
      />
    </>
  );
}

export function CarScene() {
  const quality = useConfigurator((state) => state.quality);
  const dpr = quality === "performance" ? [1, 1.2] : quality === "ultra" ? [1, 2] : [1, 1.55];

  useEffect(() => {
    document.documentElement.dataset.quality = quality;
  }, [quality]);

  return (
    <Canvas
      shadows={quality !== "performance"}
      dpr={dpr as [number, number]}
      gl={{ antialias: quality !== "performance", alpha: false, preserveDrawingBuffer: true }}
      className="car-canvas"
    >
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
    </Canvas>
  );
}
