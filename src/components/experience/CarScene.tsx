/* eslint-disable react-hooks/immutability */
"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ElementRef,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  MeshReflectorMaterial,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";
import { PorscheGT3RS } from "./PorscheGT3RS";
import type { CameraPresetId, EnvironmentId } from "@/config/details";
import { useConfigurator } from "@/store/configurator";

type ViewportKind =
  | "phone-portrait"
  | "phone-landscape"
  | "tablet-portrait"
  | "compact-landscape"
  | "desktop"
  | "ultrawide";

type ViewportProfile = {
  width: number;
  height: number;
  aspect: number;
  kind: ViewportKind;
};

type SceneLayout = {
  sceneOffsetX: number;
  distanceScale: number;
  fovBoost: number;
  targetY: number;
  platformScale: number;
};

type CameraView = {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
};

const DEFAULT_PROFILE: ViewportProfile = {
  width: 1440,
  height: 900,
  aspect: 1.6,
  kind: "desktop",
};

function getViewportKind(width: number, height: number): ViewportKind {
  const aspect = width / Math.max(height, 1);

  if (width <= 620 && aspect < 1) return "phone-portrait";
  if (height <= 560 && aspect >= 1.2) return "phone-landscape";
  if (aspect < 1 && width <= 1024) return "tablet-portrait";
  if (width < 1180 || height < 720) return "compact-landscape";
  if (aspect >= 2.05) return "ultrawide";
  return "desktop";
}

function getSceneLayout(profile: ViewportProfile): SceneLayout {
  switch (profile.kind) {
    case "phone-portrait":
      return {
        sceneOffsetX: 0,
        distanceScale: 1.22,
        fovBoost: 4,
        targetY: 0.36,
        platformScale: 0.8,
      };
    case "tablet-portrait":
      return {
        sceneOffsetX: 0,
        distanceScale: 1.12,
        fovBoost: 2.5,
        targetY: 0.4,
        platformScale: 0.9,
      };
    case "phone-landscape":
      return {
        sceneOffsetX: -0.58,
        distanceScale: 1.14,
        fovBoost: 2,
        targetY: 0.48,
        platformScale: 0.88,
      };
    case "compact-landscape":
      return {
        sceneOffsetX: -0.92,
        distanceScale: 1.08,
        fovBoost: 1,
        targetY: 0.5,
        platformScale: 0.94,
      };
    case "ultrawide":
      return {
        sceneOffsetX: -1.82,
        distanceScale: 0.96,
        fovBoost: -0.5,
        targetY: 0.54,
        platformScale: 1.06,
      };
    default:
      return {
        sceneOffsetX: -1.52,
        distanceScale: 1,
        fovBoost: 0,
        targetY: 0.54,
        platformScale: 1,
      };
  }
}

function getCameraView(cameraPresetId: CameraPresetId, layout: SceneLayout): CameraView {
  const x = layout.sceneOffsetX;
  const scale = layout.distanceScale;
  const heightLift = Math.max(0, scale - 1) * 0.7;

  switch (cameraPresetId) {
    case "front":
      return {
        position: [x, 1.38 + heightLift, 6.85 * scale],
        target: [x, layout.targetY + 0.04, 0.48],
        fov: 32 + layout.fovBoost,
      };
    case "rear":
      return {
        position: [x, 1.42 + heightLift, -6.95 * scale],
        target: [x, layout.targetY + 0.04, -0.52],
        fov: 32 + layout.fovBoost,
      };
    case "side":
      return {
        position: [x + 6.57 * scale, 1.45 + heightLift, -0.08],
        target: [x, layout.targetY + 0.02, -0.02],
        fov: 31 + layout.fovBoost,
      };
    case "cockpit":
      return {
        position: [x + 0.38, 0.94, -0.12],
        target: [x + 0.25, 0.8, 2.35],
        fov: profileCockpitFov(layout),
      };
    default:
      return {
        position: [x + 6.32 * scale, 2.06 + heightLift, 5.7 * scale],
        target: [x, layout.targetY, 0],
        fov: 31 + layout.fovBoost,
      };
  }
}

