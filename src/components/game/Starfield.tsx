"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { useGame } from "@/game/store";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleDuration: number;
  twinkleDelay: number;
  driftX: number;
  driftY: number;
  driftDuration: number;
  color: string;
  glow: string;
}

interface Nebula {
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
}

interface ShootingStar {
  top: number;
  delay: number;
  duration: number;
  angle: number;
  bright: boolean;
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const STAR_COLORS = [
  { color: "#ffffff", glow: "rgba(255,255,255,0.7)" },
  { color: "#fff4e0", glow: "rgba(255,220,180,0.7)" },
  { color: "#ffe4b0", glow: "rgba(255,200,120,0.6)" },
  { color: "#e0d4ff", glow: "rgba(200,180,255,0.6)" },
  { color: "#b0d4ff", glow: "rgba(150,200,255,0.6)" },
  { color: "#ffd4d4", glow: "rgba(255,180,180,0.5)" },
  { color: "#ffffff", glow: "rgba(255,255,255,0.7)" },
  { color: "#ffffff", glow: "rgba(255,255,255,0.7)" },
];

function makeStar(layer: 1 | 2 | 3): Star {
  const palette = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
  const sizeRange = layer === 1 ? [1.2, 2.5] : layer === 2 ? [0.8, 1.8] : [0.4, 1.2];
  const opacityRange = layer === 1 ? [0.6, 1] : layer === 2 ? [0.4, 0.8] : [0.2, 0.5];
  const driftMag = layer === 1 ? 6 : layer === 2 ? 4 : 2;
  return {
    x: rand(0, 100), y: rand(0, 100),
    size: rand(sizeRange[0], sizeRange[1]),
    opacity: rand(opacityRange[0], opacityRange[1]),
    twinkleDuration: rand(2, 7), twinkleDelay: rand(0, 6),
    driftX: rand(-driftMag, driftMag), driftY: rand(-driftMag, driftMag),
    driftDuration: rand(6, 14),
    color: palette.color, glow: palette.glow,
  };
}

export const Starfield = memo(function Starfield() {
  const animationsEnabled = useGame((s) => s.settings.animationsEnabled);
  const reducedMotion = useGame((s) => s.settings.reducedMotion);
  const animate = animationsEnabled && !reducedMotion;
  const subtleAnimate = animationsEnabled && reducedMotion;
  const starMul = reducedMotion ? 0.4 : 1;

  const [stars1, setStars1] = useState<Star[]>([]);
  const [stars2, setStars2] = useState<Star[]>([]);
  const [stars3, setStars3] = useState<Star[]>([]);
  const [nebulas, setNebulas] = useState<Nebula[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [supernovas, setSupernovas] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [comet, setComet] = useState<{ id: number; angle: number; delay: number; duration: number; bright: boolean } | null>(null);
  const [pulsar, setPulsar] = useState<{ id: number; x: number; y: number; color: string } | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStars1(Array.from({ length: Math.round(70 * starMul) }, () => makeStar(1)));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStars2(Array.from({ length: Math.round(70 * starMul) }, () => makeStar(2)));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStars3(Array.from({ length: Math.round(50 * starMul) }, () => makeStar(3)));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNebulas(Array.from({ length: 5 }, (_, i) => ({
      x: rand(10, 90), y: rand(10, 90), size: rand(20, 40),
      color: ["#d9a06622", "#7fb8d422", "#c8a8e922", "#a8d4a022", "#f0a8c822"][i],
      duration: rand(30, 50),
    })));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShootingStars(Array.from({ length: animate ? 3 : 0 }, () => ({
      top: rand(5, 50), delay: rand(3, 18), duration: rand(6, 12),
      angle: rand(15, 35), bright: Math.random() > 0.5,
    })));
  }, [starMul, animate]);

  // Supernova — rare bright star burst, happens every 25–50s
  useEffect(() => {
    if (!animate) return;
    let timer: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const delay = rand(25000, 50000);
      timer = setTimeout(() => {
        const palette = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSupernovas((arr) => [...arr, {
          id: Date.now(),
          x: rand(15, 85),
          y: rand(15, 85),
          color: palette.glow.replace("0.7", "1").replace("0.6", "1").replace("0.5", "1"),
        }]);
        // Auto-clean after the animation finishes (3.5s)
        setTimeout(() => {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSupernovas((arr) => arr.slice(1));
        }, 3500);
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => clearTimeout(timer);
  }, [animate]);

  // Comet — large slow-moving body with long bright tail, every 60–110s
  useEffect(() => {
    if (!animate) return;
    let timer: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const delay = rand(60000, 110000);
      timer = setTimeout(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setComet({
          id: Date.now(),
          angle: rand(15, 35),
          delay: 0,
          duration: rand(6, 9),
          bright: Math.random() > 0.4,
        });
        // Auto-clean after comet has passed
        setTimeout(() => {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setComet(null);
        }, 9000);
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => clearTimeout(timer);
  }, [animate]);

  // Pulsar — radiating rays burst from a point, every 40–80s
  useEffect(() => {
    if (!animate) return;
    let timer: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const delay = rand(40000, 80000);
      timer = setTimeout(() => {
        const palette = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPulsar({
          id: Date.now(),
          x: rand(20, 80),
          y: rand(20, 80),
          color: palette.glow.replace("0.7", "1").replace("0.6", "1").replace("0.5", "1"),
        });
        // Auto-clean after the pulsar animation finishes (2.5s)
        setTimeout(() => {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setPulsar(null);
        }, 2600);
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => clearTimeout(timer);
  }, [animate]);

  const galaxyArms = useMemo(() =>
    Array.from({ length: 100 }, (_, i) => {
      const t = (i / 100) * Math.PI * 4;
      const r = (i / 100) * 30;
      return { x: 50 + Math.cos(t) * r, y: 50 + Math.sin(t) * r * 0.6,
        size: Math.max(0.3, 1.8 - (i / 100) * 1.5), opacity: Math.max(0.1, 0.65 - (i / 100) * 0.55) };
    }), []);

  const galaxyScatter = useMemo(() =>
    Array.from({ length: 60 }, () => {
      const a = rand(0, Math.PI * 2); const d = rand(0, 35);
      return { x: 50 + Math.cos(a) * d, y: 50 + Math.sin(a) * d * 0.6,
        size: rand(0.4, 1.2), opacity: rand(0.2, 0.6) };
    }), []);

  const starClass = animate ? "animate-star-twinkle animate-star-drift" : subtleAnimate ? "animate-star-twinkle" : "";

  // Mouse parallax — gentle offset based on cursor position
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (!animate) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      cancelAnimationFrame(raf);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      raf = requestAnimationFrame(() => setParallax({ x, y }));
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [animate]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden bg-black" aria-hidden="true">
      {/* Aurora borealis — flowing ribbons of colored light at top */}
      {animate && (
        <div className="absolute inset-x-0 top-0 h-[40vh] overflow-hidden">
          <div
            className="absolute -inset-x-20 top-0 h-32 blur-2xl animate-aurora-flow-1"
            style={{
              background: "linear-gradient(90deg, transparent 0%, oklch(0.65 0.20 165 / 60%) 25%, oklch(0.72 0.18 195 / 50%) 50%, oklch(0.65 0.20 165 / 60%) 75%, transparent 100%)",
            }}
          />
          <div
            className="absolute -inset-x-20 top-8 h-40 blur-2xl animate-aurora-flow-2"
            style={{
              background: "linear-gradient(90deg, transparent 0%, oklch(0.55 0.18 280 / 50%) 20%, oklch(0.72 0.15 250 / 45%) 50%, oklch(0.55 0.18 280 / 50%) 80%, transparent 100%)",
            }}
          />
          <div
            className="absolute -inset-x-20 top-16 h-28 blur-2xl animate-aurora-flow-3"
            style={{
              background: "linear-gradient(90deg, transparent 0%, oklch(0.70 0.16 180 / 40%) 30%, oklch(0.65 0.20 165 / 50%) 50%, oklch(0.70 0.16 180 / 40%) 70%, transparent 100%)",
            }}
          />
        </div>
      )}

      {/* Distant gas giant planet — slow-rotating banded sphere with rings */}
      {animate && (
        <div
          className="absolute animate-planet-glow-pulse"
          style={{
            right: "8%",
            top: "12%",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background: "repeating-linear-gradient(180deg, oklch(0.58 0.14 250 / 90%) 0%, oklch(0.62 0.16 245 / 90%) 18%, oklch(0.55 0.10 260 / 85%) 35%, oklch(0.50 0.12 250 / 90%) 52%, oklch(0.60 0.18 240 / 90%) 70%, oklch(0.55 0.13 255 / 88%) 88%, oklch(0.58 0.14 250 / 90%) 100%)",
            backgroundSize: "200% 100%",
            ["--planet-glow" as string]: "oklch(0.55 0.14 250 / 35%)",
            transform: `translate(${parallax.x * 12}px, ${parallax.y * 12}px)`,
            zIndex: 2,
          }}
        >
          <div
            className="absolute inset-0 rounded-full animate-planet-rotate"
            style={{
              backgroundSize: "200% 100%",
              background: "repeating-linear-gradient(180deg, transparent 0%, oklch(0.40 0.10 250 / 30%) 5%, transparent 10%, oklch(0.40 0.10 250 / 25%) 18%, transparent 25%, oklch(0.40 0.10 250 / 35%) 38%, transparent 45%, oklch(0.40 0.10 250 / 25%) 60%, transparent 70%, oklch(0.40 0.10 250 / 30%) 85%, transparent 95%)",
            }}
          />
          {/* Ring system */}
          <div
            className="absolute left-1/2 top-1/2 animate-ring-shimmer"
            style={{
              width: "320px",
              height: "40px",
              transform: "translate(-50%, -50%) rotate(-15deg)",
              background: "linear-gradient(90deg, transparent 0%, oklch(0.72 0.10 250 / 50%) 20%, oklch(0.80 0.06 60 / 70%) 50%, oklch(0.72 0.10 250 / 50%) 80%, transparent 100%)",
              borderRadius: "50%",
              maskImage: "radial-gradient(ellipse at center, transparent 35%, black 38%, black 100%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, transparent 35%, black 38%, black 100%)",
            }}
          />
        </div>
      )}

      {nebulas.map((n, i) => (
        <div key={`neb_${i}`} className={`absolute rounded-full blur-3xl ${animate ? "animate-nebula-drift" : ""}`}
          style={{ left: `${n.x}%`, top: `${n.y}%`, width: `${n.size}vw`, height: `${n.size}vw`,
            background: n.color, animationDuration: `${n.duration}s` }} />
      ))}

      <div className={`absolute left-1/2 top-1/2 opacity-40 ${animate ? "animate-galaxy-rotate" : ""}`} style={{ transformOrigin: "center", transform: `translate(calc(-50% + ${parallax.x * 8}px), calc(-50% + ${parallax.y * 8}px))` }}>
        {galaxyArms.map((s, i) => (
          <div key={`g_${i}`} className="absolute rounded-full bg-amber-100"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}px`, height: `${s.size}px`, opacity: s.opacity }} />
        ))}
        {galaxyScatter.map((s, i) => (
          <div key={`gs_${i}`} className="absolute rounded-full bg-amber-200"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}px`, height: `${s.size}px`, opacity: s.opacity }} />
        ))}
      </div>

      <div className={`absolute inset-0 ${animate ? "animate-starfield-pan-reverse" : ""}`} style={{ animationDuration: "80s", transform: `translate(${parallax.x * -4}px, ${parallax.y * -4}px)` }}>
        {stars3.map((s, i) => (
          <div key={`s3_${i}`} className={`absolute rounded-full ${starClass}`}
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}px`, height: `${s.size}px`,
              background: s.color, ["--base-opacity" as string]: s.opacity,
              ["--twinkle-duration" as string]: `${s.twinkleDuration}s`, ["--twinkle-delay" as string]: `${s.twinkleDelay}s`,
              ["--drift-x" as string]: `${s.driftX}px`, ["--drift-y" as string]: `${s.driftY}px`,
              ["--drift-duration" as string]: `${s.driftDuration}s` }} />
        ))}
      </div>

      <div className={`absolute inset-0 ${animate ? "animate-starfield-pan" : ""}`} style={{ animationDuration: "60s", transform: `translate(${parallax.x * 8}px, ${parallax.y * 8}px)` }}>
        {stars2.map((s, i) => (
          <div key={`s2_${i}`} className={`absolute rounded-full ${starClass}`}
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}px`, height: `${s.size}px`,
              background: s.color, boxShadow: `0 0 3px 0.5px ${s.glow}`,
              ["--base-opacity" as string]: s.opacity,
              ["--twinkle-duration" as string]: `${s.twinkleDuration}s`, ["--twinkle-delay" as string]: `${s.twinkleDelay}s`,
              ["--drift-x" as string]: `${s.driftX}px`, ["--drift-y" as string]: `${s.driftY}px`,
              ["--drift-duration" as string]: `${s.driftDuration}s` }} />
        ))}
      </div>

