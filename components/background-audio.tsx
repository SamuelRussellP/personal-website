"use client";

import * as React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type SoundContextValue = {
  enabled: boolean;
  toggle: () => void;
};

type TrackConfig = {
  src: string;
  label: string;
  headTrimSeconds: number;
  startupGuardMs: number;
  endToleranceMs: number;
};

const SoundContext = React.createContext<SoundContextValue | null>(null);

const BASE_VOLUME = 0.28;
const CROSSFADE_MS = 2200;
const CHECK_INTERVAL_MS = 160;
const HYDRA_HEAD_TRIM_SECONDS = 0.045;
const HYDRA_STARTUP_GUARD_MS = 700;
const HYDRA_END_TOLERANCE_MS = 140;
const SPACE_CHORDS_HEAD_TRIM_SECONDS = 0.09;
const SPACE_CHORDS_STARTUP_GUARD_MS = 1000;
const SPACE_CHORDS_END_TOLERANCE_MS = 240;

function getTrackForPath(pathname: string | null): TrackConfig {
  const onHydra = pathname?.startsWith("/hydra") ?? false;

  if (onHydra) {
    return {
      src: "/audio/deep-space-loop.mp3",
      label: "deep space soundtrack",
      headTrimSeconds: HYDRA_HEAD_TRIM_SECONDS,
      startupGuardMs: HYDRA_STARTUP_GUARD_MS,
      endToleranceMs: HYDRA_END_TOLERANCE_MS,
    };
  }

  return {
    src: "/audio/space-chords-loop.mp3",
    label: "space chords soundtrack",
    headTrimSeconds: SPACE_CHORDS_HEAD_TRIM_SECONDS,
    startupGuardMs: SPACE_CHORDS_STARTUP_GUARD_MS,
    endToleranceMs: SPACE_CHORDS_END_TOLERANCE_MS,
  };
}

function createAudio(src: string) {
  const audio = new Audio(src);
  audio.preload = "auto";
  audio.loop = false;
  // iOS Safari inline playback hints (typed via attributes for wider TS compatibility).
  audio.setAttribute("playsinline", "");
  audio.setAttribute("webkit-playsinline", "");
  audio.volume = 0;
  return audio;
}

function useSoundContext() {
  const context = React.useContext(SoundContext);

  if (!context) {
    throw new Error("Sound toggle must be used inside BackgroundAudioProvider.");
  }

  return context;
}

