"use client";

import * as React from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  ExternalLink,
  BookOpen,
  Award,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Section } from "./ui/section";
import { profile } from "@/lib/data";

/* -----------------------------------------------------------
 * ScrambleText — "cipher breaking" reveal for the title
 * ----------------------------------------------------------- */
const GLYPHS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*+=<>/\\|~";

function ScrambleText({
  text,
  start,
  durationMs = 2800,
  className,
}: {
  text: string;
  start: boolean;
  durationMs?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  // Start with the real text for SSR parity — randomize only after mount.
  const [out, setOut] = React.useState(text);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    if (reduce) {
      setOut(text);
      return;
    }
    if (!start) {
      // Pre-animation: fill with random glyphs until triggered
      setOut(
        text
          .split("")
          .map((c) =>
            c === " "
              ? " "
              : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          )
          .join("")
      );
      return;
    }
    const startTime = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const t = Math.min(1, (now - startTime) / durationMs);
      const revealCount = Math.floor(t * text.length);
      const next = text
        .split("")
        .map((c, i) => {
          if (i < revealCount || c === " ") return c;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");
      setOut(next);
      if (t < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mounted, start, text, durationMs, reduce]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{out}</span>
    </span>
  );
}

/* -----------------------------------------------------------
 * PublishedStamp — decorative circular badge
 * ----------------------------------------------------------- */
function PublishedStamp() {
  const label =
    " · PUBLISHED · APRIL 2025 · SPRINGER NATURE · PEER REVIEWED";
  return (
    <div className="relative h-36 w-36 md:h-44 md:w-44 flex-shrink-0">
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute inset-0 text-[var(--accent)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <path
            id="stamp-circle"
            d="M 100, 100 m -78, 0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0"
          />
        </defs>
        <text
          fill="currentColor"
          className="font-mono-meta"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.18em",
          }}
        >
          <textPath href="#stamp-circle" startOffset="0">
            {label.repeat(3)}
          </textPath>
        </text>
      </motion.svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full border-2 border-[var(--accent)] bg-[var(--accent-soft)]">
          <ShieldCheck className="h-8 w-8 md:h-10 md:w-10 text-[var(--accent)]" />
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
 * Main
 * ----------------------------------------------------------- */
export function Thesis() {
  const ref = React.useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <Section
      id="education"
      eyebrow="Published Research"
      title="Breaking a cipher, landing a Springer publication."
      lede="My undergraduate thesis — a differential fault analysis on the TinyJAMBU lightweight authenticated encryption stream cipher — was accepted into Springer Nature's Information Security in a Connected World. Published April 2025."
    >
      <motion.article
        ref={ref}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden card p-8 md:p-12"
      >
        {/* Accent glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--accent) 0%, transparent 60%)",
          }}
        />
        {/* Subtle bit-grid background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06] [mask-image:radial-gradient(ellipse_at_top_right,black_20%,transparent_70%)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--muted) 1px, transparent 1px), linear-gradient(to bottom, var(--muted) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        <div className="relative grid md:grid-cols-[1fr_auto] gap-8 md:gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 font-mono-meta text-xs uppercase tracking-[0.18em] text-[var(--accent)] mb-6">
              <FileText className="h-3.5 w-3.5" aria-hidden />
              Publication · April 2025
            </div>

            <h3 className="font-display text-3xl md:text-4xl leading-tight text-foreground mb-4 font-mono-meta md:font-display">
              <ScrambleText
                text="Differential Fault Attacks on Lightweight Authenticated Encryption Stream Cipher TinyJAMBU"
                start={inView}
                className="font-display"
              />
            </h3>

            <p className="text-[var(--muted)] leading-relaxed mb-6 max-w-2xl">
              Cryptographic analysis work exploring how differential fault
              injection can break TinyJAMBU — a NIST lightweight-cryptography
              finalist. The thesis earned a 4.0 GPA at Xiamen University
              Malaysia and was later accepted into Springer Nature's
              peer-reviewed collection on information security.
            </p>

            <dl className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              <div>
                <dt className="font-mono-meta text-[11px] uppercase tracking-[0.15em] text-[var(--subtle)] mb-1">
                  Published in
                </dt>
                <dd className="text-sm text-foreground">
                  Information Security in a Connected World
                </dd>
              </div>
              <div>
                <dt className="font-mono-meta text-[11px] uppercase tracking-[0.15em] text-[var(--subtle)] mb-1">
                  Publisher
                </dt>
                <dd className="text-sm text-foreground">
                  Springer Nature Switzerland
                </dd>
              </div>
              <div>
                <dt className="font-mono-meta text-[11px] uppercase tracking-[0.15em] text-[var(--subtle)] mb-1">
                  Thesis GPA
                </dt>
                <dd className="text-sm text-foreground">4.0 / 4.0</dd>
              </div>
            </dl>

            <a
              href={profile.links.thesis}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--accent)] text-[#052e20] font-medium text-sm hover:bg-[var(--accent-strong)] transition-colors"
            >
              Read on Springer
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </div>

          {/* Right column: stamp + meta */}
          <div className="flex flex-col items-start md:items-end gap-8">
            <PublishedStamp />

            <div className="w-full md:max-w-[220px] flex flex-col gap-4 border-t md:border-t-0 md:border-l border-[var(--border)] md:pl-8 pt-6 md:pt-0">
              <div>
                <div className="flex items-center gap-2 text-[var(--muted)] mb-1">
                  <Award
                    className="h-4 w-4 text-[var(--accent)]"
                    aria-hidden
                  />
                  <span className="font-mono-meta text-[11px] uppercase tracking-[0.15em]">
                    Scholarship
                  </span>
                </div>
                <div className="text-sm text-foreground">50% Merit</div>
                <div className="text-xs text-[var(--muted)]">
                  Maintained 4 years
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-[var(--muted)] mb-1">
                  <BookOpen
                    className="h-4 w-4 text-[var(--accent)]"
                    aria-hidden
                  />
                  <span className="font-mono-meta text-[11px] uppercase tracking-[0.15em]">
                    CGPA
                  </span>
                </div>
                <div className="text-sm text-foreground">3.35 / 4.0</div>
                <div className="text-xs text-[var(--muted)]">
                  B.Eng. Hons · Xiamen University Malaysia
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.article>
    </Section>
  );
}