      <div className={`absolute inset-0 ${animate ? "animate-starfield-pan" : ""}`} style={{ animationDuration: "40s", transform: `translate(${parallax.x * 14}px, ${parallax.y * 14}px)` }}>
        {stars1.map((s, i) => (
          <div key={`s1_${i}`} className={`absolute rounded-full ${starClass}`}
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}px`, height: `${s.size}px`,
              background: s.color, boxShadow: `0 0 6px 1px ${s.glow}`,
              ["--base-opacity" as string]: s.opacity,
              ["--twinkle-duration" as string]: `${s.twinkleDuration}s`, ["--twinkle-delay" as string]: `${s.twinkleDelay}s`,
              ["--drift-x" as string]: `${s.driftX}px`, ["--drift-y" as string]: `${s.driftY}px`,
              ["--drift-duration" as string]: `${s.driftDuration}s` }} />
        ))}
      </div>

      {shootingStars.map((c, i) => (
        <div key={`ss_${i}`} className="absolute"
          style={{ top: `${c.top}%`, left: "-15vw", width: "3px", height: "3px",
            background: c.bright ? "#fff8e0" : "#ffffff", borderRadius: "50%",
            boxShadow: c.bright ? "0 0 12px 3px rgba(255,240,200,0.9), 0 0 24px 6px rgba(255,200,100,0.4)" : "0 0 10px 2px rgba(255,255,255,0.8)",
            ["--angle" as string]: `${c.angle}deg`,
            animation: `shooting-star ${c.duration}s ease-in ${c.delay}s infinite` }}>
          <div className="absolute top-1/2 left-0 -translate-y-1/2"
            style={{ width: "140px", height: c.bright ? "2px" : "1.5px",
              background: c.bright ? "linear-gradient(90deg, transparent 0%, rgba(255,200,100,0.15) 30%, rgba(255,240,200,0.5) 70%, rgba(255,255,255,0.9) 100%)" : "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.4) 70%, rgba(255,255,255,0.8) 100%)",
              transform: "translateX(-140px)", borderRadius: "50%" }} />
        </div>
      ))}

      {/* Supernovas — rare bright expanding bursts */}
      {supernovas.map((sn) => (
        <div
          key={sn.id}
          className="absolute animate-supernova rounded-full"
          style={{
            left: `${sn.x}%`,
            top: `${sn.y}%`,
            width: "8px",
            height: "8px",
            background: "#ffffff",
            ["--nova-color" as string]: sn.color,
            zIndex: 5,
          }}
        />
      ))}

      {/* Comet — large slow-moving body with long bright tail, very rare */}
      {comet && (
        <div
          key={`comet_${comet.id}`}
          className="absolute animate-large-comet"
          style={{
            top: `${rand(5, 35)}%`,
            left: 0,
            width: "6px",
            height: "6px",
            background: comet.bright ? "#fff8e0" : "#ffffff",
            borderRadius: "50%",
            boxShadow: comet.bright
              ? "0 0 16px 4px rgba(255,240,200,0.95), 0 0 32px 8px rgba(255,200,100,0.5), 0 0 64px 16px rgba(255,180,80,0.25)"
              : "0 0 14px 3px rgba(255,255,255,0.85), 0 0 28px 6px rgba(255,255,255,0.4)",
            ["--angle" as string]: `${comet.angle}deg`,
            ["--comet-duration" as string]: `${comet.duration}s`,
            zIndex: 6,
          }}
        >
          {/* Long bright tail */}
          <div
            className="absolute top-1/2 left-0 -translate-y-1/2"
            style={{
              width: "300px",
              height: comet.bright ? "3px" : "2px",
              background: comet.bright
                ? "linear-gradient(90deg, transparent 0%, rgba(255,200,100,0.05) 25%, rgba(255,240,200,0.3) 55%, rgba(255,255,255,0.7) 85%, rgba(255,255,255,1) 100%)"
                : "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.25) 55%, rgba(255,255,255,0.6) 85%, rgba(255,255,255,1) 100%)",
              transform: "translateX(-300px)",
              borderRadius: "50%",
            }}
          />
        </div>
      )}

      {/* Pulsar — radiating rays burst from a point */}
      {pulsar && (
        <div
          key={`pulsar_${pulsar.id}`}
          className="absolute"
          style={{
            left: `${pulsar.x}%`,
            top: `${pulsar.y}%`,
            width: "200px",
            height: "200px",
            transform: "translate(-50%, -50%)",
            ["--pulsar-color" as string]: pulsar.color,
            zIndex: 7,
          }}
        >
          {/* Central bright dot */}
          <div
            className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white animate-pulsar-burst"
            style={{
              boxShadow: `0 0 24px 6px ${pulsar.color}, 0 0 48px 12px ${pulsar.color}`,
            }}
          />
          {/* Radiating rays — conic gradient rotating */}
          <div
            className="absolute inset-0 animate-pulsar-rays"
            style={{
              background: `conic-gradient(from 0deg, transparent 0deg, ${pulsar.color} 8deg, transparent 16deg, transparent 30deg, ${pulsar.color} 38deg, transparent 46deg, transparent 60deg, ${pulsar.color} 68deg, transparent 76deg, transparent 90deg, ${pulsar.color} 98deg, transparent 106deg, transparent 120deg, ${pulsar.color} 128deg, transparent 136deg, transparent 150deg, ${pulsar.color} 158deg, transparent 166deg, transparent 180deg, ${pulsar.color} 188deg, transparent 196deg, transparent 210deg, ${pulsar.color} 218deg, transparent 226deg, transparent 240deg, ${pulsar.color} 248deg, transparent 256deg, transparent 270deg, ${pulsar.color} 278deg, transparent 286deg, transparent 300deg, ${pulsar.color} 308deg, transparent 316deg, transparent 330deg, ${pulsar.color} 338deg, transparent 346deg, transparent 360deg)`,
              maskImage: "radial-gradient(circle at center, black 0%, black 20%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(circle at center, black 0%, black 20%, transparent 70%)",
            }}
          />
        </div>
      )}

      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />
    </div>
  );
});
