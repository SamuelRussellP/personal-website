"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  type Variants,
} from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  ChevronDown,
  GitBranch,
  Link2,
  Mail,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { profile } from "@/lib/data";

const ExperienceScene3D = dynamic(() => import("./scene-3d"), {
  ssr: false,
});

type Chapter = {
  id: string;
  number: string;
  kicker: string;
  title: string;
  narrative: string;
  meta: { label: string; value: string }[];
  palette: { accent: string; secondary: string; glow: string };
  cta?: { label: string; href: string };
};

const chapters: Chapter[] = [
  {
    id: "origin",
    number: "01",
    kicker: "Foundation",
    title: "Jakarta-born. Semarang-raised. Malaysia-trained.",
    narrative:
      "Xiamen University Malaysia. Four years on a 50% merit scholarship, held all the way through. Graduated with a Springer-published thesis on lightweight authenticated encryption, then five months at BliBli writing my first real automation framework.",
    meta: [
      { label: "2018 — 2022", value: "B.Eng. Software Engineering (Honours)" },
      { label: "Sepang, Malaysia", value: "Xiamen University Malaysia" },
      { label: "2022", value: "SDET Intern · BliBli.com" },
    ],
    palette: {
      accent: "#86e8ff",
      secondary: "#dff8ff",
      glow: "rgba(134, 232, 255, 0.32)",
    },
  },
  {
    id: "scale",
    number: "02",
    kicker: "Scale",
    title: "Millions of transactions a day.",
    narrative:
      "Fourteen months at Shopee on the ShopeePay Payment Processing Team. Backend, APIs, databases — the machinery behind Indonesia's largest e-commerce flow. Led QA for the Java → Go callback rewrite, real-time accounting integration, and a full GCP → SPACE cloud migration.",
    meta: [
      { label: "2022 — 2023", value: "Software QA Engineer" },
      { label: "Sea Labs · Shopee", value: "Jakarta, Indonesia" },
      {
        label: "Three projects",
        value: "Bank integration · Accounting · Cloud migration",
      },
    ],
    palette: {
      accent: "#74f1c4",
      secondary: "#effff8",
      glow: "rgba(116, 241, 196, 0.28)",
    },
  },
  {
    id: "lead",
    number: "03",
    kicker: "Lead",
    title: "Berlin, remote. Quality at scale.",
    narrative:
      "Started as a freelance moonlight across time zones. Converted to full-time. Promoted to Team Lead. Now responsible for automation strategy, quality metrics, and the practice across multiple products — coordinating dev, product, and QA across continents.",
    meta: [
      { label: "2023 — Present", value: "Software QA Team Lead" },
      { label: "Paul's Job", value: "Berlin, Germany · Remote" },
      { label: "Owning", value: "Strategy · Metrics · Mentorship" },
    ],
    palette: {
      accent: "#ffc27a",
      secondary: "#fff6eb",
      glow: "rgba(255, 194, 122, 0.24)",
    },
  },
  {
    id: "agents",
    number: "04",
    kicker: "The next act",
    title: "Hydra. Many heads. One verdict.",
    narrative:
      "I proposed it. The team I lead built it. A Jira-driven QA agent on Claude and Codex — our move in the AI-agent era reshaping the craft. Live on staging, growing every sprint, returning time to the work only humans are uniquely good at.",
    meta: [
      { label: "2026 — ongoing", value: "Hydra · QA Validation Agent" },
      { label: "Status", value: "Live on staging" },
      { label: "Built on", value: "Claude · Codex · Claude Code" },
    ],
    palette: {
      accent: "#ffb3ec",
      secondary: "#fff0fa",
      glow: "rgba(255, 179, 236, 0.28)",
    },
    cta: { label: "Read the Hydra case study", href: "/hydra" },
  },
];

const contactLinks = [
  { label: "Email", href: `mailto:${profile.email}`, icon: Mail },
  { label: "GitHub", href: profile.links.github, icon: GitBranch },
  { label: "LinkedIn", href: profile.links.linkedin, icon: Link2 },
];

const FILM_GRAIN_URL =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='280' height='280'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>";

