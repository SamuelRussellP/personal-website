"use client";

import * as React from "react";

/* ---------------------------------------------------------------------------
 * HydraIntroCanvas — cinematic particle animation.
 *
 * Modes:
 *   FORWARD (default): particles fly in from edges → form "HYDRA" → disperse
 *   REVERSE (back):    particles START at "HYDRA" position → disperse → fade
 *
 * Polish:
 *   - Per-particle variance in combine delay, disperse delay, and reach so
 *     motion feels organic rather than mechanical
 *   - Breathing radial oscillation during HOLD (not random jitter)
 *   - Motion trails during disperse via semi-transparent over-paint
 *   - Soft particle halos (cheap 2D glow via layered circles)
 *   - Spring-feeling ease curves
 * ------------------------------------------------------------------------- */

const FORWARD_DURATION_MS = 2400;
const REVERSE_DURATION_MS = 1500;

export const HYDRA_INTRO_DURATION_MS = FORWARD_DURATION_MS;
export const HYDRA_REVERSE_DURATION_MS = REVERSE_DURATION_MS;

const PARTICLE_COUNT = 520;

type Particle = {
  tx: number; // target x (HYDRA word pixel)
  ty: number; // target y
  sx: number; // start x (off-screen edge)
  sy: number;
  x: number; // current x
  y: number;
  size: number;
  color: string;
  halo: string; // softer glow color
  jitter: number;
  combineDelay: number; // 0..0.2 — per-particle stagger on combine
  dispersalDelay: number; // 0..0.12
  dispersalReach: number; // 0.6..1.4 multiplier on max reach
  angle: number; // cached radial angle from center
};

