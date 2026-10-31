"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/game/store";
import { Starfield } from "@/components/game/Starfield";
import { MainMenu } from "@/components/game/MainMenu";
import { ChapterCard } from "@/components/game/ChapterCard";
import { DialogueView } from "@/components/game/DialogueView";
import { Bridge } from "@/components/game/Bridge";
import { CombatView } from "@/components/game/CombatView";
import { CharacterSheet } from "@/components/game/CharacterSheet";
import { EndingScreen } from "@/components/game/EndingScreen";
import { AboutScreen } from "@/components/game/AboutScreen";
import { CodexScreen } from "@/components/game/CodexScreen";
import { AchievementsScreen } from "@/components/game/AchievementsScreen";
import { CaptainLogScreen } from "@/components/game/CaptainLogScreen";
import { SettingsScreen } from "@/components/game/SettingsScreen";
import { lazy, Suspense } from "react";
import { AchievementUnlockOverlay } from "@/components/game/AchievementUnlockOverlay";
import { ToastStack } from "@/components/game/ToastStack";
import { MusicPlayer } from "@/components/game/MusicPlayer";
import { ACHIEVEMENTS } from "@/game/data/achievements";
import type { Achievement } from "@/game/types";
import { crossfadeToTrack } from "@/lib/audio";

// Lazy-load ChatScreen (650 lines, uses z-ai-web-dev-sdk) — only loads when user opens chat
const ChatScreen = lazy(() => import("@/components/game/ChatScreen").then((m) => ({ default: m.ChatScreen })));

// Map screen names to music track indices — returns -1 for screens that shouldn't change music
function screenToTrackIdx(screen: string): number {
  switch (screen) {
    case "menu":
    case "about":
    case "settings":
    case "achievements":
    case "log":
      return 0; // "Тишина перед прыжком" — ambient menu
    case "intro":
    case "dialogue":
    case "chapter_card":
      return 2; // "Голос Афины" — narrative
    case "bridge":
    case "characters":
      return 1; // "Дрейф в тёмном пространстве" — exploration
    case "combat":
      return 3; // "Бой у туманности" — combat
    case "ending":
      return 6; // "Финал: Элея поёт"
    case "codex":
      return 9; // "Тайны древних архивов"
    case "chat":
      return 8; // "Сердечная связь"
    default:
      return -1;
  }
}

// Generate or retrieve a persistent session ID
function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let sid = sessionStorage.getItem("sc-session-id");
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem("sc-session-id", sid);
  }
  return sid;
}