function profileCockpitFov(layout: SceneLayout) {
  return layout.sceneOffsetX === 0 ? 54 : 50;
}

const ENVIRONMENT_STYLE: Record<
  EnvironmentId,
  {
    fog: string;
    fogNear: number;
    fogFar: number;
    exposure: number;
    ambient: number;
    hemisphereGround: string;
    hemisphere: number;
    key: number;
    fill: number;
    rim: number;
    keyColor: string;
    fillColor: string;
    rimColor: string;
  }
> = {
  showroom: {
    fog: "#edf1f4",
    fogNear: 8.4,
    fogFar: 35,
    exposure: 1.05,
    ambient: 0.68,
    hemisphereGround: "#b2bac3",
    hemisphere: 1.02,
    key: 76,
    fill: 58,
    rim: 58,
    keyColor: "#ffffff",
    fillColor: "#edf6ff",
    rimColor: "#ffffff",
  },
  studio: {
    fog: "#15191e",
    fogNear: 9.5,
    fogFar: 30,
    exposure: 0.82,
    ambient: 0.3,
    hemisphereGround: "#07090c",
    hemisphere: 0.48,
    key: 58,
    fill: 24,
    rim: 66,
    keyColor: "#f7f9fb",
    fillColor: "#b9cee2",
    rimColor: "#ffffff",
  },
  night: {
    fog: "#070d18",
    fogNear: 8.8,
    fogFar: 28,
    exposure: 0.72,
    ambient: 0.2,
    hemisphereGround: "#02050a",
    hemisphere: 0.34,
    key: 34,
    fill: 18,
    rim: 48,
    keyColor: "#d9e8ff",
    fillColor: "#6ca7e8",
    rimColor: "#8fbfff",
  },
};

