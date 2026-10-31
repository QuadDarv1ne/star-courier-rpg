"use client";

// Procedural Web Audio engine + MP3 playback for Star Courier

type SfxType =
  | "ui_click"
  | "ui_hover"
  | "ui_back"
  | "ui_select"
  | "ui_open"
  | "ui_close"
  | "ability_alchemy"
  | "ability_biotics"
  | "ability_psyche"
  | "hit_player"
  | "hit_enemy"
  | "hit_critical"
  | "heal"
  | "shield_up"
  | "victory"
  | "defeat"
  | "chapter"
  | "toast_good"
  | "toast_bad"
  | "toast_info"
  | "combat_start"
  | "level_up"
  | "achievement"
  | "powerup"
  | "typewriter"
  | "typing_done"
  | "stinger_reveal"
  | "stinger_choice"
  | "stinger_mystery"
  | "boss_warning"
  | "shield_break"
  | "energy_full"
  | "weaken_apply";

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let masterCompressor: DynamicsCompressorNode | null = null;
let masterReverb: ConvolverNode | null = null;
let reverbWet: GainNode | null = null;
let reverbDry: GainNode | null = null;
let masterLowShelf: BiquadFilterNode | null = null;
let masterHighShelf: BiquadFilterNode | null = null;
let ambientMaster: GainNode | null = null;
let sfxMaster: GainNode | null = null;

let audioEnabled = true;
let audioVolume = 0.6;
let ambientEnabled = true;

let ambientNodes: { stop: () => void }[] = [];
let currentMp3: HTMLAudioElement | null = null;
let currentTrackIndex = -1;

interface Track {
  name: string;
  type: "procedural" | "mp3";
  // for procedural
  progression?: number[][]; // chord progression as semitone offsets from a root
  rootFreq?: number;
  tempo?: number; // ms per beat
  // optional layers for procedural tracks
  hasDrums?: boolean; // adds kick + snare pattern
  hasSubBass?: boolean; // adds deep sub-bass layer
  hasPadSweep?: boolean; // adds filter sweep pad layer
  hasMelody?: boolean; // adds melodic lead line
  // for mp3
  url?: string;
}

const TRACKS: Track[] = [
  {
    name: "Тишина перед прыжком",
    type: "procedural",
    rootFreq: 110,
    tempo: 800,
    progression: [
      [0, 7, 12, 16],
      [0, 7, 12, 11],
      [-2, 5, 10, 14],
      [-4, 3, 8, 12],
    ],
  },
  {
    name: "Дрейф в тёмном пространстве",
    type: "procedural",
    rootFreq: 98,
    tempo: 1000,
    progression: [
      [0, 3, 7, 10],
      [2, 5, 9, 12],
      [-1, 2, 7, 11],
      [-3, 0, 5, 9],
    ],
  },
  {
    name: "Голос Афины",
    type: "procedural",
    rootFreq: 130,
    tempo: 600,
    progression: [
      [0, 4, 7, 11],
      [-3, 0, 5, 9],
      [5, 9, 12, 16],
      [2, 7, 11, 14],
    ],
  },
  {
    name: "Бой у туманности",
    type: "procedural",
    rootFreq: 116,
    tempo: 420,
    hasDrums: true,
    hasSubBass: true,
    progression: [
      [0, 7, 10, 14],
      [-2, 5, 8, 12],
      [-4, 3, 7, 10],
      [-1, 6, 9, 13],
    ],
  },
  {
    name: "Артефакт Эл",
    type: "procedural",
    rootFreq: 87,
    tempo: 1400,
    progression: [
      [0, 4, 8, 12],
      [-1, 3, 7, 11],
      [-3, 1, 5, 9],
      [-5, -1, 3, 7],
    ],
  },
  {
    name: "Тени в коридорах",
    type: "procedural",
    rootFreq: 73,
    tempo: 900,
    progression: [
      [0, 3, 7, 10],
      [-2, 1, 5, 8],
      [-3, 0, 4, 7],
      [-5, -2, 2, 5],
    ],
  },
  {
    name: "Финал: Элея поёт",
    type: "procedural",
    rootFreq: 130,
    tempo: 700,
    hasMelody: true,
    hasSubBass: true,
    progression: [
      [0, 7, 12, 19],
      [5, 12, 17, 24],
      [7, 14, 19, 26],
      [2, 9, 14, 21],
    ],
  },
  {
    name: "Эпическая битва с боссом",
    type: "procedural",
    rootFreq: 146,
    tempo: 360,
    hasDrums: true,
    hasSubBass: true,
    hasPadSweep: true,
    progression: [
      [0, 7, 10, 14],
      [-2, 5, 8, 12],
      [-4, 3, 7, 10],
      [-1, 6, 9, 13],
    ],
  },
  {
    name: "Сердечная связь",
    type: "procedural",
    rootFreq: 174,
    tempo: 900,
    hasMelody: true,
    hasPadSweep: true,
    progression: [
      [0, 4, 7, 11],
      [-3, 0, 5, 9],
      [-5, -1, 3, 7],
      [-2, 2, 7, 11],
    ],
  },
  {
    name: "Тайны древних архивов",
    type: "procedural",
    rootFreq: 65,
    tempo: 1500,
    hasPadSweep: true,
    progression: [
      [0, 7, 12, 16],
      [-2, 5, 10, 14],
      [-4, 3, 8, 12],
      [-1, 6, 11, 15],
    ],
  },
  {
    name: "Cosmic Base (MP3)",
    type: "mp3",
    url: "/music/cosmic_base.mp3",
  },
  {
    name: "Cosmic Pirates (MP3)",
    type: "mp3",
    url: "/music/cosmic_pirates.mp3",
  },
  {
    name: "Cosmic Energetic (MP3)",
    type: "mp3",
    url: "/music/cosmic_energetic.mp3",
  },
];

