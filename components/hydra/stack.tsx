"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Section } from "@/components/ui/section";
import { hydra } from "@/lib/data";

export function HydraStack() {
  // Group by category preserving first-seen order
  const groups = React.useMemo(() => {
    const map = new Map<string, string[]>();
    for (const item of hydra.stack) {
      const list = map.get(item.category) ?? [];
      list.push(item.label);
      map.set(item.category, list);
    }
    return [...map.entries()];
  }, []);

  return (
    <Section
      id="stack"
      eyebrow="Stack"
      title="What Hydra is made of."
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {groups.map(([category, items], i) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.5,
              delay: i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="card p-6"
          >
            <div className="font-mono-meta text-[10px] uppercase tracking-[0.22em] text-[var(--subtle)] mb-4">
              {category}
            </div>
            <div className="flex flex-wrap gap-2">
              {items.map((label) => (
                <span
                  key={label}
                  className="text-sm text-foreground border border-[var(--border)] rounded-full px-3 py-1 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  {label}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
