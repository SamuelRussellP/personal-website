"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, MapPin } from "lucide-react";
import { Container } from "./ui/container";
import { profile } from "@/lib/data";

// Hero reveal timing — sequenced so each beat lands after the previous
// element has had a moment to read. Curtain finishes at ~1.2s and slides
// up over the next 0.9s, so we begin typing at 1.5s — after the page has
// emerged but before the curtain has fully cleared, giving a layered feel.
const TYPING_PACE_MS = 95; // milliseconds between keystrokes (~10 cps)
const NAME_START_MS = 1500;
// Computed offsets in seconds (for framer-motion `delay` props elsewhere)
const TYPING_END_S =
  (NAME_START_MS + (6 + 7 + 12) * TYPING_PACE_MS) / 1000;
const SUBLINE_AT = TYPING_END_S - 0.6; // overlaps the tail of typing
const CTA_AT = TYPING_END_S + 0.3;

type TypingLine = {
  text: string;
  className?: string;
  /** Inclusive — caret should keep blinking here once typing is done. */
  isLast?: boolean;
};

/* -----------------------------------------------------------
 * TypingSequence — true typewriter reveal across multiple lines.
 *
 * A single counter ticks once every TYPING_PACE_MS, and each line
 * renders the substring of its text up to its share of the counter.
 * The caret sits at the end of whichever line is currently being
 * typed, then settles at the end of the last line and blinks.
 * Reduced-motion shows everything immediately with a static caret.
 * ----------------------------------------------------------- */
function TypingSequence({
  lines,
  startDelayMs = 0,
  paceMs = TYPING_PACE_MS,
}: {
  lines: TypingLine[];
  startDelayMs?: number;
  paceMs?: number;
}) {
  const reduce = useReducedMotion();
  const total = React.useMemo(
    () => lines.reduce((s, l) => s + l.text.length, 0),
    [lines]
  );
  const [count, setCount] = React.useState(reduce ? 1e9 : 0);
  const fullText = React.useMemo(
    () => lines.map((l) => l.text).join(" "),
    [lines]
  );

  React.useEffect(() => {
    if (reduce) return;
    let interval: ReturnType<typeof setInterval> | null = null;
    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        setCount((c) => {
          if (c >= total) {
            if (interval) clearInterval(interval);
            return c;
          }
          return c + 1;
        });
      }, paceMs);
    }, startDelayMs);

    return () => {
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
    };
  }, [total, paceMs, startDelayMs, reduce]);

  // Cumulative offsets: offsets[i] = chars consumed by lines 0..i-1.
  // Computed in useMemo so the render body stays declarative — no
  // "reassign variable after render" lint complaints.
  const offsets = React.useMemo(() => {
    const out: number[] = [];
    let acc = 0;
    for (const l of lines) {
      out.push(acc);
      acc += l.text.length;
    }
    return out;
  }, [lines]);

  const done = count >= total;
  return (
    <span aria-label={fullText}>
      {lines.map((line, i) => {
        const lineLen = line.text.length;
        const consumed = offsets[i];
        const visibleHere = Math.max(0, Math.min(count - consumed, lineLen));
        const lineActive =
          !done && count > consumed && count <= consumed + lineLen;
        const showCaretHere = lineActive || (done && line.isLast);
        return (
          <span key={i} aria-hidden className={line.className}>
            {line.text.slice(0, visibleHere)}
            {showCaretHere && <TypingCaret blinking={done} />}
          </span>
        );
      })}
    </span>
  );
}

/* -----------------------------------------------------------
 * TypingCaret — thin emerald block that sits flush against the
 * baseline. Solid while typing (so it reads as the cursor moving
 * with each keystroke), starts blinking once typing is done.
 * ----------------------------------------------------------- */
function TypingCaret({ blinking }: { blinking: boolean }) {
  return (
    <span
      aria-hidden
      // align-baseline + height ≈ cap height puts the caret flush against
      // the text baseline, so it visually sits beside the last glyph
      // instead of floating in the middle of the line.
      className={
        "inline-block ml-[0.06em] align-baseline h-[0.72em] w-[0.06em] bg-[var(--accent)]" +
        (blinking ? " animate-caret-blink" : "")
      }
    />
  );
}

