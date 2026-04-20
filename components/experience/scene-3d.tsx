"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

type Palette = {
  core: string;
  edge: string;
  particles: string;
  glow: string;
};

// Four palettes, one per career chapter.
// origin (cyan) → scale (green) → lead (amber) → agents (rose)
const PALETTES: Palette[] = [
  {
    core: "#d7f5ff",
    edge: "#f5fdff",
    particles: "#86e8ff",
    glow: "#163f57",
  },
  {
    core: "#dcfff2",
    edge: "#f8fffc",
    particles: "#74f1c4",
    glow: "#12382c",
  },
  {
    core: "#ffe8c6",
    edge: "#fff8ef",
    particles: "#ffc27a",
    glow: "#4e3111",
  },
  {
    core: "#ffd9f2",
    edge: "#fff0fa",
    particles: "#ffb3ec",
    glow: "#4d1a3a",
  },
];

// Lerp between the 4 palette stops based on 0..1 progress.
function paletteAt(progress: number): {
  core: THREE.Color;
  edge: THREE.Color;
  particles: THREE.Color;
  glow: THREE.Color;
} {
  const scaled = THREE.MathUtils.clamp(progress, 0, 1) * (PALETTES.length - 1);
  const i = Math.min(PALETTES.length - 2, Math.floor(scaled));
  const t = scaled - i;
  const a = PALETTES[i];
  const b = PALETTES[i + 1];
  const mix = (x: string, y: string) =>
    new THREE.Color(x).lerp(new THREE.Color(y), t);
  return {
    core: mix(a.core, b.core),
    edge: mix(a.edge, b.edge),
    particles: mix(a.particles, b.particles),
    glow: mix(a.glow, b.glow),
  };
}

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