function CameraRig({ layout }: { layout: SceneLayout }) {
  const summaryMode = useConfigurator((state) => state.summaryMode);
  const cameraPresetId = useConfigurator((state) => state.cameraPresetId);
  const cameraTransitionNonce = useConfigurator(
    (state) => state.cameraTransitionNonce,
  );
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const gl = useThree((state) => state.gl);
  const controls = useRef<ElementRef<typeof OrbitControls>>(null);
  const progress = useRef(1);
  const startPosition = useRef(new THREE.Vector3());
  const endPosition = useRef(new THREE.Vector3());
  const startTarget = useRef(new THREE.Vector3(layout.sceneOffsetX, layout.targetY, 0));
  const endTarget = useRef(new THREE.Vector3(layout.sceneOffsetX, layout.targetY, 0));
  const startFov = useRef(31);
  const endFov = useRef(31);
  const summaryTarget = useRef(new THREE.Vector3(layout.sceneOffsetX, layout.targetY, 0));
  const cockpitYawTarget = useRef(0);
  const cockpitPitchTarget = useRef(0);
  const cockpitYaw = useRef(0);
  const cockpitPitch = useRef(0);
  const cockpitDirection = useRef(new THREE.Vector3(0, 0, 1));
  const cockpitLookTarget = useRef(new THREE.Vector3());
  const cockpitEuler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));

  useEffect(() => {
    if (summaryMode) return;

    const view = getCameraView(cameraPresetId, layout);
    startPosition.current.copy(camera.position);
    endPosition.current.set(...view.position);
    startTarget.current.copy(
      controls.current?.target ?? new THREE.Vector3(layout.sceneOffsetX, layout.targetY, 0),
    );
    endTarget.current.set(...view.target);
    startFov.current = camera.fov;
    endFov.current = view.fov;
    progress.current = 0;

    if (cameraPresetId === "cockpit") {
      cockpitYawTarget.current = 0;
      cockpitPitchTarget.current = 0;
      cockpitYaw.current = 0;
      cockpitPitch.current = 0;
      cockpitLookTarget.current.set(...view.target);
    }
  }, [camera, cameraPresetId, cameraTransitionNonce, layout, summaryMode]);

  useEffect(() => {
    const canvas = gl.domElement;
    let activePointerId: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const onPointerDown = (event: PointerEvent) => {
      if (cameraPresetId !== "cockpit" || summaryMode) return;
      activePointerId = event.pointerId;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.style.cursor = "grabbing";
      canvas.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId || cameraPresetId !== "cockpit") return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      cockpitYawTarget.current = THREE.MathUtils.clamp(
        cockpitYawTarget.current - dx * 0.0062,
        -0.95,
        0.95,
      );
      cockpitPitchTarget.current = THREE.MathUtils.clamp(
        cockpitPitchTarget.current - dy * 0.0048,
        -0.28,
        0.32,
      );
    };

    const endPointer = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId) return;
      activePointerId = null;
      canvas.style.cursor = cameraPresetId === "cockpit" ? "grab" : "default";
      if (canvas.hasPointerCapture?.(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };

    canvas.style.cursor = cameraPresetId === "cockpit" ? "grab" : "default";
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", endPointer);
    canvas.addEventListener("pointercancel", endPointer);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", endPointer);
      canvas.removeEventListener("pointercancel", endPointer);
      canvas.style.cursor = "default";
    };
  }, [cameraPresetId, gl, summaryMode]);

  useFrame((state, delta) => {
    if (summaryMode) {
      const time = state.clock.elapsedTime * 0.18;
      const desired = new THREE.Vector3(
        layout.sceneOffsetX + Math.sin(time) * 4.95,
        1.72 + Math.sin(time * 1.6) * 0.2,
        Math.cos(time) * 5.5,
      );

      camera.position.lerp(desired, 1 - Math.pow(0.002, delta));
      summaryTarget.current.set(
        layout.sceneOffsetX,
        0.5 + Math.sin(time * 0.7) * 0.035,
        0,
      );
      camera.lookAt(summaryTarget.current);
      return;
    }

    if (progress.current < 1) {
      progress.current = Math.min(1, progress.current + delta / 1.15);
      const t = 1 - Math.pow(1 - progress.current, 3);
      camera.position.lerpVectors(startPosition.current, endPosition.current, t);
      camera.fov = THREE.MathUtils.lerp(startFov.current, endFov.current, t);
      camera.updateProjectionMatrix();

      if (controls.current) {
        controls.current.target.lerpVectors(startTarget.current, endTarget.current, t);
        controls.current.update();
      } else {
        camera.lookAt(endTarget.current);
      }
      return;
    }

    if (cameraPresetId === "cockpit") {
      cockpitYaw.current = THREE.MathUtils.damp(
        cockpitYaw.current,
        cockpitYawTarget.current,
        8,
        delta,
      );
      cockpitPitch.current = THREE.MathUtils.damp(
        cockpitPitch.current,
        cockpitPitchTarget.current,
        8,
        delta,
      );
      cockpitEuler.current.set(
        cockpitPitch.current,
        cockpitYaw.current,
        0,
        "YXZ",
      );
      cockpitDirection.current
        .set(0, -0.035, 1)
        .applyEuler(cockpitEuler.current)
        .normalize();
      cockpitLookTarget.current
        .copy(camera.position)
        .addScaledVector(cockpitDirection.current, 4);
      camera.lookAt(cockpitLookTarget.current);
    }
  });

  return (
    <OrbitControls
      ref={controls}
      enabled={!summaryMode && cameraPresetId !== "cockpit"}
      enablePan={false}
      minDistance={4.4 * layout.distanceScale}
      maxDistance={7.9 * layout.distanceScale}
      minPolarAngle={Math.PI / 3.75}
      maxPolarAngle={Math.PI / 2.08}
      target={[layout.sceneOffsetX, layout.targetY, 0]}
      dampingFactor={0.05}
      enableDamping
    />
  );
}

function ExposureController({ environmentId }: { environmentId: EnvironmentId }) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    gl.toneMappingExposure = ENVIRONMENT_STYLE[environmentId].exposure;
  }, [environmentId, gl]);

  return null;
}

