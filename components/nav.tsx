"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Resolve link href based on current page. On /hydra, everything routes home
  // (optionally with hash) via the reverse transition.
  const hrefFor = (hash: string) => (onHydra ? `/${hash}` : hash);

  const brandClassName =
    "font-mono-meta text-sm tracking-tight text-foreground";
  const linkClassName =
    "font-mono-meta text-xs uppercase tracking-[0.18em] text-[var(--muted)] hover:text-foreground transition-colors";

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-40 transition-all duration-300",
        scrolled
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

        <ThemeToggle />
      </Container>
    </header>
  );
}