// Collect visitor info from the browser — comprehensive device profiling
function collectVisitorInfo() {
  if (typeof window === "undefined") return {};
  const nav = navigator as any;
  const screen2 = screen as any;

  // CPU cores
  const cpuCores = nav.hardwareConcurrency || null;

  // Device memory (GB) — Chrome only
  const deviceMemory = nav.deviceMemory || null;

  // Network connection
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  const connection = conn ? {
    type: conn.effectiveType || conn.type || null,
    downlink: conn.downlink || null,
    rtt: conn.rtt || null,
    saveData: conn.saveData || false,
  } : null;

  // Touch
  const hasTouch = "ontouchstart" in window || nav.maxTouchPoints > 0;
  const touchPoints = nav.maxTouchPoints || 0;

  // Color depth + pixel ratio
  const colorDepth = screen2.colorDepth || screen2.pixelDepth || null;
  const pixelRatio = window.devicePixelRatio || null;

  // WebGL GPU info — try WebGL2 first, then WebGL
  let gpu: string | null = null;
  let gpuVendor: string | null = null;
  let webglVersion: string | null = null;
  try {
    const canvas = document.createElement("canvas");
    let gl: WebGL2RenderingContext | WebGLRenderingContext | null = canvas.getContext("webgl2") as WebGL2RenderingContext | null;
    if (gl) { webglVersion = "WebGL2"; } else { gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null; if (gl) webglVersion = "WebGL1"; }
    if (gl) {
      const ext = (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");
      if (ext) {
        gpu = (gl as WebGLRenderingContext).getParameter(ext.UNMASKED_RENDERER_WEBGL) || null;
        gpuVendor = (gl as WebGLRenderingContext).getParameter(ext.UNMASKED_VENDOR_WEBGL) || null;
      }
      // Max texture size as GPU capability indicator
      const maxTexSize = (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).MAX_TEXTURE_SIZE);
      if (maxTexSize) { /* could store as additional GPU cap */ }
    }
  } catch {}

  // Canvas fingerprint hash (lightweight — just the first chars of toDataURL)
  let canvasFingerprint: string | null = null;
  try {
    const c = document.createElement("canvas");
    c.width = 200; c.height = 50;
    const cx = c.getContext("2d");
    if (cx) {
      cx.textBaseline = "top"; cx.font = "14px Arial";
      cx.fillStyle = "#f60"; cx.fillRect(0, 0, 100, 30);
      cx.fillStyle = "#069"; cx.fillText("StarCourier", 2, 15);
      cx.fillStyle = "rgba(102,204,0,0.7)"; cx.fillText("StarCourier", 4, 17);
      canvasFingerprint = c.toDataURL().slice(-32);
    }
  } catch {}

  // WebGL fingerprint hash
  let webglFingerprint: string | null = null;
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl") as WebGLRenderingContext | null;
    if (gl) {
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      if (ext) {
        const vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL);
        const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
        webglFingerprint = `${vendor}~${renderer}`.slice(0, 64);
      }
    }
  } catch {}

  // Audio fingerprint (small hash from oscillator output)
  let audioFingerprint: string | null = null;
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (AC) {
      const ac = new AC();
      const osc = ac.createOscillator();
      const analyser = ac.createAnalyser();
      const gain = ac.createGain();
      gain.gain.value = 0;
      osc.connect(analyser);
      analyser.connect(gain);
      gain.connect(ac.destination);
      osc.start(0);
      // We can't get the output data synchronously, so just use sampleRate + baseLatency
      audioFingerprint = `${ac.sampleRate}~${(ac as any).baseLatency ?? "?"}`;
      osc.stop(0);
      ac.close();
    }
  } catch {}

  // Battery (async — fire-and-forget, will be in next event)
  let battery: { level: number; charging: boolean } | null = null;
  try {
    if (nav.getBattery) {
      nav.getBattery().then((b: any) => {
        battery = { level: Math.round(b.level * 100), charging: b.charging };
      }).catch(() => {});
    }
  } catch {}

  // Detect HDR / wide gamut
  const hdrSupported = window.matchMedia?.("(dynamic-range: high)")?.matches ?? null;
  const wideGamut = window.matchMedia?.("(gamut: p3)")?.matches ?? null;

  // Preferences
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const prefersContrast = window.matchMedia?.("(prefers-contrast: more)")?.matches ?? null;
  const prefersForcedColors = window.matchMedia?.("(forced-colors: active)")?.matches ?? null;

  // Cookie + DNT + PDF
  const cookiesEnabled = navigator.cookieEnabled;
  const dnt = navigator.doNotTrack || (window as any).doNotTrack || null;
  const pdfViewer = typeof navigator.pdfViewerEnabled !== "undefined" ? navigator.pdfViewerEnabled : null;

  // Screen orientation
  const orientation = screen2.orientation?.type || (window.innerHeight > window.innerWidth ? "portrait" : "landscape");

  // Available screen dimensions (excluding taskbar/dock)
  const availScreen = `${screen2.availWidth}x${screen2.availHeight}`;

  // Referrer
  const referrer = document.referrer || null;

  // Storage estimate
  let storageEstimate: { usage: number; quota: number } | null = null;
  try {
    if (nav.storage?.estimate) {
      nav.storage.estimate().then((s: any) => {
        storageEstimate = { usage: s.usage, quota: s.quota };
      }).catch(() => {});
    }
  } catch {}

  // Online/offline status
  const onlineStatus = navigator.onLine;

  // Max touch points for device class detection
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(nav.userAgent || "");

  return {
    language: navigator.language || null,
    languages: navigator.languages?.join(",") || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    screenRes: `${screen2.width}x${screen2.height}`,
    availScreen,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    colorDepth,
    pixelRatio,
    orientation,
    cpuCores,
    deviceMemory,
    connection,
    hasTouch,
    touchPoints,
    gpu,
    gpuVendor,
    webglVersion,
    canvasFingerprint,
    webglFingerprint,
    audioFingerprint,
    battery,
    hdrSupported,
    wideGamut,
    prefersDark,
    prefersReducedMotion,
    prefersContrast,
    prefersForcedColors,
    cookiesEnabled,
    dnt,
    pdfViewer,
    platform: nav.platform || null,
    vendor: nav.vendor || null,
    referrer,
    storageEstimate,
    onlineStatus,
    isMobile,
    country: nav.country || null,
    city: nav.city || null,
    region: nav.region || null,
    lat: nav.latitude || null,
    lon: nav.longitude || null,
  };
}

// Send analytics event — uses absolute path so it works regardless of current route
function trackEvent(action: string, path: string, metadata?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        path,
        sessionId: getSessionId(),
        ...collectVisitorInfo(),
        metadata,
      }),
    }).catch(() => {});
  } catch {}
}

