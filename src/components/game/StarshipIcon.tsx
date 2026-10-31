"use client";

import { motion } from "framer-motion";

interface StarshipIconProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

export function StarshipIcon({ className = "", size = 64, animated = true }: StarshipIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      initial={animated ? { rotate: -8, opacity: 0 } : undefined}
      animate={animated ? { rotate: 0, opacity: 1 } : undefined}
      transition={animated ? { duration: 1.2, ease: "easeOut" } : undefined}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="thrust-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.94 0.06 60)" />
          <stop offset="35%" stopColor="oklch(0.85 0.18 70)" />
          <stop offset="70%" stopColor="oklch(0.65 0.20 25 / 80%)" />
          <stop offset="100%" stopColor="oklch(0.50 0.10 25 / 0%)" />
        </radialGradient>
        <linearGradient id="hull-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.78 0.02 250)" />
          <stop offset="40%" stopColor="oklch(0.50 0.04 250)" />
          <stop offset="100%" stopColor="oklch(0.28 0.04 260)" />
        </linearGradient>
        <linearGradient id="hull-light" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.96 0.01 60)" />
          <stop offset="100%" stopColor="oklch(0.78 0.06 70)" />
        </linearGradient>
        <radialGradient id="cockpit-glass" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="oklch(0.94 0.06 180)" />
          <stop offset="60%" stopColor="oklch(0.65 0.13 195)" />
          <stop offset="100%" stopColor="oklch(0.32 0.08 220)" />
        </radialGradient>
        <filter id="thrust-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>

      {animated && (
        <motion.ellipse
          cx="20" cy="50" rx="14" ry="4"
          fill="url(#thrust-glow)" filter="url(#thrust-blur)"
          initial={{ rx: 8, opacity: 0.6 }}
          animate={{ rx: [10, 16, 12, 14, 10], opacity: [0.7, 1, 0.85, 1, 0.7] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {!animated && (
        <ellipse cx="20" cy="50" rx="14" ry="4" fill="url(#thrust-glow)" filter="url(#thrust-blur)" />
      )}

      <path d="M 30 50 L 50 38 L 75 42 L 92 50 L 75 58 L 50 62 Z" fill="url(#hull-grad)" stroke="oklch(0.78 0.10 70 / 50%)" strokeWidth="0.6" />
      <path d="M 45 38 L 55 30 L 65 38 Z" fill="url(#hull-grad)" opacity="0.9" />
      <path d="M 45 62 L 55 70 L 65 62 Z" fill="url(#hull-grad)" opacity="0.9" />
      <ellipse cx="73" cy="50" rx="9" ry="3.5" fill="url(#cockpit-glass)" stroke="oklch(0.65 0.08 195 / 50%)" strokeWidth="0.4" />
      <line x1="35" y1="50" x2="65" y2="50" stroke="oklch(0.96 0.01 60 / 25%)" strokeWidth="0.4" />

      <circle cx="50" cy="38" r="1.2" fill="oklch(0.62 0.22 22)">
        {animated && <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite" />}
      </circle>
      <circle cx="50" cy="62" r="1.2" fill="oklch(0.72 0.18 145)">
        {animated && <animate attributeName="opacity" values="0.3;1;0.3" dur="1.6s" repeatCount="indefinite" />}
      </circle>
      <circle cx="30" cy="50" r="2" fill="oklch(0.96 0.06 60)">
        {animated && <animate attributeName="r" values="1.8;2.4;1.8" dur="0.6s" repeatCount="indefinite" />}
      </circle>
      <circle cx="30" cy="50" r="6" fill="oklch(0.78 0.15 70 / 15%)" filter="url(#thrust-blur)" />
      <path d="M 50 40 L 75 44 L 92 50 L 75 50 L 50 50 Z" fill="url(#hull-light)" opacity="0.18" />
    </motion.svg>
  );
}