const wordContainer: Variants = {
  hidden: {},
  visible: (custom: { stagger: number; delay: number }) => ({
    transition: {
      staggerChildren: custom.stagger,
      delayChildren: custom.delay,
    },
  }),
};

const wordItemTitle: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

const wordItemBody: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

type RevealTag = "h1" | "h2" | "p" | "span" | "div";

function RevealWords({
  text,
  as = "span",
  trigger = "mount",
  stagger,
  delay = 0,
  intensity = "title",
  className,
  style,
}: {
  text: string;
  as?: RevealTag;
  trigger?: "mount" | "inView";
  stagger?: number;
  delay?: number;
  intensity?: "title" | "body";
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return React.createElement(as, { className, style }, text);
  }

  const effectiveStagger =
    stagger ?? (intensity === "title" ? 0.045 : 0.018);
  const itemVariants =
    intensity === "title" ? wordItemTitle : wordItemBody;
  const words = text.split(/\s+/).filter(Boolean);
  const Tag = {
    h1: motion.h1,
    h2: motion.h2,
    p: motion.p,
    span: motion.span,
    div: motion.div,
  }[as];

  const triggerProps =
    trigger === "inView"
      ? {
          whileInView: "visible" as const,
          viewport: { once: true, margin: "-20%" },
        }
      : { animate: "visible" as const };

  return (
    <Tag
      className={className}
      style={style}
      variants={wordContainer}
      initial="hidden"
      custom={{ stagger: effectiveStagger, delay }}
      {...triggerProps}
    >
      {words.map((word, index) => (
        <React.Fragment key={`${word}-${index}`}>
          <motion.span variants={itemVariants} className="inline-block">
            {word}
          </motion.span>
          {index < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </Tag>
  );
}

export function ExperiencePageClient() {
  const reduce = useReducedMotion();
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [progress, setProgress] = React.useState(0);
  const [pulseKey, setPulseKey] = React.useState(0);
  const lastProgressRef = React.useRef(0);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  React.useEffect(() => {
    const boundaries = [0.25, 0.5, 0.75];
    const unsubscribe = scrollYProgress.on("change", (value) => {
      setProgress(value);
      const prev = lastProgressRef.current;
      for (const b of boundaries) {
        if ((prev < b && value >= b) || (prev > b && value <= b)) {
          setPulseKey((k) => k + 1);
          break;
        }
      }
      lastProgressRef.current = value;
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // Map progress → active chapter. Hero occupies the first stretch,
  // then each chapter gets an equal slice of the scroll.
  const heroEnd = 0.08;
  const closeStart = 0.94;
  const chapterSpan = (closeStart - heroEnd) / chapters.length;
  const activeIndex = React.useMemo(() => {
    if (progress < heroEnd) return -1;
    if (progress >= closeStart) return chapters.length - 1;
    return Math.min(
      chapters.length - 1,
      Math.floor((progress - heroEnd) / chapterSpan)
    );
  }, [progress, heroEnd, closeStart, chapterSpan]);

  const activePalette =
    activeIndex >= 0 ? chapters[activeIndex].palette : chapters[0].palette;

  const activeSectionId = React.useMemo(() => {
    if (progress < heroEnd) return "prologue";
    if (progress >= closeStart) return "close";
    return chapters[Math.min(chapters.length - 1, activeIndex)].id;
  }, [progress, activeIndex, heroEnd, closeStart]);

  const themeVars = {
    "--experience-accent": activePalette.accent,
    "--experience-secondary": activePalette.secondary,
    "--experience-glow": activePalette.glow,
  } as React.CSSProperties;

  // Arrow key navigation — jump between sections.
  const activeSectionIdRef = React.useRef(activeSectionId);
  React.useEffect(() => {
    activeSectionIdRef.current = activeSectionId;
  }, [activeSectionId]);

  React.useEffect(() => {
    const sectionIds = [
      "prologue",
      ...chapters.map((c) => c.id),
      "close",
    ];
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        return;
      }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
      const currentIdx = sectionIds.indexOf(
        activeSectionIdRef.current || "prologue"
      );
      const delta = e.key === "ArrowDown" ? 1 : -1;
      const nextIdx = Math.max(
        0,
        Math.min(sectionIds.length - 1, currentIdx + delta)
      );
      if (nextIdx === currentIdx) return;
      const el = document.getElementById(sectionIds[nextIdx]);
      if (!el) return;
      e.preventDefault();
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.scrollTo(el, { offset: -80 });
      } else {
        el.scrollIntoView({ behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={themeVars}
      className="relative isolate overflow-x-clip bg-[#05070b] text-white"
    >
      {/* Pinned atmosphere + 3D scene */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 transition-[background] duration-700"
          style={{
            background:
              "radial-gradient(circle at 50% 18%, var(--experience-glow) 0%, rgba(5, 7, 11, 0) 32%), radial-gradient(circle at 16% 22%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0) 28%), linear-gradient(180deg, #0a1119 0%, #05070b 48%, #070b11 100%)",
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
        <div className="absolute inset-0 opacity-80">
          {!reduce ? (
            <ExperienceScene3D progress={progress} pulseKey={pulseKey} />
          ) : null}
        </div>
        {/* Vignette for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(5,7,11,0) 40%, rgba(5,7,11,0.55) 100%)",
          }}
        />
      </div>

      {/* Top-left chapter indicator */}
      <div className="pointer-events-none fixed inset-x-0 top-16 z-[35] hidden md:block">
        <Container>
          <div className="h-px w-full bg-white/10">
            <div
              className="h-full bg-[var(--experience-accent)] transition-[width] duration-200"
              style={{ width: `${Math.max(4, progress * 100)}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between font-mono-meta text-[10px] uppercase tracking-[0.28em] text-white/40">
            <span>
              {activeIndex >= 0
                ? `${chapters[activeIndex].number} · ${chapters[activeIndex].kicker}`
                : "Prologue"}
            </span>
            <span>{String(Math.round(progress * 100)).padStart(3, "0")}</span>
          </div>
        </Container>
      </div>

      {/* Film grain overlay — subtle, fixed, casts on everything */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[38]"
        style={{
          backgroundImage: `url("${FILM_GRAIN_URL}")`,
          backgroundSize: "280px 280px",
          opacity: 0.07,
          mixBlendMode: "overlay",
        }}
      />

      {/* Scroll hint — visible until the user moves past the hero */}
      {!reduce ? (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed bottom-6 left-1/2 z-30 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: progress > 0.015 ? 0 : 0.72 }}
          transition={{
            duration: progress > 0.015 ? 0.4 : 0.6,
            delay: progress > 0.015 ? 0 : 1.4,
          }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex flex-col items-center gap-2"
          >
            <span className="font-mono-meta text-[10px] uppercase tracking-[0.28em] text-white/60">
              Scroll
            </span>
            <ChevronDown className="h-4 w-4 text-white/50" aria-hidden />
          </motion.div>
        </motion.div>
      ) : null}

      {/* Right-edge chapter navigation */}
      <nav
        aria-label="Chapter navigation"
        className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 md:block"
      >
        <ul className="flex flex-col gap-5">
          {[
            { id: "prologue", label: "Prologue" },
            ...chapters.map((c) => ({
              id: c.id,
              label: `${c.number} · ${c.kicker}`,
            })),
            { id: "close", label: "End credits" },
          ].map((section) => {
            const isActive = section.id === activeSectionId;
            return (
              <li key={section.id} className="group relative">
                <a
                  href={`#${section.id}`}
                  aria-label={`Jump to ${section.label}`}
                  aria-current={isActive ? "true" : undefined}
                  data-cursor="hover"
                  className="pointer-events-auto block h-2.5 w-2.5 rounded-full border transition-all duration-300"
                  style={{
                    borderColor: isActive
                      ? "var(--experience-accent)"
                      : "rgba(255,255,255,0.24)",
                    backgroundColor: isActive
                      ? "var(--experience-accent)"
                      : "transparent",
                    transform: isActive ? "scale(1.4)" : "scale(1)",
                  }}
                />
                <span
                  className="pointer-events-none absolute right-full top-1/2 mr-4 -translate-y-1/2 whitespace-nowrap rounded-sm border border-white/10 bg-black/70 px-3 py-1.5 font-mono-meta text-[10px] uppercase tracking-[0.22em] text-white/80 opacity-0 backdrop-blur transition-opacity duration-200 group-hover:opacity-100"
                >
                  {section.label}
                </span>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="relative z-10">
        {/* Prologue / hero */}
        <section
          id="prologue"
          className="relative flex min-h-[100svh] items-center py-24 md:py-28"
        >
          <Container>
            <div className="max-w-4xl">
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="font-mono-meta text-[11px] uppercase tracking-[0.28em] text-white/56"
              >
                Samuel Russell Prajasantosa · Career, in four chapters
              </motion.p>

              <h1 className="mt-6 font-display text-6xl leading-[0.9] tracking-tight text-white sm:text-7xl md:text-[8.5rem] md:leading-[0.86]">
                <RevealWords
                  text="From Jakarta to Berlin,"
                  as="span"
                  trigger="mount"
                  delay={0.18}
                  className="block"
                />
                <RevealWords
                  text="in four acts."
                  as="span"
                  trigger="mount"
                  delay={0.65}
                  className="block transition-colors duration-700"
                  style={{ color: "var(--experience-secondary)" }}
                />
              </h1>

              <RevealWords
                as="p"
                trigger="mount"
                intensity="body"
                delay={1.1}
                text="Software Quality Team Lead. Jakarta-born, Malaysia-trained, now shipping remote with Berlin. This is the work so far — scroll to move through it."
                className="mt-8 max-w-2xl text-lg leading-relaxed text-white/72 md:text-xl"
              />

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.36,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center"
              >
                <a
                  href="#origin"
                  className="inline-flex items-center gap-3 font-mono-meta text-xs uppercase tracking-[0.22em] text-white/68 transition-colors hover:text-white"
                  data-cursor="hover"
                >
                  Begin
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/14 bg-white/[0.02]">
                    <ArrowDown className="h-4 w-4" aria-hidden />
                  </span>
                </a>
                <span className="font-mono-meta text-[11px] uppercase tracking-[0.22em] text-white/42">
                  Four chapters · Roughly three minutes
                </span>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* Chapters */}
        {chapters.map((chapter, index) => {
          const isActive = index === activeIndex;
          return (
            <section
              key={chapter.id}
              id={chapter.id}
              className="relative min-h-[170svh] py-24 md:py-32"
            >
              <Container>
                <div className="relative">
                  {/* Sticky header: kicker + title with giant ghosted numeral backdrop */}
                  <div className="sticky top-[16vh] z-20">
                    <div className="relative">
                      {/* Ghost numeral — outlined, overflows the column */}
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-y-0 right-[-6%] flex items-center justify-end select-none lg:right-[-8%]"
                      >
                        <span
                          className="font-display block leading-[0.8]"
                          style={{
                            fontSize: "clamp(7rem, 32vw, 26rem)",
                            WebkitTextStroke: isActive
                              ? "1.5px rgba(255,255,255,0.38)"
                              : "1px rgba(255,255,255,0.12)",
                            color: "transparent",
                            opacity: isActive ? 0.9 : 0.32,
                            transition:
                              "opacity 700ms ease, -webkit-text-stroke 700ms ease",
                          }}
                        >
                          {chapter.number}
                        </span>
                      </div>

                      {/* Kicker + title content */}
                      <div className="relative max-w-3xl">
                        <div className="flex items-baseline gap-6">
                          <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-25%" }}
                            transition={{
                              duration: 0.8,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className="font-mono-meta text-[10px] uppercase tracking-[0.32em] transition-colors"
                            style={{
                              color: isActive
                                ? "var(--experience-secondary)"
                                : "rgba(255,255,255,0.44)",
                            }}
                          >
                            Chapter {chapter.number}
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-25%" }}
                            transition={{
                              duration: 0.8,
                              delay: 0.06,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className="font-mono-meta text-[11px] uppercase tracking-[0.26em] text-white/62"
                          >
                            {chapter.kicker}
                          </motion.div>
                        </div>

                        <RevealWords
                          text={chapter.title}
                          as="h2"
                          trigger="inView"
                          delay={0.12}
                          className="mt-6 font-display text-5xl leading-[0.94] tracking-tight text-white sm:text-6xl md:text-[5.5rem] md:leading-[0.92]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Narrative + meta below — scrolls past the sticky title */}
                  <div className="relative mt-[28vh] md:mt-[44vh] grid gap-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)] lg:items-start">
                    <div className="max-w-3xl">
                      <RevealWords
                        as="p"
                        trigger="inView"
                        intensity="body"
                        delay={0.08}
                        text={chapter.narrative}
                        className="text-lg leading-relaxed text-white/72 md:text-xl"
                      />

                      {chapter.cta ? (
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-20%" }}
                          transition={{
                            duration: 0.8,
                            delay: 0.32,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="mt-10"
                        >
                          <Link
                            href={chapter.cta.href}
                            className="inline-flex items-center gap-3 rounded-full border border-white/16 bg-white/[0.04] px-6 py-3 font-mono-meta text-[11px] uppercase tracking-[0.22em] text-white/82 transition-colors hover:border-white/40 hover:text-white"
                            data-cursor="hover"
                            style={{
                              borderColor: isActive
                                ? "var(--experience-accent)"
                                : undefined,
                            }}
                          >
                            {chapter.cta.label}
                            <ArrowUpRight className="h-4 w-4" aria-hidden />
                          </Link>
                        </motion.div>
                      ) : null}
                    </div>

                    <motion.div
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-20%" }}
                      transition={{
                        duration: 0.9,
                        delay: 0.28,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="lg:justify-self-end"
                    >
                      <div className="grid gap-5 text-sm text-white/66">
                        {chapter.meta.map((item) => (
                          <div
                            key={item.label}
                            className="border-t border-white/12 pt-4"
                          >
                            <div className="font-mono-meta text-[10px] uppercase tracking-[0.24em] text-white/38">
                              {item.label}
                            </div>
                            <p className="mt-2 leading-relaxed text-white/80">
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </Container>
            </section>
          );
        })}

        {/* Close */}
        <section
          id="close"
          className="relative flex min-h-[90svh] items-center py-24 md:py-32"
        >
          <Container>
            <div className="grid gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20%" }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="font-mono-meta text-[11px] uppercase tracking-[0.28em] text-white/42"
                >
                  End credits
                </motion.p>

                <RevealWords
                  text="Still writing. Let's talk."
                  as="h2"
                  trigger="inView"
                  delay={0.1}
                  className="mt-5 max-w-3xl font-display text-4xl leading-[0.96] tracking-tight text-white md:text-6xl"
                />

                <RevealWords
                  as="p"
                  trigger="inView"
                  intensity="body"
                  delay={0.18}
                  text="Four chapters in, the story is still being written. If anything here made you curious — about Hydra, AI-native QA, or working together — the door is open."
                  className="mt-6 max-w-2xl text-base leading-relaxed text-white/68 md:text-lg"
                />

                <div className="mt-10 flex flex-wrap gap-3">
                  {contactLinks.map((item) => {
                    const Icon = item.icon;
                    const external = item.href.startsWith("http");
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
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
                    Now
                  </div>
                  <p className="mt-3 leading-relaxed text-white/80">
                    {profile.currentRole} at {profile.currentCompany} —
                    remote from {profile.currentLocationShort}.
                  </p>
                </div>
                <div className="border-t border-white/12 pt-5">
                  <div className="font-mono-meta text-[10px] uppercase tracking-[0.24em] text-white/38">
                    Case study
                  </div>
                  <Link
                    href="/hydra"
                    className="mt-3 inline-flex items-center gap-2 leading-relaxed text-white/80 transition-colors hover:text-white"
                    data-cursor="hover"
                  >
                    The Hydra deep dive
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
                <div className="border-t border-white/12 pt-5">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 font-mono-meta text-xs uppercase tracking-[0.22em] text-white/64 transition-colors hover:text-white"
                    data-cursor="hover"
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
