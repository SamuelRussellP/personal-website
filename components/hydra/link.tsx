"use client";

import * as React from "react";
import Link from "next/link";

// Prefetch the 3D scene chunk as soon as the user hovers/touches the link, so
// by the time they actually click and navigate, the Three.js module is in cache
// and the 3D sphere can render immediately on arrival — no loading lag that
// makes the page look empty when the transition overlay lifts.
function preloadScene() {
  // Fire the dynamic import so webpack starts fetching; we discard the promise.
  import("./scene-3d").catch(() => {
    /* noop — not fatal */
  });
}

/**
 * HydraLink — a next/link wrapper that triggers the cross-page disperse
 * animation before navigating. Respects modifier keys (Cmd/Ctrl/Shift/Alt/
 * middle-click) so "open in new tab" still works as expected.
 */
export function HydraLink({
  href = "/hydra",
  children,
  className,
  ...rest
}: React.ComponentProps<typeof Link>) {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0
    ) {
      return;
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    e.preventDefault();
    preloadScene(); // start loading the 3D chunk while the intro plays
    window.dispatchEvent(
      new CustomEvent("hydra-transition", {
        detail: { href: typeof href === "string" ? href : "/hydra" },
      })
    );
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      onPointerEnter={preloadScene}
      onTouchStart={preloadScene}
      className={className}
      {...rest}
    >
      {children}
    </Link>
  );
}
