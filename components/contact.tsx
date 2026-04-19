"use client";

import { motion } from "framer-motion";
import { Mail, ArrowUpRight } from "lucide-react";
import { Section } from "./ui/section";
import { profile } from "@/lib/data";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const channels = [
  {
    label: "Email",
    href: `mailto:${profile.email}`,
    value: profile.email,
    icon: Mail as React.ComponentType<{ className?: string }>,
  },
  {
    label: "LinkedIn",
    href: profile.links.linkedin,
    value: "samuelrussellprajasantosa",
    icon: LinkedInIcon,
  },
  {
    label: "GitHub",
    href: profile.links.github,
    value: "SamuelRussellP",
    icon: GitHubIcon,
  },
];

export function Contact() {
  return (
    <Section
      id="contact"
      eyebrow="What's next"
      title="Let's build something that doesn't break."
      lede="Open to conversations about QA leadership, automation strategy, or anything that takes quality seriously. Jakarta-based, Berlin-connected, remote-friendly — responds within 24 hours."
    >
      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        {channels.map((c, i) => (
          <motion.a
            key={c.label}
            href={c.href}
            target={c.href.startsWith("http") ? "_blank" : undefined}
            rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.5,
              delay: i * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="card p-6 md:p-8 group flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex items-center justify-between mb-8">
              <c.icon
                className="h-5 w-5 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors"
                aria-hidden
              />
              <ArrowUpRight
                className="h-4 w-4 text-[var(--subtle)] group-hover:text-[var(--accent)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
                aria-hidden
              />
            </div>
            <div>
              <div className="font-mono-meta text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] mb-1">
                {c.label}
              </div>
              <div className="text-foreground text-base md:text-lg truncate">
                {c.value}
              </div>
            </div>
          </motion.a>
        ))}
      </div>

      <footer className="mt-24 pt-10 border-t border-[var(--border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p className="font-mono-meta text-xs text-[var(--subtle)]">
          © {new Date().getFullYear()} {profile.name}. Built with Next.js,
          Tailwind, and attention to detail.
        </p>
        <p className="font-mono-meta text-xs text-[var(--subtle)]">
          {profile.origin} → {profile.currentLocation}
          <span className="mx-1.5">⇄</span>
          {profile.companyLocation}
        </p>
      </footer>
    </Section>
  );
}
