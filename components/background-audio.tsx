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
};

const SoundContext = React.createContext<SoundContextValue | null>(null);

const BASE_VOLUME = 0.28;
const FADE_IN_MS = 2800;
const FADE_OUT_MS = 2400;
// Length of the equal-power crossfade baked into the loop seam. Ambient
// chord material has long phase envelopes — a short crossfade still leaves a
// perceptible seam. 500ms is well below the loop period but gives enough
// runway for the tail and head to blend into a continuous swell.
const LOOP_SEAM_CROSSFADE_SEC = 0.5;

// Bake a short equal-power crossfade into the loop seam so `source.loop = true`
// wraps without an audible click. The first N samples of the returned buffer
// blend the tail of the source (fading out) with the head of the source
// (fading in). The remainder is the middle of the source unchanged. Playing
// this on loop produces a continuous signal at the wrap point regardless of
// what discontinuity existed in the decoded PCM.
function prepareSeamlessLoopBuffer(
  ctx: BaseAudioContext,
  source: AudioBuffer,
  crossfadeSec: number
): AudioBuffer {
  const sampleRate = source.sampleRate;
  const crossN = Math.min(
    Math.floor(crossfadeSec * sampleRate),
    Math.floor(source.length / 4)
  );
  if (crossN <= 0) return source;

  const newLength = source.length - crossN;
  const out = ctx.createBuffer(
    source.numberOfChannels,
    newLength,
    sampleRate
  );

  for (let ch = 0; ch < source.numberOfChannels; ch++) {
    const s = source.getChannelData(ch);
    const d = out.getChannelData(ch);

    for (let i = 0; i < crossN; i++) {
      const t = i / crossN;
      const fadeOut = Math.cos(t * Math.PI * 0.5);
      const fadeIn = Math.sin(t * Math.PI * 0.5);
      d[i] = s[source.length - crossN + i] * fadeOut + s[i] * fadeIn;
    }

    for (let i = crossN; i < newLength; i++) {
      d[i] = s[i];
    }
  }

  return out;
}

function getTrackForPath(pathname: string | null): TrackConfig {
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
  const enabledRef = React.useRef(false);

  const ctxRef = React.useRef<AudioContext | null>(null);
  const gainRef = React.useRef<GainNode | null>(null);
  const sourceRef = React.useRef<AudioBufferSourceNode | null>(null);
  const bufferCacheRef = React.useRef(new Map<string, Promise<AudioBuffer>>());
  const currentSrcRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const getContext = React.useCallback(() => {
    if (ctxRef.current) return ctxRef.current;

    const Ctx: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return null;

    const ctx = new Ctx();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);
    ctxRef.current = ctx;
    gainRef.current = gain;
    return ctx;
  }, []);

  const loadBuffer = React.useCallback(
    (ctx: AudioContext, src: string) => {
      const cache = bufferCacheRef.current;
      let pending = cache.get(src);
      if (!pending) {
        pending = fetch(src)
          .then((res) => res.arrayBuffer())
          .then((ab) => ctx.decodeAudioData(ab))
          .then((buf) =>
            prepareSeamlessLoopBuffer(ctx, buf, LOOP_SEAM_CROSSFADE_SEC)
          );
        cache.set(src, pending);
      }
      return pending;
    },
    []
  );

  const rampGain = React.useCallback((target: number, durationMs: number) => {
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    if (!ctx || !gain) return;
    const now = ctx.currentTime;
    const from = gain.gain.value;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(from, now);

    // Half-cosine S-curve: soft at both ends so the fade has no audible onset
    // or cut — it eases in, glides through, and eases out.
    const steps = 256;
    const curve = new Float32Array(steps);
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const k = 0.5 - 0.5 * Math.cos(Math.PI * t);
      curve[i] = from + (target - from) * k;
    }
    gain.gain.setValueCurveAtTime(curve, now, durationMs / 1000);
  }, []);

  const stopSource = React.useCallback((fadeOut: boolean) => {
    const source = sourceRef.current;
    const ctx = ctxRef.current;
    sourceRef.current = null;
    currentSrcRef.current = null;
    if (!source) return;

    const stopAt =
      fadeOut && ctx ? ctx.currentTime + FADE_OUT_MS / 1000 + 0.2 : 0;
    try {
      if (stopAt) source.stop(stopAt);
      else source.stop();
    } catch {
      // already stopped
    }
    source.disconnect();
  }, []);

  const start = React.useCallback(
    async (src: string) => {
      const ctx = getContext();
      const gain = gainRef.current;
      if (!ctx || !gain) return false;

      if (ctx.state === "suspended") {
        try {
          await ctx.resume();
        } catch {
          return false;
        }
      }

      let buffer: AudioBuffer;
      try {
        buffer = await loadBuffer(ctx, src);
      } catch {
        return false;
      }

      // Tear down any existing source immediately — we're about to replace it.
      stopSource(false);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gain);
      source.start(0);

      sourceRef.current = source;
      currentSrcRef.current = src;

      rampGain(BASE_VOLUME, FADE_IN_MS);
      return true;
    },
    [getContext, loadBuffer, rampGain, stopSource]
  );

  const stop = React.useCallback(() => {
    rampGain(0, FADE_OUT_MS);
    stopSource(true);
  }, [rampGain, stopSource]);

  // Restart when the track source changes while sound is enabled (route change).
  React.useEffect(() => {
    if (!enabledRef.current) return;
    if (currentSrcRef.current === track.src) return;
    void start(track.src);
  }, [start, track.src]);

  // Suspend audio while the tab is hidden so it doesn't keep burning CPU / battery.
  React.useEffect(() => {
    const onVisibilityChange = () => {
      const ctx = ctxRef.current;
      if (!ctx || !enabledRef.current) return;
      if (document.hidden) {
        void ctx.suspend().catch(() => {});
      } else {
        void ctx.resume().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  // iOS bfcache: pages restored from the back/forward cache have a dead
  // AudioContext — close it and reset so the next toggle rebuilds fresh.
  React.useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      stopSource(false);
      const ctx = ctxRef.current;
      if (ctx) void ctx.close().catch(() => {});
      ctxRef.current = null;
      gainRef.current = null;
      bufferCacheRef.current = new Map();
      setEnabled(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [stopSource]);

  React.useEffect(() => {
    return () => {
      stopSource(false);
      const ctx = ctxRef.current;
      if (ctx) void ctx.close().catch(() => {});
    };
  }, [stopSource]);

  const toggle = React.useCallback(() => {
    if (enabledRef.current) {
      stop();
      setEnabled(false);
      return;
    }
    void start(track.src).then((started) => {
      if (started) setEnabled(true);
    });
  }, [start, stop, track.src]);

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
