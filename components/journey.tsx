"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import {
  GraduationCap,
  Sparkles,
  Briefcase,
  Users,
  MapPin,
  Calendar,
} from "lucide-react";
import { Container } from "./ui/container";
import { Section } from "./ui/section";
import { HydraLink } from "./hydra/link";
import { journey, type JourneyStop, type JourneyKind } from "@/lib/data";
import { cn } from "@/lib/utils";

const kindMeta: Record<
  JourneyKind,
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  education: { icon: GraduationCap, label: "Education" },
  internship: { icon: Sparkles, label: "Internship" },
  engineer: { icon: Briefcase, label: "Engineer" },
  lead: { icon: Users, label: "Lead" },
};

function formatPeriod(start: string, end: string) {
  const fmt = (s: string) => {
    if (s === "Present") return "Present";
    const [y, m] = s.split("-");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[parseInt(m, 10) - 1]} ${y}`;
  };
  return `${fmt(start)} — ${fmt(end)}`;
}

function durationMonths(start: string, end: string) {
  const parse = (s: string) => {
    if (s === "Present") return new Date();
    const [y, m] = s.split("-").map(Number);
    return new Date(y, m - 1, 1);
  };
  const a = parse(start);
  const b = parse(end);
  const months =
    (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (months < 12) return `${months} mo`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m ? `${y}y ${m}mo` : `${y}y`;
}

/* -----------------------------------------------------------
 * ChapterPanel — sticky on desktop, shows current chapter info
 * ----------------------------------------------------------- */
function ChapterPanel({
  activeIndex,
  total,
  progress,
}: {
  activeIndex: number;
  total: number;
  progress: number; // 0..1
}) {
  const active = journey[activeIndex];
  return (
    <aside
      aria-hidden
      className="hidden lg:flex sticky top-24 h-[calc(100dvh-8rem)] flex-col justify-between pointer-events-none"
    >
      <div>
        <div className="font-mono-meta text-[10px] uppercase tracking-[0.22em] text-[var(--subtle)] mb-3">
          Chapter {String(activeIndex + 1).padStart(2, "0")}
          <span className="text-[var(--subtle)] mx-1.5">/</span>
          {String(total).padStart(2, "0")}
        </div>

        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          <div className="font-display text-4xl leading-[1.05] text-foreground">
            {active.company}
          </div>
          <div className="text-sm text-[var(--muted)]">{active.role}</div>
          <div className="font-mono-meta text-xs text-[var(--subtle)]">
            {formatPeriod(active.start, active.end)}
          </div>
        </motion.div>

        {/* progress bar */}
        <div className="mt-10 h-px w-full bg-[var(--border)] relative">
          <motion.div
            className="absolute inset-y-0 left-0 bg-[var(--accent)]"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="mt-2 font-mono-meta text-[10px] tabular-nums text-[var(--subtle)]">
          {Math.round(progress * 100)}% through the journey
        </div>
      </div>

      {/* mini timeline of all stops */}
      <ul className="space-y-2">
        {journey.map((s, i) => {
          const Icon = kindMeta[s.kind].icon;
          return (
            <li
              key={s.id}
              className={cn(
                "flex items-center gap-3 transition-all duration-300",
                i === activeIndex
                  ? "text-foreground translate-x-0"
                  : i < activeIndex
                    ? "text-[var(--muted)] -translate-x-0.5"
                    : "text-[var(--subtle)]"
              )}
            >
              <Icon
                className={cn(
                  "h-3.5 w-3.5 transition-colors",
                  i === activeIndex
                    ? "text-[var(--accent)]"
                    : i < activeIndex
                      ? "text-[var(--muted)]"
                      : "text-[var(--subtle)]"
                )}
                aria-hidden
              />
              <span className="font-mono-meta text-[11px] uppercase tracking-[0.14em] truncate">
                {s.company}
              </span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

/* -----------------------------------------------------------
 * MobileChapterStrip — below-lg counterpart of ChapterPanel.
 * A slim fixed bar under the nav showing the current chapter,
 * company, and progress through the timeline. Only mounts while
 * the user is reading inside the Journey section.
 * ----------------------------------------------------------- */
function MobileChapterStrip({
  activeIndex,
  total,
  progress,
  visible,
}: {
  activeIndex: number;
  total: number;
  progress: number;
  visible: boolean;
}) {
  const active = journey[activeIndex];
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="mobile-chapter-strip"
          aria-hidden
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -24, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="lg:hidden fixed top-16 inset-x-0 z-30 pointer-events-none"
        >
          <div className="backdrop-blur-xl bg-[color-mix(in_oklab,var(--background)_85%,transparent)] border-b border-[var(--border)]">
            <Container className="flex items-center gap-3 py-2.5">
              <span className="font-mono-meta text-[10px] uppercase tracking-[0.22em] text-[var(--subtle)] tabular-nums">
                {String(activeIndex + 1).padStart(2, "0")}
                <span className="mx-1">/</span>
                {String(total).padStart(2, "0")}
              </span>
              <span className="font-mono-meta text-[10px] uppercase tracking-[0.16em] text-foreground truncate flex-1 min-w-0">
                {active.company}
              </span>
              <span className="font-mono-meta text-[10px] tabular-nums text-[var(--accent)]">
                {Math.round(progress * 100)}%
              </span>
            </Container>
            <div className="relative h-px w-full bg-[var(--border)]">
              <motion.div
                className="absolute inset-y-0 left-0 bg-[var(--accent)]"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -----------------------------------------------------------
 * StopCard
 * ----------------------------------------------------------- */
const StopCard = React.forwardRef<
  HTMLLIElement,
  { stop: JourneyStop; index: number; isActive: boolean }
>(({ stop, index, isActive }, ref) => {
  const Icon = kindMeta[stop.kind].icon;

  return (
    <motion.li
      ref={ref}
      id={`journey-${stop.id}`}
      data-index={index}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative scroll-mt-24"
    >
      <div className="md:grid md:grid-cols-[auto_1fr] md:gap-8 items-start">
        {/* Dot + meta column */}
        <div className="flex md:flex-col items-center md:items-start md:w-36 gap-3 md:gap-1.5 mb-3 md:mb-0">
          <span
            aria-hidden
            className={cn(
              "relative flex h-7 w-7 items-center justify-center rounded-full border bg-background transition-all duration-300 z-10 shrink-0",
              isActive
                ? "border-[var(--accent)] scale-110"
                : "border-[var(--border)]"
            )}
          >
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-colors",
                isActive ? "bg-[var(--accent)]" : "bg-[var(--subtle)]"
              )}
            />
            {isActive && (
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    "0 0 0 0 color-mix(in oklab, var(--accent) 50%, transparent)",
                    "0 0 0 12px color-mix(in oklab, var(--accent) 0%, transparent)",
                  ],
                }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            )}
          </span>
          <div className="md:mt-2">
            <div className="font-mono-meta text-[11px] uppercase tracking-[0.18em] text-[var(--accent)] flex items-center gap-1.5">
              <Icon className="h-3 w-3" aria-hidden />
              {kindMeta[stop.kind].label}
            </div>
            <div className="font-mono-meta text-[11px] text-[var(--muted)] mt-1">
              {formatPeriod(stop.start, stop.end)}
            </div>
            <div className="font-mono-meta text-[11px] text-[var(--subtle)]">
              {durationMonths(stop.start, stop.end)}
            </div>
          </div>
        </div>

        {/* Card */}
        <article
          className={cn(
            "card p-6 md:p-8 transition-all duration-500",
            isActive && "border-[var(--accent)] glow-accent"
          )}
        >
          <h3 className="font-display text-2xl md:text-3xl text-foreground leading-tight">
            {stop.role}
          </h3>
          <div className="flex items-center gap-3 flex-wrap text-sm text-[var(--muted)] mb-5 mt-1">
            <span className="text-foreground font-medium">{stop.company}</span>
            <span className="text-[var(--subtle)]">·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" aria-hidden />
              {stop.location}
            </span>
            {stop.mode && (
              <>
                <span className="text-[var(--subtle)]">·</span>
                <span>{stop.mode}</span>
              </>
            )}
          </div>

          <p className="font-display text-xl md:text-2xl text-foreground leading-snug mb-4">
            {stop.headline}
          </p>
          <p className="text-[var(--muted)] leading-relaxed mb-6">
            {stop.narrative}
          </p>

          {stop.highlights.length > 0 && (
            <ul className="space-y-2.5 mb-6">
              {stop.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-sm text-[var(--muted)]">
                  <span
                    aria-hidden
                    className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-[var(--accent)]"
                  />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}

          {stop.projects && stop.projects.length > 0 && (
            <details className="group mb-6 border-t border-[var(--border)] pt-5">
              <summary className="cursor-pointer font-mono-meta text-xs uppercase tracking-[0.18em] text-[var(--muted)] hover:text-[var(--accent)] transition-colors list-none flex items-center justify-between">
                <span>Projects ({stop.projects.length})</span>
                <span
                  aria-hidden
                  className="transition-transform group-open:rotate-45 text-lg leading-none"
                >
                  +
                </span>
              </summary>
              <div className="mt-4 space-y-4">
                {stop.projects.map((p) => (
                  <div
                    key={p.name}
                    className="border-l-2 border-[var(--accent)] pl-4"
                  >
                    <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
                      <h4 className="text-sm font-semibold text-foreground">
                        {p.name}
                      </h4>
                      <span className="font-mono-meta text-[11px] text-[var(--subtle)] inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" aria-hidden />
                        {p.period}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">
                      {p.summary}
                    </p>
                    {p.href && (
                      <HydraLink
                        href={p.href}
                        className="inline-flex items-center gap-1.5 mt-3 font-mono-meta text-[11px] uppercase tracking-[0.18em] text-[var(--accent)] hover:text-[var(--accent-strong)] transition-colors group"
                      >
                        {p.cta ?? "Read more"}
                        <span
                          aria-hidden
                          className="inline-block transition-transform group-hover:translate-x-0.5"
                        >
                          →
                        </span>
                      </HydraLink>
                    )}
                  </div>
                ))}
              </div>
            </details>
          )}

          <div className="flex flex-wrap gap-1.5">
            {stop.stack.map((t) => (
              <span
                key={t}
                className="font-mono-meta text-[11px] text-[var(--muted)] border border-[var(--border)] rounded-full px-2.5 py-1 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
              >
                {t}
              </span>
            ))}
          </div>
        </article>
      </div>
    </motion.li>
  );
});
StopCard.displayName = "StopCard";

/* -----------------------------------------------------------
 * Journey — main
 * ----------------------------------------------------------- */
export function Journey() {
  const reduce = useReducedMotion();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<(HTMLLIElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = React.useState(0);

  // Section-scoped progress for the rail above the timeline
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.5,
  });

  // Tighter progress clamped to just the timeline traversal
  const { scrollYProgress: listProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.5", "end 0.6"],
  });
  const [progress, setProgress] = React.useState(0);
  useMotionValueEvent(listProgress, "change", (v) => {
    setProgress(Math.max(0, Math.min(1, v)));
  });

  // Track which stop is closest to the viewport midline
  React.useEffect(() => {
    if (reduce) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const idx = Number(
            (visible[0].target as HTMLElement).dataset.index
          );
          if (!Number.isNaN(idx)) setActiveIndex(idx);
        }
      },
      {
        rootMargin: "-40% 0px -40% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [reduce]);

  // Top scroll indicator bar (thin line above the timeline that fills)
  const fillWidth = useTransform(smooth, [0, 1], ["0%", "100%"]);

  // Mobile chapter strip visibility — show while the reading zone of the
  // timeline is on screen. Margin shrinks the trigger area so the bar only
  // appears once the user has actually scrolled into the content.
  const stripInView = useInView(containerRef, {
    margin: "-15% 0px -40% 0px",
  });

  return (
    <Section
      id="journey"
      eyebrow="The Journey"
      title="Six chapters across three countries."
      lede="From Semarang to Sepang to Jakarta — with Berlin now on the org chart. Each stop taught me something different about building software that actually works in production."
    >
      {/* Thin section-scoped progress rail */}
      <div className="relative mb-12 h-px w-full bg-[var(--border)]">
        <motion.div
          className="absolute inset-y-0 left-0 bg-[var(--accent)]"
          style={{ width: fillWidth }}
        />
      </div>

      <MobileChapterStrip
        activeIndex={activeIndex}
        total={journey.length}
        progress={progress}
        visible={stripInView}
      />

      <div
        ref={containerRef}
        className="relative grid lg:grid-cols-[16rem_1fr] gap-12 lg:gap-16"
      >
        <ChapterPanel
          activeIndex={activeIndex}
          total={journey.length}
          progress={progress}
        />

        <ol className="space-y-16 md:space-y-24 min-w-0">
          {journey.map((stop, i) => (
            <StopCard
              key={stop.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              stop={stop}
              index={i}
              isActive={i === activeIndex}
            />
          ))}
        </ol>
      </div>
    </Section>
  );
}