export function getTrackCount(): number {
  return TRACKS.length;
}

export function getTrackName(idx: number): string {
  return TRACKS[idx]?.name ?? "—";
}

export function getCurrentTrackIndex(): number {
  return currentTrackIndex;
}

/** Get a track index by context — for dynamic music selection */
export function getTrackForContext(context: "menu" | "dialogue" | "combat" | "boss" | "ending" | "codex" | "chat"): number {
  switch (context) {
    case "menu":
      return 0; // "Тишина перед прыжком"
    case "dialogue":
      return 2; // "Голос Афины"
    case "combat":
      return 3; // "Бой у туманности"
    case "boss":
      return 7; // "Эпическая битва с боссом"
    case "ending":
      return 6; // "Финал: Элея поёт"
    case "codex":
      return 9; // "Тайны древних архивов"
    case "chat":
      return 8; // "Сердечная связь"
    default:
      return 0;
  }
}

/** Smoothly switch tracks with a fade-out → fade-in crossfade */
export function crossfadeToTrack(index: number, fadeMs: number = 600): void {
  if (index < 0 || index >= TRACKS.length) return;
  if (index === currentTrackIndex && ambientNodes.length > 0) return;
  currentTrackIndex = index;
  if (!audioEnabled || !ambientEnabled) return;
  const ctx = ensureContext();
  if (!ctx || !ambientMaster) return;

  // Fade out ambient master
  const fadeSec = fadeMs / 1000;
  ambientMaster.gain.cancelScheduledValues(ctx.currentTime);
  ambientMaster.gain.setValueAtTime(ambientMaster.gain.value, ctx.currentTime);
  ambientMaster.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeSec);

  // After fade-out, switch track and fade back in
  setTimeout(() => {
    stopAmbient();
    if (!ambientMaster) return;
    ambientMaster.gain.setValueAtTime(0, ctx.currentTime);
    ambientMaster.gain.linearRampToValueAtTime(0.35, ctx.currentTime + fadeSec);
    startAmbient();
  }, fadeMs);
}

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  // If the existing context was closed by the browser (long background tab), recreate it
  if (audioCtx && audioCtx.state === "closed") {
    audioCtx = null;
    masterGain = null;
    masterCompressor = null;
    masterReverb = null;
    reverbWet = null;
    reverbDry = null;
    masterLowShelf = null;
    masterHighShelf = null;
    ambientMaster = null;
    sfxMaster = null;
    ambientNodes = [];
    currentMp3 = null;
    currentTrackIndex = -1;
  }
  if (!audioCtx) {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AC();
      // Master compressor — smooths out loud peaks, gives the mix a polished feel
      masterCompressor = audioCtx.createDynamicsCompressor();
      masterCompressor.threshold.value = -18;
      masterCompressor.knee.value = 12;
      masterCompressor.ratio.value = 4;
      masterCompressor.attack.value = 0.005;
      masterCompressor.release.value = 0.25;
      masterCompressor.connect(audioCtx.destination);

      // Master EQ — low shelf for warmth (boost sub-bass ~3dB) + high shelf for clarity (boost highs ~2dB)
      masterLowShelf = audioCtx.createBiquadFilter();
      masterLowShelf.type = "lowshelf";
      masterLowShelf.frequency.value = 200; // below 200Hz
      masterLowShelf.gain.value = 3; // +3dB low shelf for warmth

      masterHighShelf = audioCtx.createBiquadFilter();
      masterHighShelf.type = "highshelf";
      masterHighShelf.frequency.value = 4000; // above 4kHz
      masterHighShelf.gain.value = 2; // +2dB high shelf for clarity

      // Chain: lowShelf → highShelf → compressor → destination
      masterLowShelf.connect(masterHighShelf);
      masterHighShelf.connect(masterCompressor);

      // Reverb — synthetic impulse response for atmospheric space
      // Only applied to ambient/music, not SFX
      masterReverb = audioCtx.createConvolver();
      const reverbLength = audioCtx.sampleRate * 2.5; // 2.5 second reverb tail
      const impulseBuffer = audioCtx.createBuffer(2, reverbLength, audioCtx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = impulseBuffer.getChannelData(ch);
        for (let i = 0; i < reverbLength; i++) {
          // Exponentially decaying noise — gives the impression of a large space
          const decay = Math.pow(1 - i / reverbLength, 3);
          data[i] = (Math.random() * 2 - 1) * decay;
        }
      }
      masterReverb.buffer = impulseBuffer;

      // Wet/dry mix for reverb
      reverbWet = audioCtx.createGain();
      reverbWet.gain.value = 0.25; // 25% wet
      reverbDry = audioCtx.createGain();
      reverbDry.gain.value = 1.0; // 100% dry (full)
      masterReverb.connect(reverbWet);
      reverbWet.connect(masterLowShelf);
      reverbDry.connect(masterLowShelf);

      masterGain = audioCtx.createGain();
      masterGain.gain.value = audioVolume;
      // Split signal: dry goes straight, wet goes through reverb
      masterGain.connect(reverbDry);
      masterGain.connect(masterReverb);

      ambientMaster = audioCtx.createGain();
      ambientMaster.gain.value = 0.35;
      ambientMaster.connect(masterGain);

      sfxMaster = audioCtx.createGain();
      sfxMaster.gain.value = 0.7;
      sfxMaster.connect(masterGain);
    } catch (e) {
      console.warn("AudioContext unavailable", e);
      return null;
    }
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function midiToFreq(semitonesFromA4: number, baseFreq: number): number {
  return baseFreq * Math.pow(2, semitonesFromA4 / 12);
}

