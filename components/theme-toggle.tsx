"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const current = theme === "system" ? resolvedTheme : theme;
  const isDark = current === "dark";

  return (
    <button
      type="button"
      // Stable aria-label until mounted to prevent hydration mismatch.
      aria-label={
        mounted
          ? isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
          : "Toggle theme"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative inline-flex h-11 w-11 items-center justify-center rounded-full",
        "border border-[var(--border)] bg-[var(--surface)]",
        "text-[var(--muted)] hover:text-[var(--accent)]",
        "transition-colors duration-200",
        className
      )}
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-4 w-4" aria-hidden />
        ) : (
          <Moon className="h-4 w-4" aria-hidden />
        )
      ) : (
        <span className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
