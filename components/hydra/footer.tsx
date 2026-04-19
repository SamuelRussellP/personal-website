"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Mail, ArrowUpRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { HydraBackLink } from "./back-link";
import { hydra, profile } from "@/lib/data";

export function HydraFooter() {
  return (
    <>
      <Section
        id="proud"
        eyebrow="Why this one matters"
        title="Why Hydra is the thing I'm most excited about right now."
      >
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {hydra.proudOf.map((line, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="card p-6 md:p-8"
            >
              <div className="font-mono-meta text-[11px] uppercase tracking-[0.2em] text-[var(--accent)] mb-4">
                reason {String(i + 1).padStart(2, "0")}
              </div>
              <p className="font-display text-xl md:text-2xl text-foreground leading-snug">
                {line}
              </p>
            </motion.li>
          ))}
        </ol>
      </Section>

      <Container className="pb-24">
        <div className="border-t border-[var(--border)] pt-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <HydraBackLink
            href="/#journey"
            className="inline-flex items-center gap-2 font-mono-meta text-xs uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--accent)] transition-colors group"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] group-hover:border-[var(--accent)] group-hover:bg-[var(--accent-soft)] transition-all">
              <ArrowLeft
                className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform"
                aria-hidden
              />
            </span>
            Back to the journey
          </HydraBackLink>

          <a
            href={`mailto:${profile.email}?subject=Let's talk about Hydra`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--accent)] text-[#052e20] font-medium text-sm hover:bg-[var(--accent-strong)] transition-colors group"
          >
            <Mail className="h-4 w-4" aria-hidden />
            Talk to me about Hydra
            <ArrowUpRight
              className="h-4 w-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"
              aria-hidden
            />
          </a>
        </div>
      </Container>
    </>
  );
}