// ===== SFX =====
export function playSound(type: SfxType): void {
  if (!audioEnabled) return;
  const ctx = ensureContext();
  if (!ctx || !sfxMaster) return;
  const now = ctx.currentTime;

  // Dynamic ducking — briefly lower ambient music when SFX plays
  // This creates space for the SFX to be heard clearly
  if (ambientMaster && ambientEnabled) {
    ambientMaster.gain.cancelScheduledValues(now);
    ambientMaster.gain.setValueAtTime(ambientMaster.gain.value, now);
    ambientMaster.gain.linearRampToValueAtTime(ambientMaster.gain.value * 0.4, now + 0.03);
    ambientMaster.gain.linearRampToValueAtTime(0.35, now + 0.5);
  }

  const makeOsc = (
    freq: number,
    type: OscillatorType,
    duration: number,
    gainStart: number,
    gainEnd: number
  ): { osc: OscillatorNode; gain: GainNode } => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(gainStart, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainEnd), now + duration);
    osc.connect(gain);
    gain.connect(sfxMaster!);
    osc.start(now);
    osc.stop(now + duration);
    return { osc, gain };
  };

  switch (type) {
    case "ui_click": {
      makeOsc(660, "sine", 0.08, 0.18, 0.001);
      makeOsc(1320, "triangle", 0.06, 0.08, 0.001);
      break;
    }
    case "ui_hover": {
      makeOsc(880, "sine", 0.05, 0.06, 0.001);
      break;
    }
    case "ui_back": {
      // Descending two-tone "back/escape" cue
      makeOsc(660, "triangle", 0.08, 0.16, 0.001);
      makeOsc(440, "sine", 0.10, 0.10, 0.001);
      break;
    }
    case "ability_alchemy": {
      const o1 = makeOsc(220, "sawtooth", 0.4, 0.22, 0.001);
      o1.osc.frequency.exponentialRampToValueAtTime(440, now + 0.4);
      const o2 = makeOsc(330, "triangle", 0.35, 0.1, 0.001);
      o2.osc.frequency.exponentialRampToValueAtTime(660, now + 0.3);
      break;
    }
    case "ability_biotics": {
      const o1 = makeOsc(440, "sine", 0.5, 0.22, 0.001);
      o1.osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);
      const o2 = makeOsc(660, "triangle", 0.45, 0.1, 0.001);
      o2.osc.frequency.exponentialRampToValueAtTime(110, now + 0.4);
      break;
    }
    case "ability_psyche": {
      const o1 = makeOsc(110, "triangle", 0.6, 0.2, 0.001);
      o1.osc.frequency.exponentialRampToValueAtTime(220, now + 0.5);
      const o2 = makeOsc(220, "sine", 0.55, 0.08, 0.001);
      o2.osc.detune.setValueAtTime(-50, now);
      o2.osc.detune.linearRampToValueAtTime(50, now + 0.5);
      break;
    }
    case "hit_player": {
      const o1 = makeOsc(180, "sawtooth", 0.18, 0.25, 0.001);
      o1.osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);
      const o2 = makeOsc(90, "square", 0.12, 0.12, 0.001);
      break;
    }
    case "hit_enemy": {
      const o1 = makeOsc(880, "square", 0.12, 0.2, 0.001);
      o1.osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
      break;
    }
    case "heal": {
      const o1 = makeOsc(440, "sine", 0.5, 0.18, 0.001);
      o1.osc.frequency.linearRampToValueAtTime(880, now + 0.45);
      const o2 = makeOsc(660, "triangle", 0.4, 0.08, 0.001);
      break;
    }
    case "shield_up": {
      const o1 = makeOsc(220, "sine", 0.4, 0.2, 0.001);
      o1.osc.frequency.linearRampToValueAtTime(440, now + 0.35);
      const o2 = makeOsc(880, "triangle", 0.3, 0.05, 0.001);
      break;
    }
    case "victory": {
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => {
        const t = now + i * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(sfxMaster!);
        osc.start(t);
        osc.stop(t + 0.4);
      });
      break;
    }
    case "defeat": {
      const notes = [330, 277, 220, 165];
      notes.forEach((f, i) => {
        const t = now + i * 0.18;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.connect(gain);
        gain.connect(sfxMaster!);
        osc.start(t);
        osc.stop(t + 0.55);
      });
      break;
    }
    case "chapter": {
      const o1 = makeOsc(440, "triangle", 0.8, 0.16, 0.001);
      o1.osc.frequency.linearRampToValueAtTime(880, now + 0.7);
      const o2 = makeOsc(220, "sine", 0.8, 0.08, 0.001);
      o2.osc.frequency.linearRampToValueAtTime(440, now + 0.7);
      break;
    }
    case "toast_good": {
      makeOsc(880, "sine", 0.18, 0.12, 0.001);
      makeOsc(1320, "triangle", 0.16, 0.06, 0.001);
      break;
    }
    case "toast_bad": {
      const o1 = makeOsc(220, "sawtooth", 0.22, 0.16, 0.001);
      o1.osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
      break;
    }
    case "toast_info": {
      makeOsc(660, "triangle", 0.14, 0.1, 0.001);
      break;
    }
    case "ui_select": {
      // Higher-pitched confirmation chime
      makeOsc(990, "sine", 0.1, 0.18, 0.001);
      makeOsc(1320, "triangle", 0.08, 0.08, 0.001);
      break;
    }
    case "ui_open": {
      // Rising sweep — panel opening
      const o = makeOsc(440, "sine", 0.18, 0.15, 0.001);
      o.osc.frequency.exponentialRampToValueAtTime(880, now + 0.16);
      makeOsc(660, "triangle", 0.14, 0.06, 0.001);
      break;
    }
    case "ui_close": {
      // Falling sweep — panel closing
      const o = makeOsc(880, "sine", 0.18, 0.15, 0.001);
      o.osc.frequency.exponentialRampToValueAtTime(440, now + 0.16);
      break;
    }
    case "hit_critical": {
      // Loud metallic crash with reverberation
      const o1 = makeOsc(1320, "square", 0.16, 0.32, 0.001);
      o1.osc.frequency.exponentialRampToValueAtTime(220, now + 0.16);
      const o2 = makeOsc(660, "sawtooth", 0.22, 0.18, 0.001);
      o2.osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
      makeOsc(110, "triangle", 0.3, 0.12, 0.001);
      break;
    }
    case "combat_start": {
      // Two-note alarm rising — fight begins
      makeOsc(220, "sawtooth", 0.25, 0.22, 0.001);
      makeOsc(330, "sawtooth", 0.25, 0.18, 0.001);
      const o3 = makeOsc(440, "square", 0.35, 0.16, 0.001);
      o3.osc.frequency.exponentialRampToValueAtTime(660, now + 0.32);
      break;
    }
    case "level_up": {
      // Triumphant ascending fanfare
      const notes = [523, 659, 784, 1047, 1319];
      notes.forEach((f, i) => {
        const t = now + i * 0.09;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.connect(gain);
        gain.connect(sfxMaster!);
        osc.start(t);
        osc.stop(t + 0.35);
      });
      break;
    }
    case "achievement": {
      // Bright celebratory chime
      const notes = [784, 988, 1319];
      notes.forEach((f, i) => {
        const t = now + i * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.connect(gain);
        gain.connect(sfxMaster!);
        osc.start(t);
        osc.stop(t + 0.55);
      });
      break;
    }
    case "powerup": {
      // Energetic swelling burst
      const o1 = makeOsc(330, "sawtooth", 0.45, 0.24, 0.001);
      o1.osc.frequency.exponentialRampToValueAtTime(660, now + 0.4);
      const o2 = makeOsc(660, "triangle", 0.4, 0.1, 0.001);
      o2.osc.frequency.exponentialRampToValueAtTime(1320, now + 0.35);
      break;
    }
    case "typewriter": {
      // Subtle soft tick for typing
      makeOsc(1320, "sine", 0.025, 0.025, 0.001);
      break;
    }
    case "typing_done": {
      // Soft confirmation when typing completes
      makeOsc(880, "sine", 0.12, 0.06, 0.001);
      makeOsc(1320, "triangle", 0.10, 0.04, 0.001);
      break;
    }
    case "stinger_reveal": {
      // Dramatic plot reveal — descending minor chord with sub-bass impact
      const notes = [659, 622, 587, 494];
      notes.forEach((f, i) => {
        const t = now + i * 0.16;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0.16, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        osc.connect(gain);
        gain.connect(sfxMaster!);
        osc.start(t);
        osc.stop(t + 0.5);
      });
      // Sub impact
      const o = makeOsc(55, "sine", 0.7, 0.2, 0.001);
      o.osc.frequency.exponentialRampToValueAtTime(40, now + 0.6);
      break;
    }
    case "stinger_choice": {
      // Pivotal choice moment — rising tension chord
      const notes = [392, 466, 554, 659];
      notes.forEach((f, i) => {
        const t = now + i * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0.16, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        osc.connect(gain);
        gain.connect(sfxMaster!);
        osc.start(t);
        osc.stop(t + 0.65);
      });
      break;
    }
    case "stinger_mystery": {
      // Eerie atmospheric — high drone with detune
      const o1 = makeOsc(880, "sine", 1.2, 0.16, 0.001);
      o1.osc.detune.setValueAtTime(-12, now);
      o1.osc.detune.linearRampToValueAtTime(12, now + 1.0);
      const o2 = makeOsc(1318, "sine", 1.0, 0.08, 0.001);
      o2.osc.detune.setValueAtTime(8, now);
      o2.osc.detune.linearRampToValueAtTime(-8, now + 0.9);
      // Low rumble underneath
      makeOsc(110, "triangle", 1.0, 0.1, 0.001);
      break;
    }
    case "boss_warning": {
      // Two low notes — impending boss encounter
      makeOsc(110, "sawtooth", 0.4, 0.22, 0.001);
      const o2 = makeOsc(82, "sawtooth", 0.6, 0.18, 0.001);
      o2.osc.frequency.setValueAtTime(82, now + 0.35);
      o2.osc.frequency.linearRampToValueAtTime(110, now + 0.55);
      break;
    }
    case "shield_break": {
      // Glass crack — high noise burst + descending tone
      const bufferSize = ctx.sampleRate * 0.12;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.8;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 3500;
      filter.Q.value = 1;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.22, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(sfxMaster!);
      noise.start(now);
      noise.stop(now + 0.13);
      // Descending crack
      const o = makeOsc(1320, "square", 0.18, 0.18, 0.001);
      o.osc.frequency.exponentialRampToValueAtTime(220, now + 0.16);
      break;
    }
    case "energy_full": {
      // Triumphant rising chord when energy reaches max
      const notes = [523, 659, 784, 988];
      notes.forEach((f, i) => {
        const t = now + i * 0.05;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.connect(gain);
        gain.connect(sfxMaster!);
        osc.start(t);
        osc.stop(t + 0.45);
      });
      break;
    }
    case "weaken_apply": {
      // Ominous descending dissonance — psy debuff applied
      const o1 = makeOsc(440, "sine", 0.6, 0.16, 0.001);
      o1.osc.frequency.exponentialRampToValueAtTime(220, now + 0.5);
      const o2 = makeOsc(415, "sine", 0.6, 0.12, 0.001);
      o2.osc.frequency.exponentialRampToValueAtTime(207, now + 0.5);
      o2.osc.detune.setValueAtTime(-15, now);
      // Low rumble
      makeOsc(82, "triangle", 0.5, 0.1, 0.001);
      break;
    }
  }
}

