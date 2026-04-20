"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  Cpu,
  GitBranch,
  Link2,
  Mail,
  Sparkles,
  Waypoints,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { profile } from "@/lib/data";
import { cn } from "@/lib/utils";

const ExperienceScene3D = dynamic(() => import("./scene-3d"), {
  ssr: false,
});

type ExperienceMode = "signal" | "systems" | "proof";

type ModeDef = {
  id: ExperienceMode;
  label: string;
  title: string;
  description: string;
  accent: string;
  secondary: string;
  glow: string;
  icon: React.ComponentType<{ className?: string }>;
};

const modes: ModeDef[] = [
  {
    id: "signal",
    label: "Signal",
    title: "Atmosphere first",
    description:
      "A calm, icy signal floating in view. Pointer movement bends the composition before scroll starts steering the camera.",
    accent: "#86e8ff",
    secondary: "#dff8ff",
    glow: "rgba(134, 232, 255, 0.32)",
    icon: Sparkles,
  },
  {
    id: "systems",
    label: "Systems",
    title: "Structured motion",
    description:
      "The sculpture reveals its lattice and rings. Motion feels engineered rather than decorative, with a little more mechanical precision.",
    accent: "#74f1c4",
    secondary: "#effff8",
    glow: "rgba(116, 241, 196, 0.28)",
    icon: Waypoints,
  },
  {
    id: "proof",
    label: "Proof",
    title: "Light enough to ship",
    description:
      "No giant asset payloads, no cinematic ego trip. Geometry, particles, and timing do the heavy lifting while the bundle stays disciplined.",
    accent: "#ffc27a",
    secondary: "#fff6eb",
    glow: "rgba(255, 194, 122, 0.24)",
    icon: Cpu,
  },
];

const acts = [
  {
    step: "01",
    title: "Approach",
    detail:
      "A single object lands quickly, then keeps just enough motion in reserve to feel alive under the cursor.",
  },
  {
    step: "02",
    title: "Orbit",
    detail:
      "Scroll opens the rings, widens the particle field, and shifts the camera so the page feels authored instead of merely animated.",
  },
  {
    step: "03",
    title: "Resolve",
    detail:
      "The final section calms the system back down. The scene tightens, the text gets clearer, and the route hands off to action.",
  },
];

const buildNotes = [
  "Three.js is confined to this route so the homepage stays lean.",
  "The scene uses procedural geometry and particles, not external 3D assets.",
  "Pointer and scroll are the main inputs; reduced-motion users get the calmer version.",
  "The atmosphere comes from timing, color, and composition rather than expensive post-processing.",
];

const contactLinks = [
  {
    label: "Email",
    href: `mailto:${profile.email}`,
    icon: Mail,
  },
  {
    label: "GitHub",
    href: profile.links.github,
    icon: GitBranch,
  },
  {
    label: "LinkedIn",
    href: profile.links.linkedin,
    icon: Link2,
  },
];

