"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Float, Environment, MeshDistortMaterial } from "@react-three/drei";

/* ---------------------------------------------------------------------------
 * Hydra 3D sculpture — a central organic "body" with three orbiting "heads".
 *
 * Interaction:
 *   - Mouse parallax: the whole group follows the cursor with a tangible tilt.
 *   - Hover: the orb under the cursor scales up and brightens its emissive.
 *   - Click: the orb pulses (quick scale-down-then-settle) + emits a brief
 *     emerald "shockwave" ring.
 * ------------------------------------------------------------------------- */

function Orb({
  position,
  orbit,
  size,
  emissive,
  autoRotate = true,
}: {
  position?: [number, number, number];
  orbit?: {
    angle: number;
    radius: number;
    speed: number;
    phase: number;
  };
  size: number;
  emissive: string;
  autoRotate?: boolean;
}) {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = React.useState(false);
  const [pulseStart, setPulseStart] = React.useState<number | null>(null);

  useFrame((state) => {
    const m = meshRef.current;
    if (!m) return;

    // Orbit motion
    if (orbit) {
      const t = state.clock.elapsedTime * orbit.speed + orbit.phase;
      m.position.x = Math.cos(t + orbit.angle) * orbit.radius;
      m.position.z = Math.sin(t + orbit.angle) * orbit.radius;
      m.position.y =
        Math.sin(state.clock.elapsedTime * 0.8 + orbit.phase) * 0.25;
    }
    if (autoRotate) {
      m.rotation.x = state.clock.elapsedTime * 0.3;
      m.rotation.y = state.clock.elapsedTime * 0.2;
    }

    // Hover + click scale response
    let targetScale = hovered ? 1.2 : 1.0;
    if (pulseStart !== null) {
      const elapsed = (performance.now() - pulseStart) / 500; // 500ms pulse
      if (elapsed < 1) {
        // First half: shrink to 0.85; second half: back to hover/normal
        const pulse =
          elapsed < 0.5
            ? 1 - 0.15 * (elapsed / 0.5)
            : 0.85 + 0.15 * ((elapsed - 0.5) / 0.5);
        targetScale = targetScale * pulse;
      } else {
        setPulseStart(null);
      }
    }
    m.scale.x += (targetScale - m.scale.x) * 0.15;
    m.scale.y = m.scale.x;
    m.scale.z = m.scale.x;
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };
  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "";
  };
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setPulseStart(performance.now());
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <sphereGeometry args={[size, 64, 64]} />
      <MeshDistortMaterial
        color={hovered ? "#0f5a44" : "#0b3b2e"}
        emissive={emissive}
        emissiveIntensity={hovered ? 2.2 : 1.1}
        roughness={0.12}
        metalness={0.45}
        distort={hovered ? 0.55 : 0.4}
        speed={hovered ? 3 : 1.6}
      />
    </mesh>
  );
}

function MouseParallax({
  children,
}: {
  children: React.ReactNode;
}) {
  const group = React.useRef<THREE.Group>(null);
  const target = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
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

  useFrame(() => {
    if (!group.current) return;
    // Stronger, snappier parallax — user can actually feel it
    group.current.rotation.y +=
      (target.current.x * 0.7 - group.current.rotation.y) * 0.08;
    group.current.rotation.x +=
      (target.current.y * 0.4 - group.current.rotation.x) * 0.08;
  });

  return <group ref={group}>{children}</group>;
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight
        position={[5, 5, 5]}
        color="#34d399"
        intensity={3}
        distance={15}
      />
      <pointLight
        position={[-5, -3, 3]}
        color="#10b981"
        intensity={2.2}
        distance={12}
      />
      <pointLight
        position={[0, 0, -4]}
        color="#065f46"
        intensity={1.4}
        distance={10}
      />
      <Environment preset="night" />

      <MouseParallax>
        <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>
          {/* Central body */}
          <Orb size={1.05} emissive="#10b981" />
          {/* Three orbiting heads */}
          <Orb
            orbit={{ angle: 0, radius: 1.9, speed: 0.45, phase: 0 }}
            size={0.42}
            emissive="#10b981"
          />
          <Orb
            orbit={{
              angle: (Math.PI * 2) / 3,
              radius: 1.9,
              speed: 0.45,
              phase: 1.1,
            }}
            size={0.42}
            emissive="#34d399"
          />
          <Orb
            orbit={{
              angle: (Math.PI * 4) / 3,
              radius: 1.9,
              speed: 0.45,
              phase: 2.2,
            }}
            size={0.42}
            emissive="#6ee7b7"
          />
        </Float>
      </MouseParallax>
    </>
  );
}

export default function HydraScene3D() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 7.2], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <Scene />
    </Canvas>
  );
}
