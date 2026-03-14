/**
 * PariveshWheelWatermark
 * ─────────────────────
 * SVG rotating wheel inspired by the official PARIVESH portal.
 * 7 coloured segments (e-KYC, CAF, DSS, e-Processing, e-Payments, e-Compliance, KYC)
 * with Ashoka-chakra spokes and PARIVESH / CPC GREEN centre text.
 *
 * Props
 *  size        – pixel diameter (default 500)
 *  opacity     – 0-1 (default 1 for display, set low for watermark)
 *  duration    – seconds per full revolution (default 100)
 *  reverse     – spin counter-clockwise
 *  darkCenter  – use dark disc for hero/dark-bg contexts
 */
import { motion } from "motion/react";

/* ── Segment palette matching official PARIVESH wheel ── */
const SEGS = [
  { label: "e-KYC",         from: "#22C55E", to: "#15803D" },
  { label: "CAF",           from: "#06B6D4", to: "#0E7490" },
  { label: "DSS",           from: "#60A5FA", to: "#2563EB" },
  { label: "e-Processing",  from: "#818CF8", to: "#4338CA" },
  { label: "e-Payments",    from: "#FBBF24", to: "#B45309" },
  { label: "e-Compliance",  from: "#F87171", to: "#B91C1C" },
  { label: "KYC",           from: "#FB923C", to: "#C2410C" },
];

const GAP = 4.5; // degrees gap — wider, cleaner separation

interface WheelProps {
  size?: number;
  opacity?: number;
  duration?: number;
  reverse?: boolean;
  darkCenter?: boolean;
}

