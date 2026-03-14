import { motion } from "motion/react";
import { useEffect, useState } from "react";

/* ═══════════════════════════════════════
   Tribal Pattern Component
   Inspired by Indian tribal art (Warli, Gond)
   ═══════════════════════════════════════ */

interface TribalPatternProps {
  variant?: "warli" | "gond" | "geometric" | "organic";
  color?: string;
  opacity?: number;
  size?: number;
  animate?: boolean;
  className?: string;
}

export function TribalPattern({
  variant = "warli",
  color = "#1A5C1A",
  opacity = 0.15,
  size = 200,
  animate = true,
  className = "",
}: TribalPatternProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const animateProps = animate
    ? {
        initial: { opacity: 0, scale: 0.8, rotate: -5 },
        animate: {
          opacity: opacity,
          scale: 1,
          rotate: 0,
          transition: {
            duration: 2,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      }
    : { opacity };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      {...animateProps}
      style={{
        filter: "drop-shadow(0 0 20px currentColor)",
        color: color + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
      }}
    >
      {variant === "warli" && <WarliPattern color={color} opacity={opacity} />}
      {variant === "gond" && <GondPattern color={color} opacity={opacity} />}
      {variant === "geometric" && <GeometricPattern color={color} opacity={opacity} />}
      {variant === "organic" && <OrganicPattern color={color} opacity={opacity} />}
    </motion.svg>
  );
}

// Warli-inspired patterns (human figures, geometric shapes)
function WarliPattern({ color, opacity }: { color: string; opacity: number }) {
  const fillColor = color;
  const strokeColor = color;

  return (
    <g>
      {/* Central circle with dancing figures */}
      <motion.circle
        cx="100"
        cy="100"
        r="45"
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        opacity={opacity}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1, rotate: 360 }}
        transition={{ pathLength: { duration: 2, ease: "easeInOut" }, rotate: { duration: 40, repeat: Infinity, ease: "linear" } }}
        style={{ originX: "100px", originY: "100px" }}
      />

      {/* Tribal figures around circle */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = 100 + Math.cos(rad) * 60;
        const y = 100 + Math.sin(rad) * 60;
        return (
          <motion.g
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: opacity,
              scale: [1, 1.1, 1],
            }}
            transition={{
              opacity: { delay: i * 0.1, duration: 0.5 },
              scale: { delay: i * 0.1 + 1, duration: 2, repeat: Infinity, repeatDelay: 1 },
            }}
          >
            {/* Head */}
            <circle cx={x} cy={y - 8} r="3" fill={fillColor} />
            {/* Body */}
            <line x1={x} y1={y - 5} x2={x} y2={y + 2} stroke={strokeColor} strokeWidth="1.5" />
            {/* Arms */}
            <line x1={x - 4} y1={y - 2} x2={x + 4} y2={y - 2} stroke={strokeColor} strokeWidth="1.5" />
            {/* Legs */}
            <line x1={x} y1={y + 2} x2={x - 3} y2={y + 8} stroke={strokeColor} strokeWidth="1.5" />
            <line x1={x} y1={y + 2} x2={x + 3} y2={y + 8} stroke={strokeColor} strokeWidth="1.5" />
          </motion.g>
        );
      })}

      {/* Corner geometric patterns */}
      {[[20, 20], [180, 20], [20, 180], [180, 180]].map(([x, y], i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: opacity, rotate: 360 }}
          transition={{
            opacity: { delay: 0.5 + i * 0.1 },
            rotate: { duration: 30 + i * 5, repeat: Infinity, ease: "linear" },
          }}
          style={{ originX: `${x}px`, originY: `${y}px` }}
        >
          <circle cx={x} cy={y} r="8" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <circle cx={x} cy={y} r="4" fill={fillColor} />
        </motion.g>
      ))}
    </g>
  );
}

// Gond-inspired patterns (dots, lines, organic shapes)
function GondPattern({ color, opacity }: { color: string; opacity: number }) {
  const fillColor = color;
  const strokeColor = color;

  return (
    <g>
      {/* Central organic flower */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: opacity, scale: 1, rotate: 360 }}
        transition={{
          opacity: { duration: 1 },
          scale: { duration: 1.5, ease: [0.16, 1, 0.3, 1] },
          rotate: { duration: 60, repeat: Infinity, ease: "linear" },
        }}
        style={{ originX: "100px", originY: "100px" }}
      >
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 100 + Math.cos(rad) * 15;
          const y1 = 100 + Math.sin(rad) * 15;
          const x2 = 100 + Math.cos(rad) * 35;
          const y2 = 100 + Math.sin(rad) * 35;
          return (
            <motion.ellipse
              key={i}
              cx={(x1 + x2) / 2}
              cy={(y1 + y2) / 2}
              rx="8"
              ry="20"
              fill={fillColor}
              opacity={opacity * 0.8}
              transform={`rotate(${angle}, ${(x1 + x2) / 2}, ${(y1 + y2) / 2})`}
              animate={{ opacity: [opacity * 0.8, opacity * 0.4, opacity * 0.8] }}
              transition={{ duration: 3, delay: i * 0.15, repeat: Infinity }}
            />
          );
        })}
        <circle cx="100" cy="100" r="12" fill={fillColor} opacity={opacity} />
      </motion.g>

      {/* Dot patterns */}
      {Array.from({ length: 40 }).map((_, i) => {
        const angle = (i * 360) / 40;
        const rad = (angle * Math.PI) / 180;
        const dist = 55 + (i % 2) * 10;
        const x = 100 + Math.cos(rad) * dist;
        const y = 100 + Math.sin(rad) * dist;
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="2"
            fill={fillColor}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, opacity, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              delay: i * 0.05,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        );
      })}

      {/* Corner decorative elements */}
      {[[30, 30], [170, 30], [30, 170], [170, 170]].map(([x, y], i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: opacity }}
          transition={{ delay: 0.8 + i * 0.1 }}
        >
          {[0, 120, 240].map((angle, j) => {
            const rad = ((angle + i * 30) * Math.PI) / 180;
            const px = x + Math.cos(rad) * 8;
            const py = y + Math.sin(rad) * 8;
            return <circle key={j} cx={px} cy={py} r="2.5" fill={fillColor} opacity={opacity * 0.9} />;
          })}
        </motion.g>
      ))}
    </g>
  );
}

