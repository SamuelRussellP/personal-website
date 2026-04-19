"use client";

import * as React from "react";
import Link from "next/link";

/**
 * HydraBackLink — leaves the Hydra page via a disperse transition.
 * Particles start at the HYDRA word, explode outward, then the destination
 * page fades in underneath.
 */
export function HydraBackLink({
  href = "/",
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
    window.dispatchEvent(
      new CustomEvent("hydra-transition", {
        detail: {
          href: typeof href === "string" ? href : "/",
          direction: "reverse",
        },
      })
    );
  };

  return (
    <Link href={href} onClick={onClick} className={className} {...rest}>
      {children}
    </Link>
  );
}
