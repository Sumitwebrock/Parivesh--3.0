import { motion } from "motion/react";

/**
 * Ornate Indian-style tribal mandala for the Green Clearance section.
 * Stroke + subtle fill, multiple independently rotating rings.
 * Designed to peek from corners against a light green (#EAF4E8) background.
 */
export function GreenMandala({ size = 300 }: { size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const R  = size / 2;
  const O  = { originX: `${cx}px`, originY: `${cy}px` } as const;

  /* ── util ── */
  const rad  = (deg: number) => (deg * Math.PI) / 180;
  const ptX  = (deg: number, r: number) => cx + r * Math.cos(rad(deg));
  const ptY  = (deg: number, r: number) => cy + r * Math.sin(rad(deg));

  /** Teardrop petal pointing outward */
  const petal = (angleDeg: number, inner: number, outer: number, spread: number) => {
    const tip   = { x: ptX(angleDeg, outer),                y: ptY(angleDeg, outer) };
    const baseL = { x: ptX(angleDeg - spread, inner),       y: ptY(angleDeg - spread, inner) };
    const baseR = { x: ptX(angleDeg + spread, inner),       y: ptY(angleDeg + spread, inner) };
    const ctrlL = { x: ptX(angleDeg - spread * 0.3, (inner + outer) * 0.55), y: ptY(angleDeg - spread * 0.3, (inner + outer) * 0.55) };
    const ctrlR = { x: ptX(angleDeg + spread * 0.3, (inner + outer) * 0.55), y: ptY(angleDeg + spread * 0.3, (inner + outer) * 0.55) };
    return `M${baseL.x.toFixed(1)},${baseL.y.toFixed(1)} Q${ctrlL.x.toFixed(1)},${ctrlL.y.toFixed(1)} ${tip.x.toFixed(1)},${tip.y.toFixed(1)} Q${ctrlR.x.toFixed(1)},${ctrlR.y.toFixed(1)} ${baseR.x.toFixed(1)},${baseR.y.toFixed(1)} Z`;
  };

  /** Small arc-notch between petals for decorative rim */
  const arcNotch = (angleDeg: number, r: number, size2: number) => {
    const a1 = angleDeg - size2;
    const a2 = angleDeg + size2;
    return `M${ptX(a1, r).toFixed(1)},${ptY(a1, r).toFixed(1)} A${r},${r} 0 0,1 ${ptX(a2, r).toFixed(1)},${ptY(a2, r).toFixed(1)}`;
  };

  const c1 = "#1A5C1A"; // deep forest
  const c2 = "#2E7D32"; // mid green
  const c3 = "#4CAF50"; // light accent

  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      aria-hidden="true"
    >
      {/* ═══════════════════════════════════════
          RING 0 — outermost scalloped border (CW 100s)
      ═══════════════════════════════════════ */}
      <motion.g style={O} animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }}>
        {/* 24 tiny teardrops */}
        {Array.from({ length: 24 }, (_, i) => (
          <path key={i}
            d={petal((i / 24) * 360, R * 0.82, R * 0.94, 5)}
            fill={i % 3 === 0 ? c1 : "none"}
            stroke={c1} strokeWidth="0.8"
            opacity={i % 3 === 0 ? 0.55 : 0.45}
          />
        ))}
        <circle cx={cx} cy={cy} r={R * 0.81} stroke={c1} strokeWidth="0.7" opacity={0.40} />
      </motion.g>

      {/* ═══════════════════════════════════════
          RING 1 — dot ring (CCW 70s)
      ═══════════════════════════════════════ */}
      <motion.g style={O} animate={{ rotate: -360 }} transition={{ duration: 70, repeat: Infinity, ease: "linear" }}>
        {Array.from({ length: 16 }, (_, i) => {
          const big = i % 4 === 0;
          return (
            <circle key={i}
              cx={ptX((i / 16) * 360, R * 0.72)}
              cy={ptY((i / 16) * 360, R * 0.72)}
              r={big ? R * 0.028 : R * 0.016}
              fill={big ? c1 : c2}
              opacity={big ? 0.80 : 0.55}
            />
          );
        })}
        {/* Arc notches between dots */}
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i}
            d={arcNotch((i / 16) * 360 + (360 / 32), R * 0.72, 5)}
            stroke={c3} strokeWidth="0.8" opacity={0.35}
          />
        ))}
        <circle cx={cx} cy={cy} r={R * 0.74} stroke={c2} strokeWidth="0.6" strokeDasharray="3 3" opacity={0.35} />
      </motion.g>

      {/* ═══════════════════════════════════════
          RING 2 — 16-petal lotus (CW 55s)
      ═══════════════════════════════════════ */}
      <motion.g style={O} animate={{ rotate: 360 }} transition={{ duration: 55, repeat: Infinity, ease: "linear" }}>
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i}
            d={petal((i / 16) * 360, R * 0.50, R * 0.66, 8)}
            fill={i % 2 === 0 ? c1 : "none"}
            stroke={c1} strokeWidth="0.9"
            opacity={i % 2 === 0 ? 0.45 : 0.60}
          />
        ))}
        {/* Interleaved smaller petals */}
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i}
            d={petal((i / 16) * 360 + (360 / 32), R * 0.52, R * 0.60, 5)}
            fill="none"
            stroke={c2} strokeWidth="0.7"
            opacity={0.40}
          />
        ))}
        <circle cx={cx} cy={cy} r={R * 0.68} stroke={c1} strokeWidth="0.8" opacity={0.45} />
        <circle cx={cx} cy={cy} r={R * 0.50} stroke={c2} strokeWidth="0.6" opacity={0.35} />
      </motion.g>

      {/* ═══════════════════════════════════════
          RING 3 — diamond chevron ring (CCW 38s)
      ═══════════════════════════════════════ */}
      <motion.g style={O} animate={{ rotate: -360 }} transition={{ duration: 38, repeat: Infinity, ease: "linear" }}>
        {Array.from({ length: 12 }, (_, i) => {
          const a   = (i / 12) * 360;
          const x   = ptX(a, R * 0.42);
          const y   = ptY(a, R * 0.42);
          const s   = R * 0.030;
          return (
            <polygon key={i}
              points={`${x},${y - s} ${x + s},${y} ${x},${y + s} ${x - s},${y}`}
              fill={i % 3 === 0 ? c1 : "none"}
              stroke={c1} strokeWidth="0.8"
              opacity={i % 3 === 0 ? 0.70 : 0.45}
            />
          );
        })}
        {/* Spokes */}
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i}
            x1={ptX((i / 12) * 360, R * 0.28)} y1={ptY((i / 12) * 360, R * 0.28)}
            x2={ptX((i / 12) * 360, R * 0.40)} y2={ptY((i / 12) * 360, R * 0.40)}
            stroke={c2} strokeWidth="0.8" opacity={0.50}
          />
        ))}
        <circle cx={cx} cy={cy} r={R * 0.44} stroke={c1} strokeWidth="0.8" opacity={0.45} />
        <circle cx={cx} cy={cy} r={R * 0.28} stroke={c2} strokeWidth="0.7" strokeDasharray="2 3" opacity={0.40} />
      </motion.g>

      {/* ═══════════════════════════════════════
          RING 4 — 8-petal inner lotus (CW 22s)
      ═══════════════════════════════════════ */}
      <motion.g style={O} animate={{ rotate: 360 }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }}>
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i}
            d={petal((i / 8) * 360, R * 0.14, R * 0.26, 14)}
            fill={i % 2 === 0 ? c1 : c2}
            stroke={c1} strokeWidth="0.8"
            opacity={0.60}
          />
        ))}
        {/* Interleaved thin petals */}
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i}
            d={petal((i / 8) * 360 + 22.5, R * 0.14, R * 0.22, 9)}
            fill="none"
            stroke={c3} strokeWidth="0.7"
            opacity={0.50}
          />
        ))}
        <circle cx={cx} cy={cy} r={R * 0.27} stroke={c1} strokeWidth="0.8" opacity={0.50} />
        <circle cx={cx} cy={cy} r={R * 0.14} stroke={c2} strokeWidth="0.7" opacity={0.45} />
      </motion.g>

      {/* ═══════════════════════════════════════
          CENTRE — slowly spinning hexagram + dot
      ═══════════════════════════════════════ */}
      <motion.g style={O} animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
        {/* Hexagram = two triangles */}
        {[0, 60].map((offset, i) => (
          <polygon key={i}
            points={Array.from({ length: 3 }, (_, j) => {
              const a = ((j / 3) * 360 + offset) * Math.PI / 180;
              return `${(cx + R * 0.09 * Math.cos(a)).toFixed(1)},${(cy + R * 0.09 * Math.sin(a)).toFixed(1)}`;
            }).join(" ")}
            fill={i === 0 ? c1 : "none"}
            stroke={i === 0 ? c1 : c2}
            strokeWidth="0.9"
            opacity={i === 0 ? 0.65 : 0.55}
          />
        ))}
      </motion.g>

      {/* Static centre dot */}
      <circle cx={cx} cy={cy} r={R * 0.035} fill={c1} opacity={0.85} />
      <circle cx={cx} cy={cy} r={R * 0.015} fill={c3} opacity={1} />
    </svg>
  );
}