// Stable empty array reference — prevents infinite re-render when useSyncExternalStore
// detects a new [] instance on every call to getServerSnapshot
const EMPTY_SEEN_ACHIEVEMENTS: string[] = [];

export function GameShell() {
  const screen = useGame((s) => s.screen);
  const currentChapterId = useGame((s) => s.currentChapterId);
  const save = useGame((s) => s.save);
  const settings = useGame((s) => s.settings);
  const seenAchievements = useGame((s) => s.save?.seenAchievements ?? EMPTY_SEEN_ACHIEVEMENTS);
  const [mounted, setMounted] = useState(false);
  const [pendingAchievementQueue, setPendingAchievementQueue] = useState<Achievement[]>([]);
  const prevSeenRef = useRef<string[]>([]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  // Watch for newly seen achievements — show overlay when a new achievement is unlocked
  useEffect(() => {
    if (!mounted || !save) {
      prevSeenRef.current = seenAchievements;
      return;
    }
    const prev = prevSeenRef.current;
    const newOnes = seenAchievements.filter((id) => !prev.includes(id));
    if (newOnes.length > 0) {
      // Find achievement objects by ID directly (NOT via newlyUnlockedAchievements,
      // because the IDs in newOnes are already in seenAchievements — newlyUnlockedAchievements
      // would return ZERO since it filters out IDs that ARE in seenAchievements)
      const newly = newOnes
        .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
        .filter((a): a is Achievement => Boolean(a));
      if (newly.length > 0) {
        setPendingAchievementQueue((q) => [...q, ...newly]);
      }
    }
    prevSeenRef.current = seenAchievements;
  }, [seenAchievements, mounted, save]);

  // Track page views — only fire analytics event when the screen actually changes
  const prevScreenRef = useRef<string>("");
  useEffect(() => {
    if (!mounted) return;
    if (screen !== prevScreenRef.current) {
      prevScreenRef.current = screen;
      trackEvent("screen_view", "/", { screen, chapter: save?.chapter });
      // Dynamic music selection based on screen context
      const trackIdx = screenToTrackIdx(screen);
      if (trackIdx >= 0) {
        crossfadeToTrack(trackIdx, 800);
      }
    }
  }, [screen, mounted, save?.chapter]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-amber-200">
        <div className="animate-pulse-glow text-xs font-mono tracking-[0.4em]">
          ЗАГРУЗКА "ЭЛЕИ"…
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (screen) {
      case "menu": return <MainMenu />;
      case "chapter_card": return <ChapterCard chapterId={currentChapterId ?? "ch1"} />;
      case "intro":
      case "dialogue": return <DialogueView />;
      case "bridge": return save ? <Bridge /> : <MainMenu />;
      case "combat": return save ? <CombatView /> : <MainMenu />;
      case "characters": return save ? <CharacterSheet /> : <MainMenu />;
      case "ending": return save ? <EndingScreen /> : <MainMenu />;
      case "about": return <AboutScreen />;
      case "codex": return <CodexScreen />;
      case "achievements": return <AchievementsScreen />;
      case "settings": return <SettingsScreen />;
      case "chat": return <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-amber-200 text-xs font-mono tracking-[0.3em]">ЗАГРУЗКА ЧАТА…</div>}><ChatScreen /></Suspense>;
      case "log": return save ? <CaptainLogScreen /> : <MainMenu />;
      default: return <MainMenu />;
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-slate-100">
      <Starfield />
      <AnimatePresence mode="wait">
        <motion.div
          key={screen + (currentChapterId ?? "")}
          initial={{ opacity: 0, y: settings.animationsEnabled && !settings.reducedMotion ? 8 : 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: settings.animationsEnabled && !settings.reducedMotion ? -8 : 0 }}
          transition={{ duration: settings.animationsEnabled && !settings.reducedMotion ? 0.3 : 0 }}
          className="relative z-10"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
      <ToastStack />
      {screen !== "ending" && <MusicPlayer />}

      {/* Achievement unlock overlay — shown when a new achievement is unlocked */}
      {pendingAchievementQueue.length > 0 && (
        <AchievementUnlockOverlay
          achievement={pendingAchievementQueue[0]}
          onClose={() => {
            setPendingAchievementQueue((q) => q.slice(1));
          }}
        />
      )}

      {/* Admin button — top right corner */}
      <a
        href="/admin"
        className="fixed top-4 right-4 z-40 w-8 h-8 flex items-center justify-center rounded-full border border-amber-400/20 bg-zinc-900/60 text-amber-400/40 hover:text-amber-300 hover:border-amber-400/50 backdrop-blur text-xs font-bold transition-all"
        title="Admin"
        aria-label="Открыть админ-панель"
      >
        M
      </a>
    </div>
  );
}