function ParticleField({
  progressRef,
  pulseKeyRef,
}: {
  progressRef: React.MutableRefObject<number>;
  pulseKeyRef: React.MutableRefObject<number>;
}) {
  const pointsRef = React.useRef<THREE.Points>(null);
  const materialRef = React.useRef<THREE.PointsMaterial>(null);
  const dotTexture = React.useMemo(() => makeDotTexture(), []);
  const lastSeenKeyRef = React.useRef(0);
  const pulseStartRef = React.useRef(-999);

  const geometry = React.useMemo(() => {
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let index = 0; index < particleCount; index++) {
      const spread = index / particleCount;
      const radius = 2.2 + spread * 4.2;
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

  useFrame((state) => {
    const stage = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    const target = paletteAt(stage).particles;

    // Latch a new pulse start if pulseKey changed.
    if (pulseKeyRef.current !== lastSeenKeyRef.current) {
      pulseStartRef.current = state.clock.elapsedTime;
      lastSeenKeyRef.current = pulseKeyRef.current;
    }
    const pulseAge = state.clock.elapsedTime - pulseStartRef.current;
    const pulseDuration = 0.55;
    const pulse =
      pulseAge >= 0 && pulseAge < pulseDuration
        ? Math.sin((pulseAge / pulseDuration) * Math.PI)
        : 0;

    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.025;
      pointsRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.12) * 0.08;
      const scale = 1 + stage * 0.28 + pulse * 0.16;
      pointsRef.current.scale.setScalar(scale);
    }
    if (materialRef.current) {
      materialRef.current.color.lerp(target, 0.08);
      materialRef.current.opacity = 0.6 + stage * 0.25 + pulse * 0.25;
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
        opacity={0.72}
        depthWrite={false}
        alphaTest={0.01}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function ExperienceSculpture({
  progressRef,
  pulseKeyRef,
}: {
  progressRef: React.MutableRefObject<number>;
  pulseKeyRef: React.MutableRefObject<number>;
}) {
  const rootRef = React.useRef<THREE.Group>(null);
  const lastSeenKeyRef = React.useRef(0);
  const pulseStartRef = React.useRef(-999);
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

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pointerX = pointer.current.x;
    const pointerY = pointer.current.y;
    const stage = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    const colors = paletteAt(stage);

    // Latch a new pulse start if pulseKey changed.
    if (pulseKeyRef.current !== lastSeenKeyRef.current) {
      pulseStartRef.current = t;
      lastSeenKeyRef.current = pulseKeyRef.current;
    }
    const pulseAge = t - pulseStartRef.current;
    const pulseDuration = 0.5;
    const pulse =
      pulseAge >= 0 && pulseAge < pulseDuration
        ? Math.sin((pulseAge / pulseDuration) * Math.PI)
        : 0;

    const cameraTarget = new THREE.Vector3(
      Math.sin(stage * Math.PI * 1.2) * 1.1 + pointerX * 0.3,
      (0.6 - stage) * 1.1 - pointerY * 0.2,
      6.0 - stage * 2.1
    );

    camera.position.lerp(cameraTarget, 0.06);
    camera.lookAt(0, stage * 0.18, 0);

    if (rootRef.current) {
      rootRef.current.rotation.y += 0.0045 + stage * 0.004;
      rootRef.current.rotation.x = THREE.MathUtils.lerp(
        rootRef.current.rotation.x,
        -0.18 - pointerY * 0.12 + stage * 0.32,
        0.05
      );
      rootRef.current.rotation.z = THREE.MathUtils.lerp(
        rootRef.current.rotation.z,
        pointerX * 0.1 + stage * 0.1,
        0.05
      );
      rootRef.current.position.y = THREE.MathUtils.lerp(
        rootRef.current.position.y,
        -0.1 + Math.sin(t * 0.8) * 0.08 - stage * 0.34,
        0.05
      );
    }

    if (shellRef.current) {
      const baseScale = 1 + Math.sin(t * 0.9) * 0.024 + stage * 0.22;
      shellRef.current.scale.setScalar(baseScale * (1 + pulse * 0.18));
      shellRef.current.rotation.x += 0.003 + pulse * 0.015;
      shellRef.current.rotation.y -= 0.0025 + pulse * 0.012;
    }

    // Rings spread more aggressively at the final chapter.
    if (ringARef.current) {
      ringARef.current.rotation.x += 0.004 + stage * 0.006 + pulse * 0.02;
      ringARef.current.rotation.y += 0.002;
      ringARef.current.scale.setScalar(1 + stage * 0.22 + pulse * 0.14);
    }
    if (ringBRef.current) {
      ringBRef.current.rotation.y -= 0.0035 + pulse * 0.018;
      ringBRef.current.rotation.z += 0.0025 + stage * 0.005;
      ringBRef.current.scale.setScalar(1 + stage * 0.3 + pulse * 0.18);
    }
    if (ringCRef.current) {
      ringCRef.current.rotation.x -= 0.0028;
      ringCRef.current.rotation.z += 0.0035 + stage * 0.004 + pulse * 0.018;
      ringCRef.current.scale.setScalar(1 + stage * 0.38 + pulse * 0.22);
    }

    shellMaterialRef.current?.color.lerp(colors.core, 0.08);
    shellMaterialRef.current?.emissive.lerp(colors.glow, 0.05);
    if (shellMaterialRef.current) {
      shellMaterialRef.current.opacity = 0.6 + stage * 0.12 + pulse * 0.08;
      shellMaterialRef.current.emissiveIntensity =
        0.9 + stage * 0.6 + pulse * 1.4;
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
            color={PALETTES[0].core}
            transparent
            opacity={0.62}
            metalness={0.35}
            roughness={0.16}
            clearcoat={1}
            clearcoatRoughness={0.2}
            emissive={PALETTES[0].glow}
            emissiveIntensity={0.9}
          />
        </mesh>

        <lineSegments geometry={edgeGeometry}>
          <lineBasicMaterial
            ref={edgeMaterialRef}
            color={PALETTES[0].edge}
            transparent
            opacity={0.7}
          />
        </lineSegments>

        <mesh scale={0.54}>
          <sphereGeometry args={[1, 48, 48]} />
          <meshBasicMaterial
            ref={innerMaterialRef}
            color={PALETTES[0].particles}
            transparent
            opacity={0.2}
          />
        </mesh>
      </group>

      <mesh ref={ringARef} rotation={[0.8, 0.4, 0.1]}>
        <torusGeometry args={[1.84, 0.018, 24, 220]} />
        <meshBasicMaterial
          ref={ringMaterialARef}
          color={PALETTES[0].edge}
          transparent
          opacity={0.58}
        />
      </mesh>
      <mesh ref={ringBRef} rotation={[1.2, -0.5, 1.1]}>
        <torusGeometry args={[2.26, 0.024, 24, 220]} />
        <meshBasicMaterial
          ref={ringMaterialBRef}
          color={PALETTES[0].particles}
          transparent
          opacity={0.26}
        />
      </mesh>
      <mesh ref={ringCRef} rotation={[0.2, 0.8, -1.1]}>
        <torusGeometry args={[2.72, 0.012, 16, 220]} />
        <meshBasicMaterial
          ref={ringMaterialCRef}
          color={PALETTES[0].edge}
          transparent
          opacity={0.36}
        />
      </mesh>
    </group>
  );
}

function Scene({
  progressRef,
  pulseKeyRef,
}: {
  progressRef: React.MutableRefObject<number>;
  pulseKeyRef: React.MutableRefObject<number>;
}) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 3, 5]} intensity={2.2} color="#ffffff" />
      <pointLight position={[-3, -2, 4]} intensity={1.2} color="#9ad8ff" />
      <ExperienceSculpture
        progressRef={progressRef}
        pulseKeyRef={pulseKeyRef}
      />
      <ParticleField progressRef={progressRef} pulseKeyRef={pulseKeyRef} />
    </>
  );
}

export default function ExperienceScene3D({
  progress,
  pulseKey,
}: {
  progress: number;
  pulseKey: number;
}) {
  const progressRef = React.useRef(progress);
  const pulseKeyRef = React.useRef(pulseKey);
  React.useEffect(() => {
    progressRef.current = progress;
  }, [progress]);
  React.useEffect(() => {
    pulseKeyRef.current = pulseKey;
  }, [pulseKey]);

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.2, 5.8], fov: 42 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <Scene progressRef={progressRef} pulseKeyRef={pulseKeyRef} />
    </Canvas>
  );
}