export function BackgroundAudioProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const track = React.useMemo(() => getTrackForPath(pathname), [pathname]);
  const [enabled, setEnabled] = React.useState(false);

  const audioARef = React.useRef<HTMLAudioElement | null>(null);
  const audioBRef = React.useRef<HTMLAudioElement | null>(null);
  const activeRef = React.useRef<"a" | "b">("a");
  const crossfadingRef = React.useRef(false);
  const monitorRef = React.useRef<number | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const unlockRef = React.useRef<(() => void) | null>(null);
  const startMonitorRef = React.useRef<() => void>(() => {});
  const previousTrackRef = React.useRef(track.src);

  const getActiveAudio = React.useCallback(() => {
    return activeRef.current === "a" ? audioARef.current : audioBRef.current;
  }, []);

  const getInactiveAudio = React.useCallback(() => {
    return activeRef.current === "a" ? audioBRef.current : audioARef.current;
  }, []);

  const clearUnlockListeners = React.useCallback(() => {
    if (unlockRef.current) {
      unlockRef.current();
      unlockRef.current = null;
    }
  }, []);

  const stopMonitor = React.useCallback(() => {
    if (monitorRef.current !== null) {
      window.clearInterval(monitorRef.current);
      monitorRef.current = null;
    }
  }, []);

  const stopRaf = React.useCallback(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const pauseAll = React.useCallback(() => {
    const audioA = audioARef.current;
    const audioB = audioBRef.current;

    if (audioA) {
      audioA.pause();
      audioA.currentTime = 0;
      audioA.volume = 0;
    }

    if (audioB) {
      audioB.pause();
      audioB.currentTime = 0;
      audioB.volume = 0;
    }
  }, []);

  const ensureAudioNodes = React.useCallback(() => {
    if (!audioARef.current) {
      audioARef.current = createAudio(track.src);
    }

    if (!audioBRef.current) {
      audioBRef.current = createAudio(track.src);
    }
  }, [track.src]);

  const syncTrackSources = React.useCallback((src: string) => {
    const absolute = new URL(src, window.location.origin).href;

    if (audioARef.current && audioARef.current.src !== absolute) {
      audioARef.current.src = src;
      audioARef.current.load();
    }

    if (audioBRef.current && audioBRef.current.src !== absolute) {
      audioBRef.current.src = src;
      audioBRef.current.load();
    }
  }, []);

  const attemptPlay = React.useCallback(
    async (
      audio: HTMLAudioElement | null,
      options?: { bootstrapMuted?: boolean }
    ) => {
      if (!audio) return false;

      const bootstrapMuted = options?.bootstrapMuted ?? false;
      const previousMuted = audio.muted;
      const previousVolume = audio.volume;

      if (bootstrapMuted) {
        audio.muted = true;
        audio.volume = 0;
      }

      try {
        await audio.play();

        if (bootstrapMuted) {
          audio.muted = previousMuted;
          audio.volume = previousVolume;
        }

        return true;
      } catch {
        if (bootstrapMuted) {
          audio.muted = previousMuted;
          audio.volume = previousVolume;
        }

        return false;
      }
    },
    []
  );

  const ensureUnlocked = React.useCallback(
    async (audio: HTMLAudioElement | null) => {
      clearUnlockListeners();

      const started = await attemptPlay(audio, { bootstrapMuted: true });
      if (started) return true;

      const retry = () => {
        void attemptPlay(getActiveAudio(), { bootstrapMuted: true }).then(
          (retryStarted) => {
            if (!retryStarted) return;
            setEnabled(true);
            startMonitorRef.current();
          }
        );
        clearUnlockListeners();
      };

      const pointerOptions: AddEventListenerOptions = {
        once: true,
        passive: true,
      };

      document.addEventListener("pointerdown", retry, pointerOptions);
      document.addEventListener("keydown", retry, { once: true });
      document.addEventListener("touchend", retry, pointerOptions);

      unlockRef.current = () => {
        document.removeEventListener("pointerdown", retry, pointerOptions);
        document.removeEventListener("keydown", retry);
        document.removeEventListener("touchend", retry, pointerOptions);
      };

      return false;
    },
    [attemptPlay, clearUnlockListeners, getActiveAudio]
  );

  const crossfade = React.useCallback(
    async (incomingSrc: string, remainingMsAtTrigger?: number) => {
      const active = getActiveAudio();
      const incoming = getInactiveAudio();

      if (!active || !incoming || crossfadingRef.current) return;
      crossfadingRef.current = true;

      stopRaf();

      if (incoming.src !== new URL(incomingSrc, window.location.origin).href) {
        incoming.src = incomingSrc;
        incoming.load();
      }

      incoming.currentTime = track.headTrimSeconds;
      incoming.volume = 0;

      const started = await attemptPlay(incoming, { bootstrapMuted: true });
      if (!started) {
        crossfadingRef.current = false;
        return;
      }

      let startAt: number | null = null;
      const warmupMs = Math.max(
        0,
        Math.min(
          track.startupGuardMs,
          (remainingMsAtTrigger ?? CROSSFADE_MS) - CROSSFADE_MS
        )
      );
      const fadeDurationMs = Math.max(
        180,
        Math.min(
          CROSSFADE_MS,
          (remainingMsAtTrigger ?? CROSSFADE_MS) - warmupMs - track.endToleranceMs
        )
      );

      const tick = (time: number) => {
        if (!crossfadingRef.current) {
          rafRef.current = null;
          return;
        }

        if (startAt === null) {
          startAt = time + warmupMs;
        }

        const elapsed = time - startAt;
        if (elapsed < 0) {
          active.volume = BASE_VOLUME;
          incoming.volume = 0;
          rafRef.current = window.requestAnimationFrame(tick);
          return;
        }

        const progress = Math.min(1, elapsed / fadeDurationMs);

        active.volume = BASE_VOLUME * (1 - progress);
        incoming.volume = BASE_VOLUME * progress;

        if (progress < 1) {
          rafRef.current = window.requestAnimationFrame(tick);
          return;
        }

        active.pause();
        active.currentTime = 0;
        active.volume = 0;
        incoming.volume = BASE_VOLUME;
        activeRef.current = activeRef.current === "a" ? "b" : "a";
        crossfadingRef.current = false;
        rafRef.current = null;
      };

      rafRef.current = window.requestAnimationFrame(tick);
    },
    [
      attemptPlay,
      getActiveAudio,
      getInactiveAudio,
      stopRaf,
      track.endToleranceMs,
      track.headTrimSeconds,
      track.startupGuardMs,
    ]
  );

  const startMonitor = React.useCallback(() => {
    stopMonitor();

    monitorRef.current = window.setInterval(() => {
      if (!enabled || crossfadingRef.current) return;

      const active = getActiveAudio();
      if (!active) return;

      const duration = active.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      const remaining = duration - active.currentTime;
      if (
        remaining * 1000 <=
        CROSSFADE_MS + track.startupGuardMs + track.endToleranceMs
      ) {
        void crossfade(track.src, remaining * 1000);
      }
    }, CHECK_INTERVAL_MS);
  }, [
    crossfade,
    enabled,
    getActiveAudio,
    stopMonitor,
    track.endToleranceMs,
    track.src,
    track.startupGuardMs,
  ]);

  React.useEffect(() => {
    startMonitorRef.current = startMonitor;
  }, [startMonitor]);

  const startPlayback = React.useCallback(
    async (src: string) => {
      ensureAudioNodes();
      syncTrackSources(src);

      clearUnlockListeners();
      stopMonitor();
      stopRaf();
      crossfadingRef.current = false;
      pauseAll();
      setEnabled(false);

      const active = getActiveAudio();
      if (!active) return;

      active.currentTime = 0;
      active.muted = false;
      active.volume = BASE_VOLUME;

      const started = await ensureUnlocked(active);
      if (!started) return;

      setEnabled(true);
      startMonitor();
    },
    [
      clearUnlockListeners,
      ensureAudioNodes,
      ensureUnlocked,
      getActiveAudio,
      pauseAll,
      startMonitor,
      stopMonitor,
      stopRaf,
      syncTrackSources,
    ]
  );

  const stopPlayback = React.useCallback(() => {
    clearUnlockListeners();
    stopMonitor();
    stopRaf();
    crossfadingRef.current = false;
    pauseAll();
    setEnabled(false);
  }, [clearUnlockListeners, pauseAll, stopMonitor, stopRaf]);

  React.useEffect(() => {
    ensureAudioNodes();
    syncTrackSources(track.src);
  }, [ensureAudioNodes, syncTrackSources, track.src]);

  React.useEffect(() => {
    const trackChanged = previousTrackRef.current !== track.src;
    previousTrackRef.current = track.src;

    if (!enabled || !trackChanged) return;
    void startPlayback(track.src);
  }, [enabled, startPlayback, track.src]);

  React.useEffect(() => {
    const onVisibilityChange = () => {
      if (!enabled) return;

      if (document.hidden) {
        stopMonitor();
        getActiveAudio()?.pause();
        getInactiveAudio()?.pause();
        return;
      }

      void ensureUnlocked(getActiveAudio()).then((started) => {
        if (!started) {
          stopPlayback();
          return;
        }
        startMonitor();
      });
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [
    enabled,
    ensureUnlocked,
    getActiveAudio,
    getInactiveAudio,
    startMonitor,
    stopMonitor,
    stopPlayback,
  ]);

  React.useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        stopPlayback();
        return;
      }

      if (!enabled || document.hidden) return;

      void ensureUnlocked(getActiveAudio()).then((started) => {
        if (!started) {
          stopPlayback();
          return;
        }
        startMonitor();
      });
    };

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [enabled, ensureUnlocked, getActiveAudio, startMonitor, stopPlayback]);

  React.useEffect(() => {
    return () => {
      clearUnlockListeners();
      stopMonitor();
      stopRaf();
      pauseAll();
    };
  }, [clearUnlockListeners, pauseAll, stopMonitor, stopRaf]);

  const toggle = React.useCallback(() => {
    if (enabled) {
      stopPlayback();
      return;
    }

    void startPlayback(track.src);
  }, [enabled, startPlayback, stopPlayback, track.src]);

  return (
    <SoundContext.Provider value={{ enabled, toggle }}>
      {children}
    </SoundContext.Provider>
  );
}

