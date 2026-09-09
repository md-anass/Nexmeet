"use client";

import { useId, type CSSProperties } from "react";
import styles from "./nexmeet-logo.module.css";

type NexMeetLogoProps = {
  animated?: boolean;
  className?: string;
  markOnly?: boolean;
  size?: number;
};

export function NexMeetLogo({
  animated = false,
  className = "",
  markOnly = false,
  size = 40,
}: NexMeetLogoProps) {
  const rawId = useId();
  const gradientId = `nexmeet-gradient-${rawId.replace(/:/g, "")}`;
  const glowId = `nexmeet-glow-${rawId.replace(/:/g, "")}`;

  return (
    <span
      className={`${styles.logo} ${animated ? styles.animated : ""} ${markOnly ? styles.markOnly : ""} ${className}`}
      style={{ "--logo-size": `${size}px` } as CSSProperties}
    >
      <svg
        className={styles.mark}
        viewBox="0 0 76 64"
        role={markOnly ? "img" : undefined}
        aria-label={markOnly ? "NexMeet" : undefined}
        aria-hidden={markOnly ? undefined : "true"}
      >
        <defs>
          <linearGradient id={gradientId} x1="5" y1="10" x2="71" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#22d3ee" />
            <stop offset="0.36" stopColor="#3b82f6" />
            <stop offset="0.68" stopColor="#6366f1" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
          <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <path
          className={styles.orbit}
          d="M6 42.5C17.5 54.5 55.5 54.4 70 26.8"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
          strokeWidth="2.6"
        />
        <path
          className={styles.orbitDot}
          d="M67.7 24.4a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Z"
          fill={`url(#${gradientId})`}
        />
        <g className={styles.nMark} filter={`url(#${glowId})`}>
          <path
            d="M16 46V18.5c0-4.8 5.9-7.2 9.3-3.8l25.9 26V17.8c0-3 2.4-5.4 5.4-5.4s5.4 2.4 5.4 5.4v27.7c0 4.8-5.8 7.2-9.2 3.8L26.8 23.2V46c0 3-2.4 5.4-5.4 5.4S16 49 16 46Z"
            fill={`url(#${gradientId})`}
          />
          <path className={styles.highlight} d="M21.4 18.2 56.6 46" fill="none" stroke="rgba(255,255,255,.3)" strokeLinecap="round" strokeWidth="1.3" />
        </g>
        <path
          className={styles.camera}
          d="M63 24.2 72 19.1c1.4-.8 3.1.2 3.1 1.8v22.2c0 1.6-1.7 2.6-3.1 1.8L63 39.8V24.2Z"
          fill={`url(#${gradientId})`}
        />
      </svg>

      {!markOnly && (
        <span className={styles.wordmark} aria-label="NexMeet">
          <span>Nex</span><span>Meet</span>
        </span>
      )}
    </span>
  );
}

export function AnimatedNexMeetLogo(props: Omit<NexMeetLogoProps, "animated">) {
  return <NexMeetLogo {...props} animated />;
}
