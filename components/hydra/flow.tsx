"use client";

import * as React from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Section } from "@/components/ui/section";
import { hydra } from "@/lib/data";
import { cn } from "@/lib/utils";

export function HydraFlow() {
  const listRef = React.useRef<HTMLOListElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const itemRefs = React.useRef<(HTMLLIElement | null)[]>([]);

  // Overall progress through the flow for the accent line fill
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 0.8", "end 0.3"],
  });
  const lineFill = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });
  const lineHeight = useTransform(lineFill, [0, 1], ["0%", "100%"]);

  React.useEffect(() => {
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
        rootMargin: "-35% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <Section
      id="flow"
      eyebrow="How it works"
      title="From a ticket key to a reviewed result, in six steps."
      lede="Every run starts with a Jira ticket and ends with a structured report. In between, Hydra handles the orchestration — so humans only show up for the parts that need judgment."
    >
      <ol
        ref={listRef}
        className="relative space-y-4 md:space-y-6"
      >
        {/* Background line (full height) */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-[1.35rem] md:left-[1.65rem] top-0 bottom-0 w-px bg-[var(--border)]"
        />
        {/* Accent fill — animates with scroll progress */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-[1.35rem] md:left-[1.65rem] top-0 w-px bg-gradient-to-b from-[var(--accent)] via-[var(--accent)] to-transparent"
          style={{ height: lineHeight }}
        />

        {hydra.flow.map((step, i) => (
          <motion.li
            key={step.step}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            data-index={i}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.55,
              delay: i * 0.04,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative flex gap-5 md:gap-8 pl-2"
          >
            <div className="relative z-10 shrink-0">
              <div
                className={cn(
                  "relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border font-mono-meta text-xs md:text-sm transition-all duration-500",
                  activeIndex === i
                    ? "border-[var(--accent)] bg-[var(--accent)] text-[#052e20] scale-110"
                    : i < activeIndex
                      ? "border-[var(--accent)] bg-[var(--surface)] text-[var(--accent)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
                )}
              >
                {step.step}
                {activeIndex === i && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    animate={{
                      boxShadow: [
                        "0 0 0 0 color-mix(in oklab, var(--accent) 60%, transparent)",
                        "0 0 0 14px color-mix(in oklab, var(--accent) 0%, transparent)",
                      ],
                    }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                )}
              </div>
            </div>

            <div
              className={cn(
                "flex-1 min-w-0 pt-1 pb-6 md:pb-8 transition-opacity duration-500",
                activeIndex === i ? "opacity-100" : "opacity-60"
              )}
            >
              <h3 className="font-display text-xl md:text-2xl text-foreground leading-snug mb-1.5">
                {step.title}
              </h3>
              <p className="text-sm md:text-base text-[var(--muted)] leading-relaxed max-w-2xl">
                {step.detail}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>
    </Section>
  );
}