export function SoundToggle({ className }: { className?: string }) {
  const pathname = usePathname();
  const { label } = React.useMemo(() => getTrackForPath(pathname), [pathname]);
  const { enabled, toggle } = useSoundContext();
  const buttonLabel = enabled ? `Mute ${label}` : `Play ${label}`;

  return (
    <button
      type="button"
      aria-label={buttonLabel}
      title={buttonLabel}
      aria-pressed={enabled}
      onClick={toggle}
      className={cn(
        "relative inline-flex h-11 w-11 items-center justify-center rounded-full",
        "border border-[var(--border)] bg-[var(--surface)]",
        "text-[var(--muted)] transition-colors duration-200",
        "hover:text-[var(--accent)]",
        enabled &&
          "border-[color-mix(in_oklab,var(--accent)_45%,var(--border))] bg-[color-mix(in_oklab,var(--accent)_14%,var(--surface))] text-[var(--accent)]",
        className
      )}
    >
      {enabled ? (
        <Volume2 className="h-4 w-4" aria-hidden />
      ) : (
        <VolumeX className="h-4 w-4" aria-hidden />
      )}
      <span
        aria-hidden
        className={cn(
          "absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[var(--accent)] transition-opacity",
          enabled ? "opacity-100" : "opacity-0"
        )}
      />
    </button>
  );
}