// Geometric tribal patterns
function GeometricPattern({ color, opacity }: { color: string; opacity: number }) {
  const strokeColor = color;

  return (
    <g>
      {/* Central mandala-like pattern */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: opacity, scale: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {[0, 1, 2, 3, 4].map((ring) => {
          const r = 20 + ring * 15;
          return (
            <motion.circle
              key={ring}
              cx="100"
              cy="100"
              r={r}
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.5"
              opacity={opacity * (1 - ring * 0.15)}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: ring * 0.2, ease: "easeOut" }}
            />
          );
        })}
      </motion.g>

      {/* Triangular rays */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 100 + Math.cos(rad) * 80;
        const y1 = 100 + Math.sin(rad) * 80;
        const x2 = 100 + Math.cos(rad + 0.2) * 65;
        const y2 = 100 + Math.sin(rad + 0.2) * 65;
        const x3 = 100 + Math.cos(rad - 0.2) * 65;
        const y3 = 100 + Math.sin(rad - 0.2) * 65;
        return (
          <motion.polygon
            key={i}
            points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
            fill={strokeColor}
            opacity={opacity * 0.6}
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              scale: { duration: 2, delay: 1 + i * 0.05, repeat: Infinity, repeatDelay: 2 },
            }}
            style={{ originX: "100px", originY: "100px" }}
          />
        );
      })}
    </g>
  );
}

// Organic flowing patterns
function OrganicPattern({ color, opacity }: { color: string; opacity: number }) {
  const fillColor = color;
  const strokeColor = color;

  return (
    <g>
      {/* Flowing curves */}
      <motion.path
        d="M 50 100 Q 75 60, 100 100 T 150 100"
        fill="none"
        stroke={strokeColor}
        strokeWidth="3"
        opacity={opacity}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      <motion.path
        d="M 100 50 Q 140 75, 100 100 T 100 150"
        fill="none"
        stroke={strokeColor}
        strokeWidth="3"
        opacity={opacity}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 0.3, ease: "easeInOut" }}
      />

      {/* Organic leaf-like shapes */}
      {[0, 90, 180, 270].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = 100 + Math.cos(rad) * 50;
        const y = 100 + Math.sin(rad) * 50;
        return (
          <motion.ellipse
            key={i}
            cx={x}
            cy={y}
            rx="15"
            ry="30"
            fill={fillColor}
            opacity={opacity * 0.5}
            transform={`rotate(${angle + 45}, ${x}, ${y})`}
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 3, delay: i * 0.2, repeat: Infinity, repeatDelay: 1 }}
          />
        );
      })}

      {/* Central dot cluster */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 360) / 8;
        const rad = (angle * Math.PI) / 180;
        const x = 100 + Math.cos(rad) * 20;
        const y = 100 + Math.sin(rad) * 20;
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="4"
            fill={fillColor}
            opacity={opacity}
            animate={{ r: [4, 6, 4] }}
            transition={{ duration: 2, delay: i * 0.15, repeat: Infinity }}
          />
        );
      })}
    </g>
  );
}

/* ═══════════════════════════════════════
   Animated Tribal Border
   ═══════════════════════════════════════ */

interface TribalBorderProps {
  color?: string;
  opacity?: number;
  thickness?: number;
  className?: string;
}

export function TribalBorder({
  color = "#1A5C1A",
  opacity = 0.2,
  thickness = 60,
  className = "",
}: TribalBorderProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Top border pattern */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex"
        style={{ height: thickness }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: opacity, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="flex-1"
            style={{
              background: `repeating-linear-gradient(45deg, ${color}00 0px, ${color}${Math.floor(opacity * 100)} ${thickness / 4}px, ${color}00 ${thickness / 2}px)`,
            }}
            animate={{ backgroundPosition: ["0px 0px", `${thickness}px ${thickness}px`] }}
            transition={{ duration: 20, delay: i * 0.1, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </motion.div>

      {/* Bottom border pattern */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 flex"
        style={{ height: thickness }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: opacity, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="flex-1"
            style={{
              background: `repeating-linear-gradient(-45deg, ${color}00 0px, ${color}${Math.floor(opacity * 100)} ${thickness / 4}px, ${color}00 ${thickness / 2}px)`,
            }}
            animate={{ backgroundPosition: ["0px 0px", `-${thickness}px ${thickness}px`] }}
            transition={{ duration: 20, delay: i * 0.1, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Animated Dot Matrix (Tribal style)
   ═══════════════════════════════════════ */

interface TribalDotsProps {
  color?: string;
  opacity?: number;
  density?: number;
  className?: string;
}

export function TribalDots({
  color = "#1A5C1A",
  opacity = 0.15,
  density = 30,
  className = "",
}: TribalDotsProps) {
  const dots = Array.from({ length: density }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
  }));

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <svg className="w-full h-full" preserveAspectRatio="none">
        {dots.map((dot, i) => (
          <motion.circle
            key={i}
            cx={`${dot.x}%`}
            cy={`${dot.y}%`}
            r={dot.size}
            fill={color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, opacity, opacity, 0],
              scale: [0, 1, 1, 0],
            }}
            transition={{
              duration: dot.duration,
              delay: dot.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
}
