"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { HydraScene } from "./scene";
import { HydraBackLink } from "./back-link";
import { hydra } from "@/lib/data";

export function HydraHero() {
  const reduce = useReducedMotion();
  const letters = hydra.name.split("");

  return (
    <section
      className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden pt-24 pb-16 noise"
      aria-labelledby="hydra-title"
    >
      {/* Grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]"
      />
      {/* Animated gradient mesh (always on — provides ambient glow) */}
      <div aria-hidden className="mesh-bg">
        <span />
      </div>
      <Container className="relative">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] gap-10 lg:gap-16 items-center">
          {/* Left — narrative */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <HydraBackLink
                href="/#journey"
                className="inline-flex items-center gap-2 font-mono-meta text-[11px] uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--accent)] transition-colors mb-10"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                Back to the journey
              </HydraBackLink>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] mb-10"
            >
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-[var(--accent)] opacity-60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
              </span>
              <span className="font-mono-meta text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
                {hydra.statusShort} · {hydra.period}
              </span>
            </motion.div>

            <h1
              id="hydra-title"
              aria-label={hydra.name}
              className="font-display leading-[0.9] tracking-tight text-foreground"
            >
              <span
                aria-hidden
                className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl"
              >
                {letters.map((ch, i) => (
                  <motion.span
                    key={i}
                    initial={
                      reduce
                        ? { opacity: 0 }
                        : { opacity: 0, y: 40, filter: "blur(14px)" }
                    }
                    animate={
                      reduce
                        ? { opacity: 1 }
                        : { opacity: 1, y: 0, filter: "blur(0px)" }
                    }
                    transition={{
                      duration: reduce ? 0.3 : 0.9,
                      delay: reduce ? 0 : 0.2 + i * 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="inline-block"
                  >
                    {ch}
                  </motion.span>
                ))}
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-xl text-lg md:text-xl font-display text-[var(--muted)] leading-snug"
            >
              {hydra.tagline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-8 flex flex-wrap gap-x-6 gap-y-3"
            >
              <div className="font-mono-meta text-[11px] uppercase tracking-[0.2em] text-[var(--subtle)]">
                <span>Origin</span>
                <span className="ml-2 text-[var(--accent)]">{hydra.origin}</span>
              </div>
              <div className="font-mono-meta text-[11px] uppercase tracking-[0.2em] text-[var(--subtle)]">
                <span>Type</span>
                <span className="ml-2 text-foreground">{hydra.codename}</span>
              </div>
              <div className="font-mono-meta text-[11px] uppercase tracking-[0.2em] text-[var(--subtle)]">
                <span>Status</span>
                <span className="ml-2 text-[var(--accent)]">{hydra.status}</span>
              </div>
            </motion.div>

            <motion.a
              href="#what"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.6 }}
              className="mt-12 inline-flex items-center gap-3 font-mono-meta text-xs uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--accent)] transition-colors group"
            >
              How it works
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] group-hover:border-[var(--accent)] group-hover:bg-[var(--accent-soft)] transition-all">
                <ArrowDown
                  className="h-3.5 w-3.5 group-hover:translate-y-0.5 transition-transform"
                  aria-hidden
                />
              </span>
            </motion.a>
          </div>

          {/* Right — 3D sculpture. No opacity animation — the 3D needs to be
              fully ready to show the moment the transition overlay lifts. */}
          <div className="relative aspect-square w-full max-w-[500px] mx-auto lg:mx-0">
            <HydraScene className="absolute inset-0" />
            <div
              aria-hidden
              className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-50"
              style={{
                background:
                  "radial-gradient(circle at center, var(--accent) 0%, transparent 60%)",
              }}
            />
          </div>
        </div>
      </Container>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 inset-x-0 h-32 bg-gradient-to-b from-transparent to-[var(--background)]"
      />
    </section>
  );
}
