"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";

/* ---------------------------------------------------------------------------
 * Hydra 3D sculpture — a neural-network cloud of glowing nodes connected by
 * thin synapses. Reads clearly as AI / brain-like neural activity, while
 * staying pure points + lines so first paint is instant (no HDR, no GLB).
 * ------------------------------------------------------------------------- */

type NodeDef = { pos: THREE.Vector3; phase: number };

/**
 * Reshape a point on a unit sphere into a brain-like form:
 *   - ovoid body (longer front-to-back, flatter top-to-bottom)
 *   - longitudinal fissure (groove along the top midline)
 *   - low-frequency radial bumps (gyri / sulci feel)
 */
function shapeToBrain(
  ux: number,
  uy: number,
  uz: number,
  radius: number
): THREE.Vector3 {
  // Base ovoid: stretch in z (front-to-back), compress in y (top-to-bottom)
  let px = ux * radius * 1.02;
  let py = uy * radius * 0.82;
  let pz = uz * radius * 1.28;

  // Longitudinal fissure — only on the top hemisphere. Points near the
  // x=0 midline get pulled inward so a V-shape groove opens along the top.
  if (py > 0) {
    const cleft = Math.exp(-(px * px) / (0.09 * radius * radius));
    py -= cleft * radius * 0.28;
  }

  // Surface folds — two octaves of sine-based pseudo-noise displaced along
  // the outward direction. Gives organic gyri-like bumps.
  const angleXZ = Math.atan2(px, pz);
  const angleY = Math.atan2(py, Math.hypot(px, pz));
  const bumps =
    Math.sin(angleXZ * 5.3) * Math.cos(angleY * 4.7) * 0.1 +
    Math.sin(angleXZ * 9.1 + 1.1) * Math.cos(angleY * 7.3 + 0.6) * 0.055;

  const len = Math.hypot(px, py, pz) || 1;
  const scale = (len + bumps * radius) / len;
  return new THREE.Vector3(px * scale, py * scale, pz * scale);
}

function generateNodes(count: number, radius: number): NodeDef[] {
  const nodes: NodeDef[] = [];
  // Fibonacci lattice — even-ish seed distribution on the unit sphere
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = phi * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    // Small jitter breaks the lattice symmetry
    const j = 0.07;
    const jx = (Math.random() - 0.5) * j;
    const jy = (Math.random() - 0.5) * j;
    const jz = (Math.random() - 0.5) * j;
    const pos = shapeToBrain(x + jx, y + jy, z + jz, radius);
    nodes.push({ pos, phase: Math.random() * Math.PI * 2 });
  }
  return nodes;
}

function buildEdges(nodes: NodeDef[], k = 3): [number, number][] {
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  for (let i = 0; i < nodes.length; i++) {
    const sorted = nodes
      .map((n, j) => ({
        j,
        d: i === j ? Infinity : nodes[i].pos.distanceTo(n.pos),
      }))
      .sort((a, b) => a.d - b.d);
    for (let n = 0; n < k; n++) {
      const j = sorted[n].j;
      const key = i < j ? `${i}:${j}` : `${j}:${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([i, j]);
      }
    }
  }
  return edges;
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
  grad.addColorStop(0.35, "rgba(255,255,255,0.7)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function NeuralCloud() {
  const group = React.useRef<THREE.Group>(null);
  const pointsMatRef = React.useRef<THREE.PointsMaterial>(null);
  const linesMatRef = React.useRef<THREE.LineBasicMaterial>(null);

  const { nodes, edges } = React.useMemo(() => {
    const n = generateNodes(180, 1.9);
    const e = buildEdges(n, 3);
    return { nodes: n, edges: e };
  }, []);

  const dotTexture = React.useMemo(() => makeDotTexture(), []);

  const pointsGeometry = React.useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(nodes.length * 3);
    nodes.forEach((n, i) => {
      positions[i * 3] = n.pos.x;
      positions[i * 3 + 1] = n.pos.y;
      positions[i * 3 + 2] = n.pos.z;
    });
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geom;
  }, [nodes]);

  const linesGeometry = React.useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], i) => {
      const pa = nodes[a].pos;
      const pb = nodes[b].pos;
      positions[i * 6] = pa.x;
      positions[i * 6 + 1] = pa.y;
      positions[i * 6 + 2] = pa.z;
      positions[i * 6 + 3] = pb.x;
      positions[i * 6 + 4] = pb.y;
      positions[i * 6 + 5] = pb.z;
    });
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geom;
  }, [nodes, edges]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = t * 0.07;
    }
    // Breathing pulse — dot size + synapse opacity gently oscillate so the
    // network feels alive rather than static.
    if (pointsMatRef.current) {
      pointsMatRef.current.size = 0.085 + Math.sin(t * 1.5) * 0.008;
    }
    if (linesMatRef.current) {
      linesMatRef.current.opacity = 0.22 + Math.sin(t * 0.9) * 0.05;
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={linesGeometry}>
        <lineBasicMaterial
          ref={linesMatRef}
          color="#10b981"
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      <points geometry={pointsGeometry}>
        <pointsMaterial
          ref={pointsMatRef}
          size={0.085}
          map={dotTexture ?? undefined}
          color="#6ee7b7"
          transparent
          opacity={0.95}
          sizeAttenuation
          depthWrite={false}
          alphaTest={0.01}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

function MouseParallax({ children }: { children: React.ReactNode }) {
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
    group.current.rotation.y +=
      (target.current.x * 0.6 - group.current.rotation.y) * 0.08;
    group.current.rotation.x +=
      (target.current.y * 0.35 - group.current.rotation.x) * 0.08;
  });

  return <group ref={group}>{children}</group>;
}

function Scene() {
  return (
    <MouseParallax>
      <Float speed={1.0} rotationIntensity={0.15} floatIntensity={0.4}>
        {/* Tilt forward so the longitudinal fissure on top stays in view */}
        <group rotation={[0.35, 0, 0]}>
          <NeuralCloud />
        </group>
      </Float>
    </MouseParallax>
  );
}

export default function HydraScene3D() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 5.8], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <Scene />
    </Canvas>
  );
}
