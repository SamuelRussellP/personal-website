"use client";

import * as React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type SoundContextValue = {
  enabled: boolean;
  toggle: () => void;
};

const SoundContext = React.createContext<SoundContextValue | null>(null);

const BASE_VOLUME = 0.28;
const CROSSFADE_MS = 1800;
const CHECK_INTERVAL_MS = 250;

function getTrackForPath(pathname: string | null): {
  src: string;
  label: string;
} {
  const onHydra = pathname?.startsWith("/hydra") ?? false;

  if (onHydra) {
    return {
      src: "/audio/deep-space-loop.mp3",
      label: "deep space soundtrack",
    };
  }

  return {
    src: "/audio/space-chords-loop.mp3",
    label: "space chords soundtrack",
  };
}

function createAudio(src: string) {
  const audio = new Audio(src);
  audio.preload = "auto";
  audio.loop = false;
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

  const [enabled, setEnabled] = React.useState(true);

  const audioARef = React.useRef<HTMLAudioElement | null>(null);
  const audioBRef = React.useRef<HTMLAudioElement | null>(null);
  const activeRef = React.useRef<"a" | "b">("a");
  const crossfadingRef = React.useRef(false);
  const monitorRef = React.useRef<number | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const unlockRef = React.useRef<(() => void) | null>(null);

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

  const attemptPlay = React.useCallback(
    async (
      audio: HTMLAudioElement | null,
      options?: { bootstrapMuted?: boolean }
    ) => {
      if (!audio) return false;

      const bootstrapMuted = options?.bootstrapMuted ?? false;
      const previousMuted = audio.muted;
      const targetVolume = audio.volume > 0 ? audio.volume : BASE_VOLUME;

      if (bootstrapMuted) {
        audio.muted = true;
        audio.volume = 0;
      }

      try {
        await audio.play();

        if (bootstrapMuted) {
          audio.muted = previousMuted;
          audio.volume = targetVolume;
        }

        return true;
      } catch {
        if (bootstrapMuted) {
          audio.muted = previousMuted;
          audio.volume = targetVolume;
        }

        return false;
      }
    },
    []
  );

  const ensureUnlocked = React.useCallback(
    async (audio: HTMLAudioElement | null) => {
      clearUnlockListeners();

      // Try a muted bootstrap first because most browsers permit muted autoplay.
      // Once playback is running, we restore normal volume immediately.
      const started = await attemptPlay(audio, { bootstrapMuted: true });
      if (started) return true;

      const retry = () => {
        void attemptPlay(getActiveAudio());
        clearUnlockListeners();
      };

      const pointerOptions: AddEventListenerOptions = {
        once: true,
        passive: true,
      };

      document.addEventListener("pointerdown", retry, pointerOptions);
      document.addEventListener("keydown", retry, { once: true });

      unlockRef.current = () => {
        document.removeEventListener("pointerdown", retry, pointerOptions);
        document.removeEventListener("keydown", retry);
      };

      return false;
    },
    [attemptPlay, clearUnlockListeners, getActiveAudio]
  );

  const crossfade = React.useCallback(
    async (incomingSrc: string) => {
      const active = getActiveAudio();
      const incoming = getInactiveAudio();

      if (!active || !incoming || crossfadingRef.current) return;
      crossfadingRef.current = true;

      stopRaf();

      if (incoming.src !== new URL(incomingSrc, window.location.origin).href) {
        incoming.src = incomingSrc;
        incoming.load();
      }

      incoming.currentTime = 0;
      incoming.volume = 0;

      const started = await attemptPlay(incoming);
      if (!started) {
        crossfadingRef.current = false;
        return;
      }

      let startAt: number | null = null;

      const tick = (time: number) => {
        if (startAt === null) {
          startAt = time;
        }

        const progress = Math.min(1, (time - startAt) / CROSSFADE_MS);

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
    [attemptPlay, getActiveAudio, getInactiveAudio, stopRaf]
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
      if (remaining * 1000 <= CROSSFADE_MS + 120) {
        void crossfade(track.src);
      }
    }, CHECK_INTERVAL_MS);
  }, [crossfade, enabled, getActiveAudio, stopMonitor, track.src]);

  React.useEffect(() => {
    if (audioARef.current && audioBRef.current) return;

    audioARef.current = createAudio(track.src);
    audioBRef.current = createAudio(track.src);
  }, [track.src]);

  React.useEffect(() => {
    const audioA = audioARef.current;
    const audioB = audioBRef.current;

    if (!audioA || !audioB) return;

    if (audioA.src !== new URL(track.src, window.location.origin).href) {
      audioA.src = track.src;
      audioA.load();
    }

    if (audioB.src !== new URL(track.src, window.location.origin).href) {
      audioB.src = track.src;
      audioB.load();
    }

    if (!enabled) return;

    const active = getActiveAudio();
    if (!active) return;

    active.currentTime = 0;
    active.volume = BASE_VOLUME;

    void ensureUnlocked(active).then((started) => {
      if (!started) return;
      startMonitor();
    });
  }, [enabled, ensureUnlocked, getActiveAudio, startMonitor, track.src]);

  React.useEffect(() => {
    if (enabled) return;

    clearUnlockListeners();
    stopMonitor();
    stopRaf();
    crossfadingRef.current = false;
    pauseAll();
  }, [clearUnlockListeners, enabled, pauseAll, stopMonitor, stopRaf]);

  React.useEffect(() => {
    const onVisibilityChange = () => {
      if (!enabled) return;

      if (document.hidden) {
        getActiveAudio()?.pause();
        getInactiveAudio()?.pause();
        return;
      }

      void ensureUnlocked(getActiveAudio()).then((started) => {
        if (!started) return;
        startMonitor();
      });
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [enabled, ensureUnlocked, getActiveAudio, getInactiveAudio, startMonitor]);

  React.useEffect(() => {
    return () => {
      clearUnlockListeners();
      stopMonitor();
      stopRaf();
      pauseAll();
    };
  }, [clearUnlockListeners, pauseAll, stopMonitor, stopRaf]);

  const toggle = React.useCallback(() => {
    setEnabled((current) => !current);
  }, []);

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
