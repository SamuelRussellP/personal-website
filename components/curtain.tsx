"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Page-load curtain — a single sweep that reveals the content.
 * Shows the brand mark briefly, then slides away upward.
 * Auto-dismisses after ~1.2s. Respects reduced-motion (skips entirely).
 *
 * Skipped on /hydra — that route has its own dedicated intro animation.
 */
export function Curtain() {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const [show, setShow] = React.useState(true);

  React.useEffect(() => {
    if (reduce || pathname?.startsWith("/hydra")) {
      setShow(false);
      return;
    }
    // Prevent scroll during curtain
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t = setTimeout(() => {
      setShow(false);
      document.body.style.overflow = prev;
    }, 1200);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [reduce, pathname]);

  if (reduce) return null;
  if (pathname?.startsWith("/hydra")) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)] pointer-events-none"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden
        >
          <div className="relative flex flex-col items-center gap-4">
            {/* Expanding ring */}
            <motion.div
              className="h-12 w-12 rounded-full border border-[var(--accent)]"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.4, 1.4, 2.2], opacity: [0, 1, 0] }}
              transition={{
                duration: 1.1,
                times: [0, 0.5, 1],
                ease: "easeOut",
              }}
            />
            <motion.div
              className="absolute h-12 w-12 rounded-full bg-[var(--accent)]"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 0.4, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
            {/* Name — revealed briefly */}
            <motion.p
              className="font-mono-meta text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.1, times: [0, 0.3, 0.7, 1] }}
            >
              Samuel Russell · Loading journey
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