export function playAbilitySound(branch: "alchemy" | "biotics" | "psyche"): void {
  playSound(`ability_${branch}` as SfxType);
}

// ===== Ambient / music =====
export function startAmbient(): void {
  if (!audioEnabled || !ambientEnabled) return;
  stopAmbient();
  const ctx = ensureContext();
  if (!ctx || !ambientMaster) return;

  // Smooth fade-in for procedural tracks — starts at 0, ramps to target over 1.5s
  // Prevents harsh audio onset when track switches
  const targetGain = 0.35;
  ambientMaster.gain.cancelScheduledValues(ctx.currentTime);
  ambientMaster.gain.setValueAtTime(0, ctx.currentTime);
  ambientMaster.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 1.5);

  const track = TRACKS[currentTrackIndex] ?? TRACKS[0];
  if (track.type === "mp3") {
    if (typeof window !== "undefined") {
      const audio = new Audio(track.url);
      audio.loop = true;
      // Smooth fade-in for MP3 tracks (0 → target over 1.5s) — prevents harsh onset
      const targetVol = audioVolume * 0.5;
      audio.volume = 0;
      audio.play().then(() => {
        // Once playing, ramp volume up
        const rampSteps = 30;
        for (let i = 0; i < rampSteps; i++) {
          setTimeout(() => {
            audio.volume = (targetVol * (i + 1)) / rampSteps;
          }, (i * 50));
        }
      }).catch((e) => console.warn("MP3 playback failed", e));
      currentMp3 = audio;
    }
    return;
  }
  if (!track.progression || !track.rootFreq || !track.tempo) return;

  // Procedural: pad + bass + arpeggio + (optional) drums/sub-bass/pad-sweep/melody
  let step = 0;
  let loopCount = 0; // counts how many full progressions have played — used for chord variation
  let running = true;
  const stepInterval = track.tempo / 4;
  const progressionLength = track.progression.length;

  // Helper: alternate voicing — every 2nd loop, octave-shift the upper chord tones
  // (drops the top note by an octave to add variety)
  const getVoicingForLoop = (chordIdx: number, loop: number): number[] => {
    const chord = track.progression![chordIdx % progressionLength];
    if (loop % 2 === 0) return chord; // even loops: original voicing
    // Odd loops: drop the top note an octave for variety
    if (chord.length <= 1) return chord;
    const last = chord[chord.length - 1];
    return [...chord.slice(0, -1), last - 12];
  };

  const playChord = (chordIdx: number, time: number): void => {
    if (!running || !ctx) return;
    const chord = getVoicingForLoop(chordIdx, loopCount);
    const base = track.rootFreq!;
    // Pad — long sustained notes
    chord.forEach((semi) => {
      const f = midiToFreq(semi, base);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.0, time);
      gain.gain.linearRampToValueAtTime(0.12, time + 0.4);
      gain.gain.linearRampToValueAtTime(0.0, time + track.tempo! / 1000 + 0.3);
      osc.connect(gain);
      gain.connect(ambientMaster!);
      osc.start(time);
      osc.stop(time + track.tempo! / 1000 + 0.4);
    });
    // Bass
    {
      const f = midiToFreq(chord[0] - 12, base);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.0, time);
      gain.gain.linearRampToValueAtTime(0.15, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + track.tempo! / 1000);
      osc.connect(gain);
      gain.connect(ambientMaster!);
      osc.start(time);
      osc.stop(time + track.tempo! / 1000);
    }
  };

  const playArp = (chordIdx: number, time: number, stepNum: number): void => {
    if (!running || !ctx) return;
    const chord = getVoicingForLoop(chordIdx, loopCount);
    const base = track.rootFreq!;
    const note = chord[stepNum % chord.length];
    // Octave variation: every 4th loop (loop 3, 7, 11...) plays arpeggio an octave higher
    // This adds periodic dramatic lift to the otherwise repetitive arpeggio
    const octaveShift = loopCount % 4 === 3 ? 24 : 12; // +1 octave (24 semis) on 4th loop of every 4
    const f = midiToFreq(note + octaveShift, base);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    // Stereo panner — arpeggio slightly right for stereo width
    const panner = ctx.createStereoPanner();
    panner.pan.value = 0.35; // 35% right
    osc.type = "triangle";
    osc.frequency.value = f;
    // Subtle detune on octave-up loops for shimmer
    if (octaveShift === 24) {
      osc.detune.setValueAtTime(-4, time);
      osc.detune.linearRampToValueAtTime(4, time + 0.1);
    }
    gain.gain.setValueAtTime(0.0, time);
    gain.gain.linearRampToValueAtTime(0.08, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + stepInterval / 1000);
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(ambientMaster!);
    osc.start(time);
    osc.stop(time + stepInterval / 1000);
  };

  // Drum beat — kick on beats 1 & 3, snare on 2 & 4 (16-step pattern, hit on every 4th)
  const playDrum = (stepNum: number, time: number): void => {
    if (!running || !ctx) return;
    const inBar = stepNum % 16;
    // Kick on beats 1 (0) and 3 (8)
    if (inBar === 0 || inBar === 8) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
      gain.gain.setValueAtTime(0.22, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
      osc.connect(gain);
      gain.connect(ambientMaster!);
      osc.start(time);
      osc.stop(time + 0.2);
    }
    // Snare on beats 2 (4) and 4 (12) — filtered noise burst
    if (inBar === 4 || inBar === 12) {
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 1200;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.14, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ambientMaster!);
      noise.start(time);
      noise.stop(time + 0.15);
    }
    // Hi-hat on every off-beat (steps 2, 6, 10, 14) — short noise click
    if (inBar === 2 || inBar === 6 || inBar === 10 || inBar === 14) {
      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 6000;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ambientMaster!);
      noise.start(time);
      noise.stop(time + 0.05);
    }
    // Drum fill at end of every 4th bar (steps 60-63 in 64-step cycle)
    // Cascading snare hits for momentum into next bar
    const inPhrase = stepNum % 64;
    if (inPhrase === 60 || inPhrase === 62) {
      const bufferSize = ctx.sampleRate * 0.1;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 2500;
      filter.Q.value = 0.7;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ambientMaster!);
      noise.start(time);
      noise.stop(time + 0.1);
    }
    // Crash cymbal at the start of every 4th bar (step 64n) — bright sustained noise
    if (inPhrase === 0 && stepNum > 0) {
      const bufferSize = ctx.sampleRate * 0.6;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 4000;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.55);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ambientMaster!);
      noise.start(time);
      noise.stop(time + 0.6);
    }
  };

  // Sub-bass — long sustained low rumble under the chord
  const playSubBass = (chordIdx: number, time: number): void => {
    if (!running || !ctx) return;
    const chord = getVoicingForLoop(chordIdx, loopCount);
    const base = track.rootFreq!;
    // Sub-bass is two octaves below root
    const f = midiToFreq(chord[0] - 24, base);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = f;
    gain.gain.setValueAtTime(0.0, time);
    gain.gain.linearRampToValueAtTime(0.18, time + 0.5);
    gain.gain.linearRampToValueAtTime(0.0, time + track.tempo! / 1000 * 4 + 0.3);
    osc.connect(gain);
    gain.connect(ambientMaster!);
    osc.start(time);
    osc.stop(time + track.tempo! / 1000 * 4 + 0.4);
  };

  // Pad sweep — slow filter-modulated pad layer for atmospheric tension
  const playPadSweep = (chordIdx: number, time: number): void => {
    if (!running || !ctx) return;
    const chord = getVoicingForLoop(chordIdx, loopCount);
    const base = track.rootFreq!;
    // Pad uses root + fifth
    [chord[0], chord[1] ?? chord[0] + 7].forEach((semi) => {
      const f = midiToFreq(semi + 12, base);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = "sawtooth";
      osc.frequency.value = f;
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(200, time);
      filter.frequency.linearRampToValueAtTime(800, time + track.tempo! / 1000 * 2);
      filter.frequency.linearRampToValueAtTime(200, time + track.tempo! / 1000 * 4);
      filter.Q.value = 4;
      gain.gain.setValueAtTime(0.0, time);
      gain.gain.linearRampToValueAtTime(0.05, time + 0.8);
      gain.gain.linearRampToValueAtTime(0.0, time + track.tempo! / 1000 * 4);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ambientMaster!);
      osc.start(time);
      osc.stop(time + track.tempo! / 1000 * 4 + 0.2);
    });
  };

  // Melodic lead — picks chord tones with rhythm variation for melodic interest
  // Plays on every 2nd step (half-beat) for a flowing melodic line
  let melodyStep = 0;
  const playMelody = (chordIdx: number, time: number, stepNum: number): void => {
    if (!running || !ctx) return;
    // Skip every other step to create rhythmic interest (1, 3, 4, 6, 7 pattern based on bar)
    const rhythm = [1, 0, 1, 1, 0, 1, 1, 0]; // 1 = play, 0 = rest, across 8 step cycle
    if (rhythm[stepNum % 8] === 0) return;
    const chord = getVoicingForLoop(chordIdx, loopCount);
    const base = track.rootFreq!;
    // Melody picks the 3rd or 7th of the chord for emotional color, rotated per chord
    const toneIdx = (melodyStep + chordIdx) % chord.length;
    const note = chord[toneIdx] + 12 + 12; // 2 octaves up for melodic register
    melodyStep += 1;
    const f = midiToFreq(note, base);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    // Stereo panner — melody slightly left for stereo width (counterbalance to arp)
    const panner = ctx.createStereoPanner();
    panner.pan.value = -0.35; // 35% left
    osc.type = "triangle";
    osc.frequency.value = f;
    // Soft detune for warmth
    osc.detune.setValueAtTime(-8, time);
    osc.detune.linearRampToValueAtTime(8, time + 0.4);
    gain.gain.setValueAtTime(0.0, time);
    gain.gain.linearRampToValueAtTime(0.09, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, time + stepInterval * 2 / 1000);
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(ambientMaster!);
    osc.start(time);
    osc.stop(time + stepInterval * 2 / 1000);
  };

  const tick = (): void => {
    if (!running || !ctx) return;
    const now = ctx.currentTime;
    const chordIdx = Math.floor(step / 4);
    const stepInChord = step % 4;
    if (stepInChord === 0) {
      // Increment loopCount when starting a new full progression cycle
      if (chordIdx > 0 && chordIdx % progressionLength === 0) {
        loopCount += 1;
      }
      playChord(chordIdx, now);
      if (track.hasSubBass) playSubBass(chordIdx, now);
      if (track.hasPadSweep) playPadSweep(chordIdx, now);
    }
    playArp(chordIdx, now, stepInChord);
    if (track.hasMelody) playMelody(chordIdx, now, step);
    if (track.hasDrums) playDrum(step, now);
    step += 1;
  };

  tick();
  const interval = setInterval(tick, stepInterval);

  ambientNodes.push({
    stop: () => {
      running = false;
      clearInterval(interval);
    },
  });
}

