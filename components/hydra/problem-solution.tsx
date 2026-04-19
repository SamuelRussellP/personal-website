"use client";

import { motion } from "framer-motion";
import { Section } from "@/components/ui/section";
import { hydra } from "@/lib/data";

export function HydraProblemSolution() {
  return (
    <Section
      id="what"
      eyebrow="What Hydra is"
      title="A multi-headed QA agent, triggered by a ticket."
      lede={hydra.elevator}
    >
      <div className="grid md:grid-cols-2 gap-6 md:gap-10">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="card p-8 md:p-10"
        >
          <div className="font-mono-meta text-[11px] uppercase tracking-[0.2em] text-[var(--subtle)] mb-4">
            The problem
          </div>
          <p className="text-[var(--muted)] text-base md:text-lg leading-relaxed">
            {hydra.problem}
          </p>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{
            duration: 0.6,
            delay: 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="card p-8 md:p-10 border-[var(--accent)]"
        >
          <div className="font-mono-meta text-[11px] uppercase tracking-[0.2em] text-[var(--accent)] mb-4">
            Hydra's answer
          </div>
          <p className="text-foreground text-base md:text-lg leading-relaxed">
            {hydra.solution}
          </p>
        </motion.article>
      </div>
    </Section>
  );
}
