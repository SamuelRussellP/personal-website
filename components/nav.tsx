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

type NavLink = {
  href: string;
  label: string;
  kind: "anchor" | "route";
};

const homeLinks: NavLink[] = [
  { href: "#journey", label: "Journey", kind: "anchor" },
  { href: "#education", label: "Education", kind: "anchor" },
  { href: "#skills", label: "Skills", kind: "anchor" },
  { href: "#contact", label: "Contact", kind: "anchor" },
  { href: "/experience", label: "Experience", kind: "route" },
];

const hydraLinks: NavLink[] = [
  { href: "/#journey", label: "Journey", kind: "route" },
  { href: "/#education", label: "Education", kind: "route" },
  { href: "/#skills", label: "Skills", kind: "route" },
  { href: "/#contact", label: "Contact", kind: "route" },
];

const experienceLinks: NavLink[] = [
  { href: "/", label: "Home", kind: "route" },
  { href: "#origin", label: "Begin", kind: "anchor" },
  { href: "#agents", label: "Hydra", kind: "anchor" },
  { href: "#close", label: "Connect", kind: "anchor" },
];

export function Nav() {
  const pathname = usePathname();
  const onHydra = pathname?.startsWith("/hydra") ?? false;
  const onExperience = pathname?.startsWith("/experience") ?? false;
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

  const brandClassName =
    "font-mono-meta text-sm tracking-tight text-foreground";
  const linkClassName =
    "font-mono-meta text-xs uppercase tracking-[0.18em] text-[var(--muted)] hover:text-foreground transition-colors";
  const links = onHydra
    ? hydraLinks
    : onExperience
      ? experienceLinks
      : homeLinks;

  const renderLink = (link: NavLink, className: string) => {
    if (onHydra) {
      return (
        <HydraBackLink key={link.href} href={link.href} className={className}>
          {link.label}
        </HydraBackLink>
      );
    }

    if (link.kind === "route") {
      return (
        <Link key={link.href} href={link.href} className={className}>
          {link.label}
        </Link>
      );
    }

    return (
      <a key={link.href} href={link.href} className={className}>
        {link.label}
      </a>
    );
  };

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
          {links.map((link) => renderLink(link, linkClassName))}
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
                {links.map((link) => {
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
                    <li key={link.href}>
                      {onHydra ? (
                        <HydraBackLink href={link.href} className={className}>
                          <span>{link.label}</span>
                          {chevron}
                        </HydraBackLink>
                      ) : link.kind === "route" ? (
                        <Link href={link.href} className={className}>
                          <span>{link.label}</span>
                          {chevron}
                        </Link>
                      ) : (
                        <a href={link.href} className={className}>
                          <span>{link.label}</span>
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
