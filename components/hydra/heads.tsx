"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Server, MousePointerClick, Layers3 } from "lucide-react";
import { Section } from "@/components/ui/section";
import { hydra } from "@/lib/data";
import { cn } from "@/lib/utils";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  be: Server,
  fe: MousePointerClick,
  hybrid: Layers3,
};

function HeadCard({
  head,
  index,
}: {
  head: (typeof hydra.heads)[number];
  index: number;
}) {
  const ref = React.useRef<HTMLElement>(null);
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);
  const Icon = icons[head.id];

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <motion.article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos(null)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "relative card p-6 md:p-8 flex flex-col overflow-hidden",
        "hover:border-[var(--accent)] transition-all duration-300"
      )}
    >
      {/* Cursor-tracking gradient spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
        style={{
          opacity: pos ? 0.6 : 0,
          background: pos
            ? `radial-gradient(320px circle at ${pos.x}% ${pos.y}%, color-mix(in oklab, var(--accent) 18%, transparent), transparent 70%)`
            : undefined,
        }}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--accent)] bg-[var(--accent-soft)]">
            <Icon className="h-5 w-5 text-[var(--accent)]" aria-hidden />
          </div>
          <span className="font-mono-meta text-[10px] uppercase tracking-[0.2em] text-[var(--subtle)]">
            head {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <h3 className="font-display text-2xl md:text-3xl text-foreground leading-tight mb-2">
          {head.name}
        </h3>
        <p className="font-mono-meta text-xs text-[var(--muted)] mb-4">
          <span className="text-[var(--accent)]">/</span>
          {head.trigger}
        </p>

        <p className="font-display text-lg text-foreground mb-4">
          {head.tagline}
        </p>

        <p className="text-sm text-[var(--muted)] leading-relaxed">
          {head.description}
        </p>
      </div>
    </motion.article>
  );
}

export function HydraHeads() {
  return (
    <Section
      id="heads"
      eyebrow="Anatomy"
      title="Three heads, one body."
      lede="The agent routes every ticket to the right verification head. Each head has its own playbook, its own tooling, and its own idea of what 'done' looks like — but they all share the same spine."
    >
      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        {hydra.heads.map((head, i) => (
          <HeadCard key={head.id} head={head} index={i} />
        ))}
      </div>
    </Section>
  );
}
