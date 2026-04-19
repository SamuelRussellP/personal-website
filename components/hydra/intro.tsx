"use client";

import * as React from "react";
import { HydraIntroCanvas } from "./intro-canvas";

/**
 * HydraIntro — the arrival-side intro.
 *
 * Plays only when the user arrives directly at /hydra (paste URL, refresh,
 * external link). If they came via a HydraLink from inside the site, the
 * HydraTransitionOverlay has already played the intro across the navigation,
 * so we skip it here to avoid replaying.
 */
export function HydraIntro() {
  const [show, setShow] = React.useState(true);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    if (reduce) {
      setShow(false);
      return;
    }

    // If the transition overlay just played (within the last 3 seconds),
    // skip this arrival-side intro — it would be a replay.
    const ts = sessionStorage.getItem("hydra-transition-playing");
    if (ts && Date.now() - Number(ts) < 4000) {
      setShow(false);
      return;
    }

    // Prevent page scroll during intro
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!show) return null;
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[90] pointer-events-none"
    >
      <HydraIntroCanvas
        onComplete={() => {
          setShow(false);
          document.body.style.overflow = "";
        }}
      />
    </div>
  );
}
