"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

type ExperienceMode = "signal" | "systems" | "proof";

const PALETTES: Record<
  ExperienceMode,
  { core: string; edge: string; particles: string; glow: string }
> = {
  signal: {
    core: "#d7f5ff",
    edge: "#f5fdff",
    particles: "#86e8ff",
    glow: "#163f57",
  },
  systems: {
    core: "#dcfff2",
    edge: "#f8fffc",
    particles: "#74f1c4",
    glow: "#12382c",
  },
  proof: {
    core: "#ffe8c6",
    edge: "#fff8ef",
    particles: "#ffc27a",
    glow: "#4e3111",
  },
};

function makeDotTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  const size = 64;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.45, "rgba(255,255,255,0.6)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function usePointerTarget() {
  const target = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const onMove = (event: PointerEvent) => {
      target.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    const onLeave = () => {
      target.current.x = 0;
      target.current.y = 0;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return target;
}

function ParticleField({ mode }: { mode: ExperienceMode }) {
  const pointsRef = React.useRef<THREE.Points>(null);
  const materialRef = React.useRef<THREE.PointsMaterial>(null);
  const dotTexture = React.useMemo(() => makeDotTexture(), []);

  const geometry = React.useMemo(() => {
    const particleCount = 1800;
    const positions = new Float32Array(particleCount * 3);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let index = 0; index < particleCount; index++) {
      const spread = index / particleCount;
      const radius = 2.2 + spread * 3.8;
      const theta = goldenAngle * index * 1.4;
      const y = 1 - spread * 2;
      const radial = Math.sqrt(Math.max(0, 1 - y * y));

      positions[index * 3] = radius * radial * Math.cos(theta);
      positions[index * 3 + 1] = radius * y * 0.7;
      positions[index * 3 + 2] = radius * radial * Math.sin(theta);
    }

    const field = new THREE.BufferGeometry();
    field.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return field;
  }, []);

  const palette = React.useMemo(() => PALETTES[mode], [mode]);
  const targetColor = React.useMemo(
    () => new THREE.Color(palette.particles),
    [palette]
  );

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.025;
      pointsRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.12) * 0.08;
    }
    if (materialRef.current) {
      materialRef.current.color.lerp(targetColor, 0.08);
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        ref={materialRef}
        map={dotTexture ?? undefined}
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0.8}
        depthWrite={false}
        alphaTest={0.01}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function ExperienceSculpture({
  mode,
  progress,
}: {
  mode: ExperienceMode;
  progress: number;
}) {
  const rootRef = React.useRef<THREE.Group>(null);
  const shellRef = React.useRef<THREE.Mesh>(null);
  const shellMaterialRef = React.useRef<THREE.MeshPhysicalMaterial>(null);
  const innerMaterialRef = React.useRef<THREE.MeshBasicMaterial>(null);
  const edgeMaterialRef = React.useRef<THREE.LineBasicMaterial>(null);
  const ringARef = React.useRef<THREE.Mesh>(null);
  const ringBRef = React.useRef<THREE.Mesh>(null);
  const ringCRef = React.useRef<THREE.Mesh>(null);
  const ringMaterialARef = React.useRef<THREE.MeshBasicMaterial>(null);
  const ringMaterialBRef = React.useRef<THREE.MeshBasicMaterial>(null);
  const ringMaterialCRef = React.useRef<THREE.MeshBasicMaterial>(null);
  const pointer = usePointerTarget();
  const { camera } = useThree();

  const shellGeometry = React.useMemo(
    () => new THREE.IcosahedronGeometry(1.12, 5),
    []
  );
  const edgeGeometry = React.useMemo(
    () => new THREE.EdgesGeometry(shellGeometry, 18),
    [shellGeometry]
  );

  const palette = React.useMemo(() => PALETTES[mode], [mode]);
  const colors = React.useMemo(
    () => ({
      core: new THREE.Color(palette.core),
      edge: new THREE.Color(palette.edge),
      particles: new THREE.Color(palette.particles),
      glow: new THREE.Color(palette.glow),
    }),
    [palette]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pointerX = pointer.current.x;
    const pointerY = pointer.current.y;
    const stage = THREE.MathUtils.clamp(progress, 0, 1);

    const cameraTarget = new THREE.Vector3(
      Math.sin(stage * Math.PI) * 0.85 + pointerX * 0.28,
      (0.5 - stage) * 0.95 - pointerY * 0.18,
      5.8 - stage * 1.6
    );

    camera.position.lerp(cameraTarget, 0.06);
    camera.lookAt(0, stage * 0.16, 0);

    if (rootRef.current) {
      rootRef.current.rotation.y += 0.0045 + stage * 0.003;
      rootRef.current.rotation.x = THREE.MathUtils.lerp(
        rootRef.current.rotation.x,
        -0.18 - pointerY * 0.12 + stage * 0.24,
        0.05
      );
      rootRef.current.rotation.z = THREE.MathUtils.lerp(
        rootRef.current.rotation.z,
        pointerX * 0.08,
        0.05
      );
      rootRef.current.position.y = THREE.MathUtils.lerp(
        rootRef.current.position.y,
        -0.1 + Math.sin(t * 0.8) * 0.08 - stage * 0.28,
        0.05
      );
    }

    if (shellRef.current) {
      const scale = 1 + Math.sin(t * 0.9) * 0.024 + stage * 0.14;
      shellRef.current.scale.setScalar(scale);
      shellRef.current.rotation.x += 0.003;
      shellRef.current.rotation.y -= 0.0025;
    }

    if (ringARef.current) {
      ringARef.current.rotation.x += 0.004 + stage * 0.004;
      ringARef.current.rotation.y += 0.002;
      ringARef.current.scale.setScalar(1 + stage * 0.1);
    }
    if (ringBRef.current) {
      ringBRef.current.rotation.y -= 0.0035;
      ringBRef.current.rotation.z += 0.0025 + stage * 0.003;
      ringBRef.current.scale.setScalar(1 + stage * 0.17);
    }
    if (ringCRef.current) {
      ringCRef.current.rotation.x -= 0.0028;
      ringCRef.current.rotation.z += 0.0035;
      ringCRef.current.scale.setScalar(1 + stage * 0.22);
    }

    shellMaterialRef.current?.color.lerp(colors.core, 0.08);
    shellMaterialRef.current?.emissive.lerp(colors.glow, 0.05);
    if (shellMaterialRef.current) {
      shellMaterialRef.current.opacity = 0.62 + stage * 0.06;
    }
    innerMaterialRef.current?.color.lerp(colors.particles, 0.08);
    edgeMaterialRef.current?.color.lerp(colors.edge, 0.08);
    ringMaterialARef.current?.color.lerp(colors.edge, 0.08);
    ringMaterialBRef.current?.color.lerp(colors.particles, 0.08);
    ringMaterialCRef.current?.color.lerp(colors.edge, 0.08);
  });

  return (
    <group ref={rootRef}>
      <group>
        <mesh ref={shellRef} geometry={shellGeometry}>
          <meshPhysicalMaterial
            ref={shellMaterialRef}
            color={palette.core}
            transparent
            opacity={0.62}
            metalness={0.35}
            roughness={0.16}
            clearcoat={1}
            clearcoatRoughness={0.2}
            emissive={palette.glow}
            emissiveIntensity={0.9}
          />
        </mesh>

        <lineSegments geometry={edgeGeometry}>
          <lineBasicMaterial
            ref={edgeMaterialRef}
            color={palette.edge}
            transparent
            opacity={0.7}
          />
        </lineSegments>

        <mesh scale={0.54}>
          <sphereGeometry args={[1, 48, 48]} />
          <meshBasicMaterial
            ref={innerMaterialRef}
            color={palette.particles}
            transparent
            opacity={0.18}
          />
        </mesh>
      </group>

      <mesh ref={ringARef} rotation={[0.8, 0.4, 0.1]}>
        <torusGeometry args={[1.84, 0.018, 24, 220]} />
        <meshBasicMaterial
          ref={ringMaterialARef}
          color={palette.edge}
          transparent
          opacity={0.58}
        />
      </mesh>
      <mesh ref={ringBRef} rotation={[1.2, -0.5, 1.1]}>
        <torusGeometry args={[2.26, 0.024, 24, 220]} />
        <meshBasicMaterial
          ref={ringMaterialBRef}
          color={palette.particles}
          transparent
          opacity={0.26}
        />
      </mesh>
      <mesh ref={ringCRef} rotation={[0.2, 0.8, -1.1]}>
        <torusGeometry args={[2.72, 0.012, 16, 220]} />
        <meshBasicMaterial
          ref={ringMaterialCRef}
          color={palette.edge}
          transparent
          opacity={0.36}
        />
      </mesh>
    </group>
  );
}

function Scene({
  mode,
  progress,
}: {
  mode: ExperienceMode;
  progress: number;
}) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 3, 5]} intensity={2.2} color="#ffffff" />
      <pointLight position={[-3, -2, 4]} intensity={1.2} color="#9ad8ff" />
      <ExperienceSculpture mode={mode} progress={progress} />
      <ParticleField mode={mode} />
    </>
  );
}

export default function ExperienceScene3D({
  mode,
  progress,
}: {
  mode: ExperienceMode;
  progress: number;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.2, 5.8], fov: 42 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <Scene mode={mode} progress={progress} />
    </Canvas>
  );
}