function sampleWordPixels(
  text: string,
  width: number,
  height: number
): { x: number; y: number }[] {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  const fontPx = Math.min(width * 0.22, height * 0.42);
  ctx.fillStyle = "#fff";
  ctx.font = `${fontPx}px "Instrument Serif", "Times New Roman", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, width / 2, height / 2);

  const data = ctx.getImageData(0, 0, width, height).data;
  const target = PARTICLE_COUNT;
  let step = 6;
  let sampled: { x: number; y: number }[] = [];
  for (let tries = 0; tries < 5; tries++) {
    sampled = [];
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const i = (y * width + x) * 4;
        if (data[i] > 120) sampled.push({ x, y });
      }
    }
    if (sampled.length >= target * 0.85 && sampled.length <= target * 1.3)
      break;
    step = sampled.length > target ? step + 1 : Math.max(3, step - 1);
  }
  if (sampled.length > target) {
    const out: { x: number; y: number }[] = [];
    const stride = sampled.length / target;
    for (let i = 0; i < target; i++) out.push(sampled[Math.floor(i * stride)]);
    return out;
  }
  return sampled;
}

// Easings
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
// Gentle spring-like overshoot (bounded 0..~1.05 then 1)
const springOut = (t: number) => {
  const c = 1.3;
  const p = Math.pow(1 - t, 2);
  return 1 - p * Math.cos((t * Math.PI * c) / 2);
};

export function HydraIntroCanvas({
  onComplete,
  word = "HYDRA",
  reverse = false,
}: {
  onComplete?: () => void;
  word?: string;
  reverse?: boolean;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) {
      onComplete?.();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DURATION = reverse ? REVERSE_DURATION_MS : FORWARD_DURATION_MS;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const cx = width / 2;
    const cy = height / 2;

    const wordPixels = sampleWordPixels(word, width, height);

    // Emerald palette — core → halo pairs for soft glow
    const palette: { core: string; halo: string }[] = [
      { core: "#ecfdf5", halo: "rgba(236, 253, 245, 0.22)" },
      { core: "#a7f3d0", halo: "rgba(167, 243, 208, 0.20)" },
      { core: "#6ee7b7", halo: "rgba(110, 231, 183, 0.20)" },
      { core: "#34d399", halo: "rgba(52, 211, 153, 0.18)" },
      { core: "#10b981", halo: "rgba(16, 185, 129, 0.16)" },
    ];

    const particles: Particle[] = [];
    for (let i = 0; i < wordPixels.length; i++) {
      const t = wordPixels[i];
      // Random off-screen start on one of four edges
      const edge = Math.floor(Math.random() * 4);
      let sx = 0;
      let sy = 0;
      if (edge === 0) {
        sx = Math.random() * width;
        sy = -30;
      } else if (edge === 1) {
        sx = width + 30;
        sy = Math.random() * height;
      } else if (edge === 2) {
        sx = Math.random() * width;
        sy = height + 30;
      } else {
        sx = -30;
        sy = Math.random() * height;
      }
      const pal = palette[Math.floor(Math.random() * palette.length)];

      // Cached radial angle from center (used for disperse direction)
      const dx = t.x - cx;
      const dy = t.y - cy;
      const mag = Math.sqrt(dx * dx + dy * dy) || 1;

      particles.push({
        tx: t.x,
        ty: t.y,
        sx: reverse ? t.x : sx,
        sy: reverse ? t.y : sy,
        x: reverse ? t.x : sx,
        y: reverse ? t.y : sy,
        size: 1.1 + Math.random() * 1.6,
        color: pal.core,
        halo: pal.halo,
        jitter: Math.random() * Math.PI * 2,
        combineDelay: Math.random() * 0.18,
        dispersalDelay: Math.random() * 0.12,
        dispersalReach: 0.65 + Math.random() * 0.75,
        angle: Math.atan2(dy, dx),
      });
    }

    const start = performance.now();
    let raf = 0;

    const drawParticle = (
      g: CanvasRenderingContext2D,
      p: Particle,
      t: number,
      isReverse: boolean,
      stretch: number = 1,
      stretchAngle: number = 0
    ) => {
      let alpha: number;
      if (isReverse) {
        alpha = t > 0.82 ? Math.max(0, 1 - (t - 0.82) / 0.18) : 1;
      } else {
        alpha =
          t < 0.08
            ? t / 0.08
            : t > 0.88
              ? Math.max(0, 1 - (t - 0.88) / 0.12)
              : 1;
      }

      // Fast path: no stretch → round blobs
      if (stretch <= 1.001) {
        g.globalAlpha = alpha * 0.55;
        g.fillStyle = p.halo;
        g.beginPath();
        g.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
        g.fill();

        g.globalAlpha = alpha;
        g.fillStyle = p.color;
        g.beginPath();
        g.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        g.fill();
        return;
      }

      // Stretched path: transform into particle's frame, draw elongated
      // ellipse aligned with velocity direction (motion-blur look).
      g.save();
      g.translate(p.x, p.y);
      g.rotate(stretchAngle);

      // Halo — stretched, softer
      g.globalAlpha = alpha * 0.45;
      g.fillStyle = p.halo;
      g.beginPath();
      g.ellipse(
        0,
        0,
        p.size * 3.5 * stretch, // major axis along velocity
        p.size * 3.5, // minor axis unchanged
        0,
        0,
        Math.PI * 2
      );
      g.fill();

      // Core — stretched
      g.globalAlpha = alpha;
      g.fillStyle = p.color;
      g.beginPath();
      g.ellipse(
        0,
        0,
        p.size * stretch,
        p.size,
        0,
        0,
        Math.PI * 2
      );
      g.fill();

      g.restore();
    };

    const renderForward = (g: CanvasRenderingContext2D, t: number, now: number) => {
      if (t < 0.68) {
        g.globalCompositeOperation = "source-over";
        g.clearRect(0, 0, width, height);
        const bgAlpha = Math.min(1, t / 0.08);
        g.fillStyle = `rgba(9, 9, 11, ${bgAlpha})`;
        g.fillRect(0, 0, width, height);
      } else {
        const bgAlpha =
          t < 0.85 ? 1 : Math.max(0, 1 - (t - 0.85) / 0.15);
        g.fillStyle = `rgba(9, 9, 11, ${Math.max(0.18, bgAlpha * 0.22)})`;
        g.fillRect(0, 0, width, height);
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        let stretch = 1;
        let stretchAngle = 0;

        if (t < 0.55) {
          const localT = Math.max(
            0,
            (t - p.combineDelay * 0.5) / (0.55 - p.combineDelay * 0.5)
          );
          const lt = springOut(Math.min(localT, 1));
          p.x = p.sx + (p.tx - p.sx) * lt;
          p.y = p.sy + (p.ty - p.sy) * lt;
          // Incoming motion stretch — particles smear along their approach
          // vector, tapering off as they land. springOut peaks early, then
          // settles; we scale stretch by (1 - localT)^2 for gentler feel.
          const velocity = Math.pow(1 - Math.min(localT, 1), 2);
          stretch = 1 + 1.6 * velocity;
          stretchAngle = Math.atan2(p.ty - p.sy, p.tx - p.sx);
        } else if (t < 0.68) {
          const breathing =
            1 + Math.sin((now - start) * 0.004 + p.jitter) * 0.014;
          p.x = cx + (p.tx - cx) * breathing;
          p.y = cy + (p.ty - cy) * breathing;
        } else {
          const localT = Math.max(
            0,
            (t - 0.68 - p.dispersalDelay * 0.5) /
              (0.32 - p.dispersalDelay * 0.5)
          );
          const dispersal = easeOutQuart(Math.min(localT, 1));
          const reach = 900 * p.dispersalReach * dispersal;
          p.x = p.tx + Math.cos(p.angle) * reach;
          p.y = p.ty + Math.sin(p.angle) * reach;
          // Outbound motion stretch — proportional to velocity, which is the
          // derivative of easeOutQuart ∝ (1-localT)^3. Feels authentically
          // fast at start, tapers as particles reach terminal position.
          const velocity = Math.pow(1 - Math.min(localT, 1), 3);
          stretch = 1 + 2.8 * velocity;
          stretchAngle = p.angle;
        }

        drawParticle(g, p, t, false, stretch, stretchAngle);
      }
    };

    const renderReverse = (g: CanvasRenderingContext2D, t: number, now: number) => {
      if (t < 0.18) {
        g.globalCompositeOperation = "source-over";
        g.clearRect(0, 0, width, height);
        g.fillStyle = "rgba(9, 9, 11, 1)";
        g.fillRect(0, 0, width, height);
      } else {
        const bgAlpha = t < 0.55 ? 1 : Math.max(0, 1 - (t - 0.55) / 0.45);
        g.fillStyle = `rgba(9, 9, 11, ${Math.max(0.15, bgAlpha * 0.22)})`;
        g.fillRect(0, 0, width, height);
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        let stretch = 1;
        let stretchAngle = 0;

        if (t < 0.15) {
          const breathing =
            1 + Math.sin((now - start) * 0.004 + p.jitter) * 0.012;
          p.x = cx + (p.tx - cx) * breathing;
          p.y = cy + (p.ty - cy) * breathing;
        } else {
          const localT = Math.max(
            0,
            (t - 0.15 - p.dispersalDelay * 0.4) /
              (0.72 - p.dispersalDelay * 0.4)
          );
          const dispersal = easeOutQuart(Math.min(localT, 1));
          const reach = 1000 * p.dispersalReach * dispersal;
          p.x = p.tx + Math.cos(p.angle) * reach;
          p.y = p.ty + Math.sin(p.angle) * reach;
          // Same velocity-proportional stretch as forward disperse,
          // slightly stronger since reverse disperses across a larger reach.
          const velocity = Math.pow(1 - Math.min(localT, 1), 3);
          stretch = 1 + 3.2 * velocity;
          stretchAngle = p.angle;
        }

        drawParticle(g, p, t, true, stretch, stretchAngle);
      }
    };

    const frame = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / DURATION, 1);

      if (reverse) {
        renderReverse(ctx, t, now);
      } else {
        renderForward(ctx, t, now);
      }

      if (t < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        onComplete?.();
      }
    };

    raf = requestAnimationFrame(frame);
    const safety = setTimeout(() => {
      onComplete?.();
    }, DURATION + 400);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(safety);
      ctx.globalAlpha = 1;
    };
  }, [word, onComplete, reverse]);

  return <canvas ref={canvasRef} className="block" />;
}