function StudioEnvironment({
  quality,
  environmentId,
}: {
  quality: "performance" | "balanced" | "ultra";
  environmentId: EnvironmentId;
}) {
  const dark = environmentId !== "showroom";
  const night = environmentId === "night";

  return (
    <Environment
      frames={quality === "performance" ? 1 : Infinity}
      resolution={quality === "ultra" ? 512 : 256}
    >
      <Lightformer
        intensity={dark ? 2.5 : 4.2}
        color={night ? "#d7e8ff" : "#ffffff"}
        position={[0, 6.2, 5.2]}
        scale={[6.6, 2.2, 1]}
      />
      <Lightformer
        intensity={dark ? 2.2 : 3.7}
        color={night ? "#6fa8e8" : "#ffffff"}
        position={[0, 4.8, -5.4]}
        rotation={[0, Math.PI, 0]}
        scale={[5.6, 2.4, 1]}
      />
      <Lightformer
        intensity={dark ? 2.35 : 3.6}
        color={night ? "#8ec1ff" : "#f9fcff"}
        position={[-5.9, 2.7, 0.8]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[3.6, 4.8, 1]}
      />
      <Lightformer
        intensity={dark ? 2.1 : 3.5}
        color={night ? "#dceaff" : "#ffffff"}
        position={[5.8, 2.6, 0.2]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={[3.8, 4.9, 1]}
      />
      <Lightformer
        intensity={dark ? 1.5 : 2.9}
        color={night ? "#4688d2" : "#eef5fb"}
        position={[0, 1.5, 6.8]}
        scale={[2.4, 1.2, 1]}
      />
      <Lightformer
        intensity={dark ? 1.7 : 2.6}
        color={night ? "#b9d8ff" : "#ffffff"}
        position={[0, 7.2, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[7.4, 4.2, 1]}
      />
    </Environment>
  );
}

function DisplayPlatform({
  quality,
  environmentId,
  layout,
}: {
  quality: "performance" | "balanced" | "ultra";
  environmentId: EnvironmentId;
  layout: SceneLayout;
}) {
  const dark = environmentId !== "showroom";
  const night = environmentId === "night";

  return (
    <group
      position={[layout.sceneOffsetX, -0.3, 0]}
      scale={[layout.platformScale, 1, layout.platformScale]}
    >
      <mesh position={[0, -0.16, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[4.86, 4.94, 0.24, 96]} />
        <meshStandardMaterial
          color={night ? "#111b29" : dark ? "#252a30" : "#d4dae0"}
          metalness={dark ? 0.24 : 0.1}
          roughness={dark ? 0.4 : 0.54}
          envMapIntensity={dark ? 1.05 : 0.74}
        />
      </mesh>

      <mesh receiveShadow>
        <cylinderGeometry args={[4.78, 4.82, 0.115, 96]} />
        <MeshReflectorMaterial
          resolution={quality === "performance" ? 256 : quality === "ultra" ? 1024 : 512}
          blur={quality === "performance" ? [120, 34] : [280, 68]}
          mixBlur={0.9}
          mixStrength={dark ? 0.58 : quality === "performance" ? 0.28 : 0.46}
          roughness={dark ? 0.29 : 0.23}
          depthScale={0.18}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.5}
          color={night ? "#111c2c" : dark ? "#252b31" : "#f8fafb"}
          metalness={dark ? 0.24 : 0.1}
          mirror={dark ? 0.42 : 0.31}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.061, 0]}>
        <ringGeometry args={[4.6, 4.76, 128]} />
        <meshBasicMaterial
          color={night ? "#315987" : dark ? "#59616a" : "#c8cfd6"}
          transparent
          opacity={dark ? 0.45 : 0.64}
          toneMapped={false}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.067, 0]}>
        <ringGeometry args={[4.24, 4.32, 128]} />
        <meshBasicMaterial
          color={night ? "#8fc3ff" : "#ffffff"}
          transparent
          opacity={dark ? 0.58 : 0.88}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function SceneContent({ profile }: { profile: ViewportProfile }) {
  const quality = useConfigurator((state) => state.quality);
  const environmentId = useConfigurator((state) => state.environmentId);
  const style = ENVIRONMENT_STYLE[environmentId];
  const layout = useMemo(() => getSceneLayout(profile), [profile]);
  const initialView = getCameraView("three-quarter", layout);

  return (
    <>
      <fog
        attach="fog"
        args={[
          style.fog,
          style.fogNear,
          quality === "performance" ? style.fogFar - 7 : style.fogFar,
        ]}
      />
      <PerspectiveCamera
        makeDefault
        position={initialView.position}
        fov={initialView.fov}
        near={0.03}
      />
      <ExposureController environmentId={environmentId} />
      <StudioEnvironment quality={quality} environmentId={environmentId} />

      <ambientLight intensity={style.ambient} />
      <hemisphereLight args={["#ffffff", style.hemisphereGround, style.hemisphere]} />

      <spotLight
        position={[6.0, 8.8, 6.5]}
        intensity={style.key}
        angle={0.38}
        penumbra={0.92}
        color={style.keyColor}
        castShadow
      />
      <spotLight
        position={[-6.8, 5.8, 3.7]}
        intensity={style.fill}
        angle={0.54}
        penumbra={0.88}
        color={style.fillColor}
      />
      <spotLight
        position={[-4.8, 5.0, -6.1]}
        intensity={style.rim}
        angle={0.52}
        penumbra={0.86}
        color={style.rimColor}
      />
      <pointLight
        position={[4.2, 1.8, 3.4]}
        intensity={environmentId === "showroom" ? 9 : 4.5}
        distance={10}
        color={environmentId === "night" ? "#9bc7ff" : "#ffffff"}
      />
      <pointLight
        position={[-4.6, 2.4, 2.6]}
        intensity={environmentId === "showroom" ? 6.5 : 3.8}
        distance={8}
        color={environmentId === "night" ? "#4d91dc" : "#eef7ff"}
      />

      <DisplayPlatform quality={quality} environmentId={environmentId} layout={layout} />

      <group position={[layout.sceneOffsetX, 0, 0]}>
        <PorscheGT3RS />
      </group>

      <ContactShadows
        position={[layout.sceneOffsetX, 0.25, 0]}
        opacity={environmentId === "showroom" ? 0.38 : 0.5}
        scale={8.9 * layout.platformScale}
        blur={3.2}
        far={4.8}
        color={environmentId === "night" ? "#020711" : "#4f5660"}
      />

      <CameraRig layout={layout} />
    </>
  );
}

