"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  HydraIntroCanvas,
  HYDRA_INTRO_DURATION_MS,
  HYDRA_REVERSE_DURATION_MS,
} from "./intro-canvas";

/**
 * HydraTransitionOverlay — mounted once in the root layout.
 *
 * Listens for the custom event `hydra-transition`. The event detail includes:
 *   - href: where to navigate
 *   - direction: "forward" (to /hydra) or "reverse" (from /hydra)
 *
 * FORWARD — particles fly in from edges, form HYDRA, disperse revealing page.
 *   Navigation fires during HOLD so /hydra is already loaded under the overlay.
 *
 * REVERSE — particles start AT the HYDRA word, disperse outward, canvas fades.
 *   Navigation fires near the end of disperse so homepage is ready to show.
 */

// Forward: navigate ~58% through (during hold, before disperse)
const FORWARD_NAV_AT_MS = Math.round(HYDRA_INTRO_DURATION_MS * 0.58);
// Reverse: navigate ~55% through (mid-disperse, so homepage is there when bg fades)
const REVERSE_NAV_AT_MS = Math.round(HYDRA_REVERSE_DURATION_MS * 0.55);
const LINGER_AFTER_DONE_MS = 200;

type TransitionDirection = "forward" | "reverse";

interface TransitionDetail {
  href?: string;
  direction?: TransitionDirection;
}

export function HydraTransitionOverlay() {
  const router = useRouter();
  const [active, setActive] = React.useState(false);
  const [direction, setDirection] = React.useState<TransitionDirection>(
    "forward"
  );

  React.useEffect(() => {
    const handler = (e: Event) => {
      if (active) return;

      const ce = e as CustomEvent<TransitionDetail>;
      const dir: TransitionDirection = ce.detail?.direction ?? "forward";
      const href = ce.detail?.href ?? (dir === "reverse" ? "/" : "/hydra");

      // Signal to /hydra's arrival-side HydraIntro to skip
      sessionStorage.setItem(
        "hydra-transition-playing",
        String(Date.now())
      );

      document.body.style.overflow = "hidden";
      setDirection(dir);
      setActive(true);

      const navDelay =
        dir === "reverse" ? REVERSE_NAV_AT_MS : FORWARD_NAV_AT_MS;
      const navTimer = setTimeout(() => {
        router.push(href);
      }, navDelay);

      return () => clearTimeout(navTimer);
    };

    window.addEventListener("hydra-transition", handler as EventListener);
    return () =>
      window.removeEventListener("hydra-transition", handler as EventListener);
  }, [router, active]);

  if (!active) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[95] pointer-events-none"
    >
      <HydraIntroCanvas
        reverse={direction === "reverse"}
        onComplete={() => {
          setTimeout(() => {
            setActive(false);
            document.body.style.overflow = "";
            sessionStorage.removeItem("hydra-transition-playing");
          }, LINGER_AFTER_DONE_MS);
        }}
      />
    </div>
  );
}
