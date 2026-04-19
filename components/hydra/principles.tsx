"use client";

import { motion } from "framer-motion";
import { Section } from "@/components/ui/section";
import { hydra } from "@/lib/data";

export function HydraPrinciples() {
  return (
    <Section
      id="principles"
      eyebrow="Design principles"
      title="Why it works the way it does."
      lede="The architecture didn't appear by accident. These are the six principles I held the build to — the decisions that made Hydra dependable instead of clever."
    >
      <ol className="grid md:grid-cols-2 gap-4 md:gap-6">
        {hydra.principles.map((p, i) => (
          <motion.li
            key={p.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.5,
              delay: (i % 2) * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="card p-6 md:p-8 relative overflow-hidden"
          >
            <div className="font-mono-meta text-[10px] uppercase tracking-[0.22em] text-[var(--subtle)] mb-3">
              principle {String(i + 1).padStart(2, "0")}
            </div>
            <h3 className="font-display text-xl md:text-2xl text-foreground leading-snug mb-3">
              {p.label}
            </h3>
            <p className="text-sm md:text-base text-[var(--muted)] leading-relaxed">
              {p.detail}
            </p>
          </motion.li>
        ))}
      </ol>

      {/* Engineering skills — the meta-layer */}
      <div className="mt-16 md:mt-20">
        <div className="font-mono-meta text-[10px] uppercase tracking-[0.22em] text-[var(--subtle)] mb-5">
          Engineering Playbook · Shared Skill Library
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap gap-2"
        >
          {hydra.engineeringSkills.map((s) => (
            <span
              key={s}
              className="font-mono-meta text-xs text-[var(--muted)] border border-[var(--border)] rounded-full px-3 py-1.5 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              {s}
            </span>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}
