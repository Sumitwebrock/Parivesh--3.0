interface DecorativePatternProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  size?: "sm" | "md" | "lg";
  opacity?: number;
}

export function DecorativePattern({
  position = "top-right",
  size = "md",
  opacity = 0.05,
}: DecorativePatternProps) {
  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-48 h-48",
    lg: "w-64 h-64",
  };

  const positionClasses = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
  };

  return (
    <div
      className={`absolute ${positionClasses[position]} ${sizeClasses[size]} pointer-events-none`}
      style={{ opacity }}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Rangoli-inspired pattern */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="#1A5C1A"
          strokeWidth="0.5"
        />
        <circle
          cx="100"
          cy="100"
          r="60"
          fill="none"
          stroke="#1A5C1A"
          strokeWidth="0.5"
        />
        <circle
          cx="100"
          cy="100"
          r="40"
          fill="none"
          stroke="#1A5C1A"
          strokeWidth="0.5"
        />
        <circle
          cx="100"
          cy="100"
          r="20"
          fill="none"
          stroke="#1A5C1A"
          strokeWidth="0.5"
        />
        <path
          d="M100 20 L180 100 L100 180 L20 100 Z"
          fill="none"
          stroke="#1A5C1A"
          strokeWidth="0.5"
        />
        <path
          d="M100 40 L160 100 L100 160 L40 100 Z"
          fill="none"
          stroke="#1A5C1A"
          strokeWidth="0.5"
        />
        {/* Leaf motifs */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <path
            key={angle}
            d={`M100 100 L${100 + 70 * Math.cos((angle * Math.PI) / 180)} ${
              100 + 70 * Math.sin((angle * Math.PI) / 180)
            }`}
            stroke="#1A5C1A"
            strokeWidth="0.3"
          />
        ))}
      </svg>
    </div>
  );
}
