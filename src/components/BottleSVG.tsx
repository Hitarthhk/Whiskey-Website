import { useId } from "react";
import { CAP, GLASS_PROFILE, LABEL, LIQUID_PROFILE, BOTTLE_HEIGHT } from "@/three/profile";

const S = 180; // px per unit
const W = 200;
const H = Math.ceil(BOTTLE_HEIGHT * S) + 10;
const cx = W / 2;
const y = (v: number) => H - 4 - v * S;

function silhouette(profile: [number, number][]) {
  const right = profile.map(([r, v]) => `${(cx + r * S).toFixed(1)},${y(v).toFixed(1)}`);
  const left = [...profile].reverse().map(([r, v]) => `${(cx - r * S).toFixed(1)},${y(v).toFixed(1)}`);
  return `M${right.join(" L")} L${left.join(" L")} Z`;
}

const GLASS = silhouette(GLASS_PROFILE);
const LIQUID = silhouette(LIQUID_PROFILE);

/**
 * Lightweight 2D bottle — the mobile / no-WebGL / reduced-motion stand-in for
 * the 3D bottle, and the card art in the collection. Expose [data-highlight]
 * so scenes can sweep the reflection to fake rotation.
 */
export function BottleSVG({ liquid = "#c7852b", className, label = true }: { liquid?: string; className?: string; label?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label="Conceptual Gamber Valley bottle (placeholder)">
      <defs>
        <linearGradient id={`${id}l`} x1="0" x2="1">
          <stop offset="0" stopColor={liquid} stopOpacity="0.55" />
          <stop offset="0.35" stopColor={liquid} />
          <stop offset="0.7" stopColor={liquid} stopOpacity="0.85" />
          <stop offset="1" stopColor="#2a1608" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`${id}g`} x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="0.2" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="0.85" stopColor="#ffffff" stopOpacity="0.02" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id={`${id}c`} x1="0" x2="1">
          <stop offset="0" stopColor="#7a5a26" />
          <stop offset="0.45" stopColor="#e4c88c" />
          <stop offset="1" stopColor="#6b4e20" />
        </linearGradient>
        <linearGradient id={`${id}h`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}clip`}>
          <path d={GLASS} />
        </clipPath>
      </defs>
      <path d={LIQUID} fill={`url(#${id}l)`} />
      <path d={GLASS} fill={`url(#${id}g)`} stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
      {label && (
        <g>
          <rect x={cx - LABEL.radius * S * 0.86} y={y(LABEL.top)} width={LABEL.radius * S * 1.72} height={(LABEL.top - LABEL.bottom) * S} fill="#ece4d1" />
          <rect x={cx - LABEL.radius * S * 0.78} y={y(LABEL.top) + 8} width={LABEL.radius * S * 1.56} height={(LABEL.top - LABEL.bottom) * S - 16} fill="none" stroke="#a8843f" strokeWidth="0.8" />
          <path d={`M${cx - 18} ${y(1.12)} l12 -14 l5 6 l7 -11 l12 19`} fill="none" stroke="#8f6d33" strokeWidth="1.2" />
          <text x={cx} y={y(0.92)} textAnchor="middle" fontFamily="var(--font-display)" fontSize="19" fill="#14261d" letterSpacing="2">GAMBER</text>
          <text x={cx} y={y(0.8)} textAnchor="middle" fontFamily="var(--font-display)" fontSize="19" fill="#14261d" letterSpacing="2">VALLEY</text>
          <text x={cx} y={y(0.66)} textAnchor="middle" fontFamily="var(--font-body)" fontSize="4.6" fill="#14261d" letterSpacing="1.6">INDIAN SINGLE MALT WHISKY</text>
          <text x={cx} y={y(0.56)} textAnchor="middle" fontFamily="var(--font-body)" fontSize="3.4" fill="#8f6d33" letterSpacing="1">CONCEPT · PLACEHOLDER</text>
        </g>
      )}
      <rect x={cx - 0.162 * S} y={y(2.27)} width={0.324 * S} height={0.1 * S} fill={`url(#${id}c)`} />
      <rect x={cx - CAP.radius * S} y={y(CAP.base + CAP.height)} width={CAP.radius * 2 * S} height={CAP.height * S} rx="3" fill={`url(#${id}c)`} />
      <g clipPath={`url(#${id}clip)`}>
        <rect data-highlight x={cx - 70} y="0" width="22" height={H} fill={`url(#${id}h)`} opacity="0.7" />
      </g>
    </svg>
  );
}