/* -----------------------------------------------------------
 * JourneyPath — animated SVG showing ID → MY → DE as a flight path
 * ----------------------------------------------------------- */
function JourneyPath() {
  const reduce = useReducedMotion();
  // 3 dots: Indonesia → Malaysia → Germany
  // Coordinates in a 280x60 viewBox — stylized, not geographic.
  const stops = [
    { cx: 24, cy: 42, label: "ID" },
    { cx: 140, cy: 22, label: "MY" },
    { cx: 256, cy: 36, label: "DE" },
  ];

  return (
    <svg
      viewBox="0 0 280 60"
      className="h-10 w-auto text-[var(--accent)]"
      role="img"
      aria-label="Journey path from Indonesia to Malaysia to Germany"
    >
      {/* dashed connector */}
      <motion.path
        d="M 24 42 Q 82 6 140 22 T 256 36"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3 4"
        initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 1.2, ease: "easeOut" }}
        opacity="0.5"
      />
      {stops.map((s, i) => (
        <motion.g
          key={s.label}
          initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            delay: reduce ? 0 : 1.3 + i * 0.25,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ transformOrigin: `${s.cx}px ${s.cy}px` }}
        >
          <circle cx={s.cx} cy={s.cy} r="4" fill="currentColor" />
          <circle
            cx={s.cx}
            cy={s.cy}
            r="8"
            fill="currentColor"
            opacity="0.2"
          />
          <text
            x={s.cx}
            y={s.cy - 12}
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
            className="font-mono-meta"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {s.label}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}

/* -----------------------------------------------------------
 * LiveClock — live time in the given IANA timezone, updates every 30s
 * ----------------------------------------------------------- */
