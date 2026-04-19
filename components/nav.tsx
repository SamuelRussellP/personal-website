"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Container } from "./ui/container";
import { HydraBackLink } from "./hydra/back-link";
import { cn } from "@/lib/utils";

const links = [
  { hash: "#journey", label: "Journey" },
  { hash: "#education", label: "Education" },
  { hash: "#skills", label: "Skills" },
  { hash: "#contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  const onHydra = pathname?.startsWith("/hydra") ?? false;
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open. Also close on Escape and
  // on viewport growth past the md breakpoint so we never end up with the
  // menu stuck open when the device rotates.
  React.useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const mql = window.matchMedia("(min-width: 768px)");
    const onResize = () => {
      if (mql.matches) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    mql.addEventListener("change", onResize);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      mql.removeEventListener("change", onResize);
    };
  }, [open]);

  const hrefFor = (hash: string) => (onHydra ? `/${hash}` : hash);

  const brandClassName =
    "font-mono-meta text-sm tracking-tight text-foreground";
  const linkClassName =
    "font-mono-meta text-xs uppercase tracking-[0.18em] text-[var(--muted)] hover:text-foreground transition-colors";

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-40 transition-all duration-300",
        scrolled || open
          ? "backdrop-blur-xl bg-[color-mix(in_oklab,var(--background)_80%,transparent)] border-b border-[var(--border)]"
          : "bg-transparent"
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        {onHydra ? (
          <HydraBackLink
            href="/"
            className={brandClassName}
            aria-label="Home"
          >
            <span className="text-[var(--accent)]">~</span>/samuel
          </HydraBackLink>
        ) : (
          <Link href="/" className={brandClassName} aria-label="Home">
            <span className="text-[var(--accent)]">~</span>/samuel
          </Link>
        )}

        <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
          {links.map((l) => {
            const href = hrefFor(l.hash);
            return onHydra ? (
              <HydraBackLink
                key={l.hash}
                href={href}
                className={linkClassName}
              >
                {l.label}
              </HydraBackLink>
            ) : (
              <a key={l.hash} href={href} className={linkClassName}>
                {l.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "md:hidden relative inline-flex h-11 w-11 items-center justify-center rounded-full",
              "border border-[var(--border)] bg-[var(--surface)]",
              "text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
            )}
          >
            {open ? (
              <X className="h-4 w-4" aria-hidden />
            ) : (
              <Menu className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            key="mobile-menu"
            aria-label="Mobile"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden border-t border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_92%,transparent)] backdrop-blur-xl"
          >
            <Container className="py-4">
              <ul
                className="flex flex-col divide-y divide-[var(--border)]"
                // Capture-phase close: fires before the child link handler,
                // so the menu collapses immediately — even for Hydra's
                // custom-transition links where the route doesn't change
                // until the disperse animation finishes.
                onClickCapture={() => setOpen(false)}
              >
                {links.map((l) => {
                  const href = hrefFor(l.hash);
                  const className =
                    "flex items-center justify-between py-4 font-display text-2xl text-foreground hover:text-[var(--accent)] transition-colors";
                  const chevron = (
                    <span
                      aria-hidden
                      className="font-mono-meta text-xs text-[var(--subtle)]"
                    >
                      →
                    </span>
                  );
                  return (
                    <li key={l.hash}>
                      {onHydra ? (
                        <HydraBackLink href={href} className={className}>
                          <span>{l.label}</span>
                          {chevron}
                        </HydraBackLink>
                      ) : (
                        <a href={href} className={className}>
                          <span>{l.label}</span>
                          {chevron}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