export function stopAmbient(): void {
  for (const node of ambientNodes) {
    try {
      node.stop();
    } catch (e) {
      console.warn(e);
    }
  }
  ambientNodes = [];
  if (currentMp3) {
    try {
      currentMp3.pause();
      currentMp3.currentTime = 0;
    } catch (e) {
      console.warn(e);
    }
    currentMp3 = null;
  }
}

export function switchTrack(index: number): void {
  if (index < 0 || index >= TRACKS.length) return;
  if (index === currentTrackIndex && ambientNodes.length > 0) return;
  currentTrackIndex = index;
  if (audioEnabled && ambientEnabled) {
    startAmbient();
  }
}

export function setAudioEnabled(v: boolean): void {
  audioEnabled = v;
  const ctx = ensureContext();
  if (!ctx || !masterGain) return;
  masterGain.gain.value = v ? audioVolume : 0;
  if (v && ambientEnabled) {
    startAmbient();
  } else {
    stopAmbient();
  }
}

export function setAudioVolume(v: number): void {
  audioVolume = Math.max(0, Math.min(1, v));
  if (masterGain) masterGain.gain.value = audioEnabled ? audioVolume : 0;
  if (currentMp3) currentMp3.volume = audioVolume * 0.5;
}

export function setAmbientEnabled(v: boolean): void {
  ambientEnabled = v;
  if (v && audioEnabled) {
    startAmbient();
  } else {
    stopAmbient();
  }
}

export function isAudioEnabled(): boolean {
  return audioEnabled;
}

export function getAudioVolume(): number {
  return audioVolume;
}

export function isAmbientEnabled(): boolean {
  return ambientEnabled;
}

export function primeAudio(): void {
  // call from a user gesture (button click) to unlock audio context
  ensureContext();
}