function useViewportProfile() {
  const [profile, setProfile] = useState<ViewportProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspect = width / Math.max(height, 1);
      const kind = getViewportKind(width, height);
      const next = { width, height, aspect, kind };
      setProfile(next);
      document.documentElement.dataset.screen = kind;
      document.documentElement.dataset.aspect = aspect >= 2.05 ? "ultrawide" : aspect < 1 ? "portrait" : "standard";
      document.documentElement.style.setProperty("--app-height", `${height}px`);
      document.documentElement.style.setProperty("--app-width", `${width}px`);
    };

    update();
    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return profile;
}

export function CarScene() {
  const quality = useConfigurator((state) => state.quality);
  const environmentId = useConfigurator((state) => state.environmentId);
  const profile = useViewportProfile();
  const phoneLike = profile.kind === "phone-portrait" || profile.kind === "phone-landscape";
  const dpr: [number, number] =
    quality === "performance"
      ? [1, phoneLike ? 1.05 : 1.15]
      : quality === "ultra"
        ? [1, phoneLike ? 1.5 : 2]
        : [1, phoneLike ? 1.32 : 1.55];

  useEffect(() => {
    document.documentElement.dataset.quality = quality;
  }, [quality]);

  useEffect(() => {
    document.documentElement.dataset.environment = environmentId;
  }, [environmentId]);

  const glSettings = useMemo(
    () => ({
      antialias: quality !== "performance",
      alpha: true,
      preserveDrawingBuffer: true,
    }),
    [quality],
  );

  return (
    <Canvas
      shadows={quality !== "performance" && !phoneLike}
      dpr={dpr}
      gl={glSettings}
      onCreated={({ gl }) => {
        gl.setClearColor(0xffffff, 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = ENVIRONMENT_STYLE[environmentId].exposure;
      }}
      className="car-canvas"
    >
      <Suspense fallback={null}>
        <SceneContent profile={profile} />
      </Suspense>
    </Canvas>
  );
}