function LiveClock({ tz }: { tz: string }) {
  const [time, setTime] = React.useState<string | null>(null);

  React.useEffect(() => {
    const update = () => {
      const fmt = new Intl.DateTimeFormat("en-GB", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setTime(fmt.format(new Date()));
    };
    update();
    const id = setInterval(update, 30 * 1000);
    return () => clearInterval(id);
  }, [tz]);

  return (
    <span
      className="font-mono-meta tabular-nums"
      suppressHydrationWarning
      aria-live="polite"
    >
      {time ?? "— —"}
    </span>
  );
}

/* -----------------------------------------------------------
 * Hero
 * ----------------------------------------------------------- */
export function Hero() {
  const reduce = useReducedMotion();
  const wrapRef = React.useRef<HTMLElement>(null);
  const nameRef = React.useRef<HTMLHeadingElement>(null);
  const [spot, setSpot] = React.useState<{ x: number; y: number } | null>(null);

  // Subtle parallax scroll
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 400], [0, -40]);
  const parallaxOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reduce) return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSpot({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  // Name tilt — tracks cursor relative to the name block, applies subtle 3D
  // parallax. Uses raw rAF + transform so there's ~0 React overhead while
  // the user moves their cursor.
  React.useEffect(() => {
    if (reduce) return;
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    const el = nameRef.current;
    if (!el) return;

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let raf = 0;

    const onPointerMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // Normalize to roughly -0.5 to 0.5, clamp softly
      targetX = Math.max(-0.7, Math.min(0.7, (e.clientX - cx) / rect.width));
      targetY = Math.max(-0.7, Math.min(0.7, (e.clientY - cy) / rect.height));
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const tick = () => {
      // Low-pass / lerp toward target for buttery motion
      x += (targetX - x) * 0.08;
      y += (targetY - y) * 0.08;
      // Max tilt ~5deg — stays subtle, no disorientation
      el.style.transform = `perspective(1400px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce]);

  return (
    <section
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={() => setSpot(null)}
      className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden pt-24 pb-16"
      aria-labelledby="hero-title"
    >
      {/* Base grid */}
      <motion.div
        aria-hidden
        style={{ y: parallaxY, opacity: parallaxOpacity }}
        className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]"
      />

      {/* Ambient emerald glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[70rem] h-[70rem] rounded-full opacity-[0.18] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--accent) 0%, transparent 55%)",
        }}
      />

      {/* Mouse-aware spotlight */}
      {spot && !reduce && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${spot.x}px ${spot.y}px, color-mix(in oklab, var(--accent) 18%, transparent), transparent 60%)`,
          }}
        />
      )}

      <Container className="relative">
        {/* Eyebrow — status pill */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_60%,transparent)] backdrop-blur-sm mb-10"
        >
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-[var(--accent)] opacity-60 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
          </span>
          <span className="font-mono-meta text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
            <span className="text-foreground">Available</span>
            <span className="mx-2 text-[var(--subtle)]">·</span>
            {profile.currentLocationShort}{" "}
            <LiveClock tz={profile.currentLocationTZ} />{" "}
            {profile.currentLocationTZLabel}
          </span>
        </motion.div>

        {/* Display name — blur letters, three lines, decreasing prominence */}
        <h1
          id="hero-title"
          ref={nameRef}
          aria-label={profile.name}
          className="font-display leading-[0.9] tracking-tight text-foreground will-change-transform [transform-style:preserve-3d] transition-[transform] duration-[400ms] ease-out"
          style={{ transformOrigin: "50% 50%" }}
        >
          {/* Typewriter cascade: a single counter ticks once every
              TYPING_PACE_MS, the lines render text.slice(0, n) of their
              share, and the caret moves with the cursor — Samuel,
              Russell, Prajasantosa — settling at the end and blinking. */}
          <TypingSequence
            startDelayMs={NAME_START_MS}
            lines={[
              {
                text: "Samuel",
                className:
                  "block text-7xl sm:text-8xl md:text-8xl lg:text-9xl",
              },
              {
                text: "Russell",
                className:
                  "block text-7xl sm:text-8xl md:text-8xl lg:text-9xl text-[var(--muted)]",
              },
              {
                text: "Prajasantosa",
                className:
                  "block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-[var(--subtle)]",
                isLast: true,
              },
            ]}
          />
        </h1>

        {/* Subline: role + journey path */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: SUBLINE_AT, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8"
        >
          <div className="max-w-xl">
            <p className="text-lg md:text-xl text-[var(--muted)] leading-relaxed">
              {profile.intro}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="font-mono-meta text-[11px] uppercase tracking-[0.2em] text-[var(--subtle)]">
                <span>Role</span>
                <span className="ml-2 text-foreground">
                  {profile.currentRole}
                </span>
              </div>
              <div className="font-mono-meta text-[11px] uppercase tracking-[0.2em] text-[var(--subtle)] flex items-center gap-1.5">
                <MapPin className="h-3 w-3" aria-hidden />
                <span className="text-foreground">
                  {profile.currentCompany}
                </span>
                <span className="text-[var(--subtle)]">·</span>
                <span>Remote · Berlin HQ</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:items-end">
            <div className="font-mono-meta text-[10px] uppercase tracking-[0.22em] text-[var(--subtle)]">
              The Journey
            </div>
            <JourneyPath />
            <div className="font-mono-meta text-[11px] text-[var(--muted)] md:text-right">
              Jakarta → Semarang → Sepang → Jakarta
              <span className="text-[var(--subtle)]"> ⇄ </span>
              Berlin
            </div>
          </div>
        </motion.div>

        <motion.a
          href="#journey"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: CTA_AT }}
          className="mt-16 md:mt-20 inline-flex items-center gap-3 font-mono-meta text-xs uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--accent)] transition-colors group"
        >
          Explore the journey
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] group-hover:border-[var(--accent)] group-hover:bg-[var(--accent-soft)] transition-all">
            <ArrowDown
              className="h-3.5 w-3.5 group-hover:translate-y-0.5 transition-transform"
              aria-hidden
            />
          </span>
        </motion.a>
      </Container>

      {/* Bottom fade into next section */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 inset-x-0 h-32 bg-gradient-to-b from-transparent to-[var(--background)]"
      />
    </section>
  );
}
