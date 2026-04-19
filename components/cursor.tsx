"use client";

import * as React from "react";

/**
 * Custom cursor — lightweight.
 *
 * Uses raw rAF + transform (no framer-motion, no mix-blend-mode) so it's cheap
 * on compositing. The ring lags the dot via linear interpolation.
 *
 * Auto-disabled:
 *   - On touch/coarse-pointer devices (mobile, tablet)
 *   - When the user prefers reduced motion
 */
export function Cursor() {
  const dotRef = React.useRef<HTMLDivElement>(null);
  const ringRef = React.useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    if (!fine || reduce) return;

    setEnabled(true);
    document.documentElement.classList.add("cursor-custom");

    // Live pointer position (dot follows immediately)
    let dotX = -100;
    let dotY = -100;
    // Ring trails with easing
    let ringX = -100;
    let ringY = -100;
    let variant: "default" | "hover" = "default";
    let hidden = true;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      dotX = e.clientX;
      dotY = e.clientY;
      if (hidden) {
        hidden = false;
        ringX = dotX;
        ringY = dotY;
        if (ringRef.current) ringRef.current.style.opacity = "0.6";
        if (dotRef.current) dotRef.current.style.opacity = "1";
      }
    };

    const onLeave = () => {
      hidden = true;
      if (ringRef.current) ringRef.current.style.opacity = "0";
      if (dotRef.current) dotRef.current.style.opacity = "0";
    };

    const applyVariant = (next: "default" | "hover") => {
      if (next === variant) return;
      variant = next;
      if (!ringRef.current) return;
      if (next === "hover") {
        ringRef.current.style.width = "40px";
        ringRef.current.style.height = "40px";
        ringRef.current.style.borderColor = "var(--accent)";
        ringRef.current.style.opacity = "1";
      } else {
        ringRef.current.style.width = "28px";
        ringRef.current.style.height = "28px";
        ringRef.current.style.borderColor = "var(--muted)";
        ringRef.current.style.opacity = hidden ? "0" : "0.5";
      }
    };

    const onOver = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const hit = t.closest(
        'a, button, [role="button"], input, select, textarea, summary, [data-cursor="hover"]'
      );
      applyVariant(hit ? "hover" : "default");
    };

    // rAF loop — cheap, no state updates
    const tick = () => {
      // ring lerp (0.18 factor — tuned for "alive but tight")
      ringX += (dotX - ringX) * 0.18;
      ringY += (dotY - ringY) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerover", onOver, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.classList.remove("cursor-custom");
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full"
        style={{
          width: 6,
          height: 6,
          background: "var(--accent)",
          opacity: 0,
          transition: "opacity 150ms ease",
          willChange: "transform",
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[9998] rounded-full border"
        style={{
          width: 28,
          height: 28,
          borderColor: "var(--muted)",
          opacity: 0,
          transition: "opacity 150ms ease, width 180ms ease, height 180ms ease, border-color 180ms ease",
          willChange: "transform",
        }}
      />
    </>
  );
}