export function PariveshWheelWatermark({
  size = 500,
  opacity = 1,
  duration = 100,
  reverse = false,
  darkCenter = false,
}: WheelProps) {
  const cx = size / 2;
  const cy = size / 2;
  const OR  = size * 0.450;   // outer radius — slightly wider band
  const IR  = size * 0.265;   // inner radius
  const MR  = (OR + IR) / 2;  // label mid-radius

  const n    = SEGS.length;
  const span = (360 - GAP * n) / n;

  /* polar (CW from north) → SVG cartesian */
  const pt = (deg: number, r: number) => {
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  /* donut arc path */
  const arc = (a0: number, a1: number, ri: number, ro: number) => {
    const A = pt(a0, ro), B = pt(a1, ro), C = pt(a1, ri), D = pt(a0, ri);
    const la = a1 - a0 > 180 ? 1 : 0;
    const f  = (v: number) => v.toFixed(2);
    return `M${f(A.x)},${f(A.y)} A${f(ro)},${f(ro)} 0 ${la},1 ${f(B.x)},${f(B.y)} L${f(C.x)},${f(C.y)} A${f(ri)},${f(ri)} 0 ${la},0 ${f(D.x)},${f(D.y)}Z`;
  };

  const segs = SEGS.map((s, i) => {
    const start = i * (span + GAP) + GAP / 2;
    const end   = start + span;
    const mid   = (start + end) / 2;
    return { ...s, start, end, mid };
  });

  const labelFs  = size * 0.046;
  const titleFs  = size * 0.056;
  const subFs    = size * 0.026;
  const centerFill = darkCenter ? "#0B3D12" : "#FFFFFF";
  const spokeColor = darkCenter ? "#4ADE80" : "#1A5C1A";
  const titleColor = darkCenter ? "#86EFAC" : "#1A5C1A";

  return (
    <motion.div
      style={{ width: size, height: size, willChange: "transform" }}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      <svg
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ opacity }}
        aria-hidden="true"
      >
        <defs>
          {segs.map((s, i) => (
            <linearGradient key={i} id={`wg-${size}-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor={s.from} stopOpacity="1" />
              <stop offset="100%" stopColor={s.to}   stopOpacity="1" />
            </linearGradient>
          ))}

          {/* Soft glow — subtler */}
          <filter id={`glow-${size}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={size * 0.009} result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── Outermost decorative halo ── */}
        <circle cx={cx} cy={cy} r={OR + size * 0.036}
          fill="none" stroke="white" strokeWidth={size * 0.002}
          strokeDasharray={`${size * 0.017} ${size * 0.011}`}
          opacity={darkCenter ? 0.20 : 0.12} />
        <circle cx={cx} cy={cy} r={OR + size * 0.016}
          fill="none" stroke="white" strokeWidth={size * 0.0015}
          opacity={darkCenter ? 0.15 : 0.08} />

        {/* ── Coloured segments + labels ── */}
        {segs.map((s, i) => {
          const lp = pt(s.mid, MR);
          return (
            <g key={i}>
              <path
                d={arc(s.start, s.end, IR, OR)}
                fill={`url(#wg-${size}-${i})`}
                filter={`url(#glow-${size})`}
              />
              <text
                transform={`translate(${lp.x.toFixed(2)},${lp.y.toFixed(2)}) rotate(${s.mid})`}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={labelFs}
                fontWeight="800"
                fontFamily="Rajdhani, sans-serif"
                letterSpacing="0.8"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
              >
                {s.label}
              </text>
            </g>
          );
        })}

        {/* Gap tick marks */}
        {segs.map((s, i) => {
          const a  = s.start - GAP / 2;
          const p0 = pt(a, OR + size * 0.003);
          const p1 = pt(a, OR + size * 0.022);
          return (
            <line key={`tk-${i}`}
              x1={p0.x.toFixed(2)} y1={p0.y.toFixed(2)}
              x2={p1.x.toFixed(2)} y2={p1.y.toFixed(2)}
              stroke="white" strokeWidth={size * 0.004} opacity={0.45} />
          );
        })}

        {/* ── Centre disc ── */}
        <circle cx={cx} cy={cy} r={IR - size * 0.006} fill={centerFill} />

        {/* Inner border ring */}
        <circle cx={cx} cy={cy} r={IR * 0.90}
          fill="none" stroke={spokeColor}
          strokeWidth={size * 0.005} opacity={0.30} />

        {/* Second inner ring (dashed) */}
        <circle cx={cx} cy={cy} r={IR * 0.67}
          fill="none" stroke={spokeColor}
          strokeWidth={size * 0.003}
          strokeDasharray={`${size * 0.018} ${size * 0.010}`}
          opacity={0.20} />

        {/* Ashoka-chakra spokes — 16, cleaner */}
        {Array.from({ length: 16 }, (_, i) => {
          const a  = (i / 16) * 360;
          const p0 = pt(a, IR * 0.19);
          const p1 = pt(a, IR * 0.84);
          const major = i % 4 === 0;
          return (
            <line key={`sp-${i}`}
              x1={p0.x.toFixed(2)} y1={p0.y.toFixed(2)}
              x2={p1.x.toFixed(2)} y2={p1.y.toFixed(2)}
              stroke={spokeColor}
              strokeWidth={major ? size * 0.005 : size * 0.002}
              opacity={major ? 0.38 : 0.14} />
          );
        })}

        {/* Dot ring — 8 dots, every 2nd saffron */}
        {Array.from({ length: 8 }, (_, i) => {
          const a   = (i / 8) * 360;
          const p   = pt(a, IR * 0.60);
          const big = i % 2 === 0;
          return (
            <circle key={`dt-${i}`}
              cx={p.x.toFixed(2)} cy={p.y.toFixed(2)}
              r={big ? size * 0.014 : size * 0.007}
              fill={big ? "#FF6B00" : spokeColor}
              opacity={big ? 0.85 : 0.28} />
          );
        })}

        {/* ── PARIVESH title ── */}
        <text x={cx} y={cy - size * 0.028}
          textAnchor="middle" dominantBaseline="middle"
          fill={titleColor}
          fontSize={titleFs}
          fontWeight="900"
          fontFamily="Rajdhani, sans-serif"
          letterSpacing="3"
          opacity={0.92}
        >PARIVESH</text>

        {/* ── CPC GREEN subtitle ── */}
        <text x={cx} y={cy + size * 0.048}
          textAnchor="middle" dominantBaseline="middle"
          fill="#FF6B00"
          fontSize={subFs}
          fontWeight="700"
          fontFamily="Rajdhani, sans-serif"
          letterSpacing="1.5"
          opacity={0.85}
        >CPC GREEN</text>
      </svg>
    </motion.div>
  );
}