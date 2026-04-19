"use client";

import { motion } from "framer-motion";
import { Code2, TestTube2, Wrench, Languages, Sparkle } from "lucide-react";
import { Section } from "./ui/section";
import { skills } from "@/lib/data";
import { cn } from "@/lib/utils";

function LevelBar({ level, total = 5 }: { level: number; total?: number }) {
  return (
    <div
      className="flex gap-1"
      role="img"
      aria-label={`Proficiency ${level} out of ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1 w-4 rounded-full transition-colors",
            i < level ? "bg-[var(--accent)]" : "bg-[var(--border)]"
          )}
        />
      ))}
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="font-mono-meta text-[11px] text-[var(--muted)] border border-[var(--border)] rounded-full px-2.5 py-1 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
      {label}
    </span>
  );
}

function Tile({
  children,
  icon: Icon,
  label,
  className,
}: {
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn("card p-6 md:p-8", className)}
    >
      <div className="flex items-center gap-2 mb-5">
        <Icon className="h-4 w-4 text-[var(--accent)]" aria-hidden />
        <span className="font-mono-meta text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
          {label}
        </span>
      </div>
      {children}
    </motion.div>
  );
}

export function SkillsBento() {
  return (
    <Section
      id="skills"
      eyebrow="Toolbox"
      title="What I actually use, shipping every week."
      lede="The tools behind three years of production QA work — from payment systems to talent platforms."
    >
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6">
        {/* Languages — wide */}
        <Tile
          icon={Code2}
          label="Programming Languages"
          className="md:col-span-4"
        >
          <ul className="space-y-3">
            {skills.languages.map((l) => (
              <li
                key={l.name}
                className="flex items-center justify-between gap-4"
              >
                <span className="text-sm text-foreground">{l.name}</span>
                <LevelBar level={l.level} />
              </li>
            ))}
          </ul>
        </Tile>

        {/* Spoken languages */}
        <Tile
          icon={Languages}
          label="Spoken Languages"
          className="md:col-span-2"
        >
          <ul className="space-y-3">
            {skills.spoken.map((l) => (
              <li
                key={l.name}
                className="flex items-center justify-between gap-4"
              >
                <span className="text-sm text-foreground">{l.name}</span>
                <LevelBar level={l.level} />
              </li>
            ))}
          </ul>
        </Tile>

        {/* QA stack — wide */}
        <Tile icon={TestTube2} label="QA Stack" className="md:col-span-3">
          <div className="flex flex-wrap gap-1.5">
            {skills.qa.map((q) => (
              <Chip key={q} label={q} />
            ))}
          </div>
        </Tile>

        {/* Tools */}
        <Tile icon={Wrench} label="Tools & Infrastructure" className="md:col-span-3">
          <div className="flex flex-wrap gap-1.5">
            {skills.tools.map((t) => (
              <Chip key={t} label={t} />
            ))}
          </div>
        </Tile>

        {/* Qualities — full width, editorial */}
        <Tile
          icon={Sparkle}
          label="How I show up"
          className="md:col-span-6"
        >
          <div className="grid md:grid-cols-3 gap-6">
            {skills.qualities.map((q) => (
              <div key={q} className="font-display text-2xl md:text-3xl text-foreground leading-tight">
                {q}.
              </div>
            ))}
          </div>
        </Tile>
      </div>
    </Section>
  );
}