export function ExperiencePageClient() {
  const reduce = useReducedMotion();
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [mode, setMode] = React.useState<ExperienceMode>("signal");
  const [progress, setProgress] = React.useState(0);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  React.useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (value) => {
      setProgress(value);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const activeMode = modes.find((item) => item.id === mode) ?? modes[0];
  const activeAct = Math.min(acts.length - 1, Math.floor(progress * acts.length));

  const themeVars = {
    "--experience-accent": activeMode.accent,
    "--experience-secondary": activeMode.secondary,
    "--experience-glow": activeMode.glow,
  } as React.CSSProperties;

  return (
    <div
      ref={wrapperRef}
      style={themeVars}
      className="relative isolate overflow-x-clip bg-[#05070b] text-white"
    >
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 18%, var(--experience-glow) 0%, rgba(5, 7, 11, 0) 28%), radial-gradient(circle at 16% 22%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0) 28%), linear-gradient(180deg, #0a1119 0%, #05070b 48%, #070b11 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage:
              "radial-gradient(circle at center, rgba(0,0,0,0.9), transparent 82%)",
          }}
        />
        <div className="absolute inset-0 opacity-70">
          {!reduce ? <ExperienceScene3D mode={mode} progress={progress} /> : null}
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 top-16 z-[35] hidden md:block">
        <Container>
          <div className="h-px w-full bg-white/10">
            <div
              className="h-full bg-[var(--experience-accent)] transition-[width] duration-200"
              style={{ width: `${Math.max(6, progress * 100)}%` }}
            />
          </div>
        </Container>
      </div>

      <div className="relative z-10">
        <section className="relative flex min-h-[100svh] items-center border-b border-white/10 py-24 md:py-28">
          <Container>
            <div className="grid gap-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-end">
              <div className="max-w-3xl">
                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="font-mono-meta text-[11px] uppercase tracking-[0.28em] text-white/56"
                >
                  Cinematic detour / lightweight build
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mt-5 max-w-4xl font-display text-6xl leading-[0.9] tracking-tight text-white sm:text-7xl md:text-8xl"
                >
                  A calmer kind of spectacle.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.75,
                    delay: 0.18,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mt-6 max-w-2xl text-lg leading-relaxed text-white/72 md:text-xl"
                >
                  This route is meant to feel cinematic without becoming a heavy,
                  self-important WebGL project. It borrows the pleasing restraint
                  of sites like Igloo: one scene, a few strong interactions, and
                  enough breathing room for the work to read clearly.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.75,
                    delay: 0.28,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mt-8 inline-grid grid-cols-3 gap-2 rounded-[8px] border border-white/12 bg-white/[0.03] p-1 backdrop-blur"
                >
                  {modes.map((item) => {
                    const Icon = item.icon;
                    const active = item.id === mode;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setMode(item.id)}
                        className={cn(
                          "inline-flex min-w-[110px] items-center justify-center gap-2 rounded-[6px] px-4 py-3 text-sm transition-all",
                          active
                            ? "bg-white text-[#05070b]"
                            : "text-white/64 hover:text-white"
                        )}
                        style={
                          active
                            ? {
                                background: "var(--experience-secondary)",
                              }
                            : undefined
                        }
                        data-cursor="hover"
                        aria-pressed={active}
                      >
                        <Icon className="h-4 w-4" aria-hidden />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.75,
                    delay: 0.38,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"
                >
                  <a
                    href="#acts"
                    className="inline-flex items-center gap-3 font-mono-meta text-xs uppercase tracking-[0.22em] text-white/68 hover:text-white transition-colors"
                  >
                    Enter the route
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/14 bg-white/[0.02]">
                      <ArrowDown className="h-4 w-4" aria-hidden />
                    </span>
                  </a>
                  <span className="font-mono-meta text-[11px] uppercase tracking-[0.22em] text-white/42">
                    {activeMode.title} / {activeMode.description}
                  </span>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.22,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="lg:justify-self-end"
              >
                <div className="grid gap-4 text-sm text-white/66">
                  <div className="border-t border-white/12 pt-4">
                    <div className="font-mono-meta text-[10px] uppercase tracking-[0.24em] text-white/38">
                      Route scope
                    </div>
                    <p className="mt-2 leading-relaxed">
                      Purpose-built for a single page, so the rest of the
                      portfolio can stay fast, legible, and unmistakably yours.
                    </p>
                  </div>
                  <div className="border-t border-white/12 pt-4">
                    <div className="font-mono-meta text-[10px] uppercase tracking-[0.24em] text-white/38">
                      Inputs
                    </div>
                    <p className="mt-2 leading-relaxed">
                      Pointer parallax, scroll choreography, and mode switches.
                      Enough interactivity to feel present, not enough to get in
                      the way.
                    </p>
                  </div>
                  <div className="border-t border-white/12 pt-4">
                    <div className="font-mono-meta text-[10px] uppercase tracking-[0.24em] text-white/38">
                      Current mode
                    </div>
                    <p
                      className="mt-2 leading-relaxed"
                      style={{ color: "var(--experience-secondary)" }}
                    >
                      {activeMode.label} - {activeMode.title}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </Container>
        </section>

        <section
          id="acts"
          className="relative border-b border-white/10 py-24 md:py-32"
        >
          <Container>
            <div className="grid gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
              <div>
                <p className="font-mono-meta text-[11px] uppercase tracking-[0.26em] text-white/42">
                  Three acts
                </p>
                <h2 className="mt-4 max-w-md font-display text-4xl leading-[0.96] tracking-tight text-white md:text-6xl">
                  One scene, three emotional beats.
                </h2>
                <p className="mt-6 max-w-md text-base leading-relaxed text-white/68 md:text-lg">
                  The page keeps changing its posture as you move through it.
                  That is the whole trick: a single composition that keeps
                  finding new silhouettes.
                </p>
              </div>

              <ol className="border-t border-white/12">
                {acts.map((act, index) => {
                  const active = index === activeAct;
                  return (
                    <li
                      key={act.step}
                      className="grid gap-4 border-b border-white/12 py-7 md:grid-cols-[96px_minmax(0,1fr)] md:gap-8"
                    >
                      <div
                        className="font-mono-meta text-xs uppercase tracking-[0.26em] transition-colors"
                        style={{
                          color: active
                            ? "var(--experience-secondary)"
                            : "rgba(255,255,255,0.42)",
                        }}
                      >
                        {act.step}
                      </div>
                      <div>
                        <h3
                          className="text-2xl leading-tight tracking-tight transition-colors md:text-3xl"
                          style={{
                            color: active
                              ? "var(--experience-secondary)"
                              : "rgba(255,255,255,0.9)",
                          }}
                        >
                          {act.title}
                        </h3>
                        <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/62 md:text-lg">
                          {act.detail}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </Container>
        </section>

        <section
          id="craft"
          className="relative border-b border-white/10 py-24 md:py-32"
        >
          <Container>
            <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div>
                <p className="font-mono-meta text-[11px] uppercase tracking-[0.26em] text-white/42">
                  Build notes
                </p>
                <h2 className="mt-4 max-w-xl font-display text-4xl leading-[0.96] tracking-tight text-white md:text-6xl">
                  Pleasing, interactive, and still polite to the bundle.
                </h2>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-white/68 md:text-lg">
                  The point is not to cosplay a giant interactive studio build.
                  The point is to prove that your site can carry a more cinematic
                  moment without losing the clarity and restraint that already
                  make the portfolio work.
                </p>
                <div className="mt-10 border-l border-white/12 pl-6">
                  <p className="font-mono-meta text-[11px] uppercase tracking-[0.22em] text-white/42">
                    Current read
                  </p>
                  <p
                    className="mt-3 max-w-lg text-xl leading-relaxed"
                    style={{ color: "var(--experience-secondary)" }}
                  >
                    {activeMode.description}
                  </p>
                </div>
              </div>

              <div className="border-t border-white/12">
                {buildNotes.map((note, index) => (
                  <div
                    key={note}
                    className="grid gap-4 border-b border-white/12 py-6 md:grid-cols-[40px_minmax(0,1fr)]"
                  >
                    <div className="font-mono-meta text-xs uppercase tracking-[0.22em] text-white/34">
                      0{index + 1}
                    </div>
                    <p className="text-base leading-relaxed text-white/68 md:text-lg">
                      {note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section id="connect" className="relative py-24 md:min-h-[85svh] md:py-32">
          <Container>
            <div className="grid gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
              <div>
                <p className="font-mono-meta text-[11px] uppercase tracking-[0.26em] text-white/42">
                  Keep going
                </p>
                <h2 className="mt-4 max-w-3xl font-display text-4xl leading-[0.96] tracking-tight text-white md:text-6xl">
                  The route is live. Now it can grow sharper.
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/68 md:text-lg">
                  This first pass is intentionally disciplined: a cinematic mood,
                  real interaction, and a scene that earns its space. From here
                  we can layer in stronger storytelling beats, project-specific
                  content, or tighter scene choreography without turning it into
                  a maintenance monster.
                </p>

                <div className="mt-10 flex flex-wrap gap-3">
                  {contactLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          item.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="inline-flex h-11 items-center gap-2 rounded-full border border-white/14 px-5 text-sm text-white/82 transition-colors hover:text-white"
                        data-cursor="hover"
                      >
                        <Icon className="h-4 w-4" aria-hidden />
                        <span>{item.label}</span>
                        <ArrowUpRight className="h-4 w-4" aria-hidden />
                      </a>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-5 text-sm text-white/62">
                <div className="border-t border-white/12 pt-5">
                  <div className="font-mono-meta text-[10px] uppercase tracking-[0.24em] text-white/38">
                    Personal angle
                  </div>
                  <p className="mt-3 leading-relaxed">
                    The page still sounds like you: measured, technical, and a
                    little playful. It just speaks with more lighting.
                  </p>
                </div>
                <div className="border-t border-white/12 pt-5">
                  <div className="font-mono-meta text-[10px] uppercase tracking-[0.24em] text-white/38">
                    Next move
                  </div>
                  <p className="mt-3 leading-relaxed">
                    Tie the mode states to real portfolio projects, or let this
                    route evolve into a small lab for motion-driven case studies.
                  </p>
                </div>
                <div className="border-t border-white/12 pt-5">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 font-mono-meta text-xs uppercase tracking-[0.22em] text-white/64 transition-colors hover:text-white"
                  >
                    Back to the main flow
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
}
