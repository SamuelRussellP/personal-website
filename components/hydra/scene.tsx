"use client";

import * as React from "react";
import dynamic from "next/dynamic";

/**
 * HydraScene — responsibility-separated wrapper around the 3D scene.
 *
 * - Dynamically imports the 3D component (no SSR) so Three.js (~170kb)
 *   stays out of the initial bundle and doesn't run server-side.
 * - Gates on prefers-reduced-motion — the neural cloud is light enough
 *   that modern phones render it comfortably, so mobile gets it too.
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
    if (reduce) return;
    setEnabled(true);
  }, []);

  return (
    <div aria-hidden className={className}>
      {enabled ? <Scene3D /> : <CssFallback />}
    </div>
  );
}
