"use client";

import * as React from "react";
import dynamic from "next/dynamic";

/**
 * HydraScene — responsibility-separated wrapper around the 3D scene.
 *
 * - Dynamically imports the 3D component (no SSR) so Three.js (~170kb)
 *   stays out of the initial bundle and doesn't run server-side.
 * - Gates on prefers-reduced-motion and viewport width — keeps mobile devices
 *   on a CSS-only fallback.
 * - Provides a graceful CSS fallback element for both initial paint (while
 *   the 3D module loads) and the disabled-motion case.
 */

const Scene3D = dynamic(() => import("./scene-3d"), {
  ssr: false,
  loading: () => <CssFallback />,
});

function CssFallback() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[32rem] w-[32rem] rounded-full blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(circle, var(--accent) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}

export function HydraScene({ className }: { className?: string }) {
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    // Reserve 3D for viewports that can handle it comfortably — mobile stays
    // on the CSS fallback to preserve battery / GPU.
    const wide = window.matchMedia("(min-width: 768px)").matches;
    if (reduce || !wide) return;
    setEnabled(true);
  }, []);

  return (
    <div aria-hidden className={className}>
      {enabled ? <Scene3D /> : <CssFallback />}
    </div>
  );
}
