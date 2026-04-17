"use client";

// Precomputed line coordinates to avoid server/client floating-point hydration mismatch
const RAYS = Array.from({ length: 24 }).map((_, i) => {
  const angle = (i * 360) / 24;
  const rad = (angle * Math.PI) / 180;
  const isMain = i % 2 === 0;
  const inner = isMain ? 28 : 34;
  const outer = isMain ? 48 : 44;
  return {
    x1: Math.round((50 + inner * Math.cos(rad)) * 1000) / 1000,
    y1: Math.round((50 + inner * Math.sin(rad)) * 1000) / 1000,
    x2: Math.round((50 + outer * Math.cos(rad)) * 1000) / 1000,
    y2: Math.round((50 + outer * Math.sin(rad)) * 1000) / 1000,
    strokeWidth: isMain ? "3.5" : "2",
  };
});

export default function OhryaLogo() {
  return (
    <div className="flex items-center gap-2 justify-center">
      <svg
        width="38"
        height="38"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {RAYS.map((ray, i) => (
          <line
            key={i}
            x1={ray.x1}
            y1={ray.y1}
            x2={ray.x2}
            y2={ray.y2}
            stroke="#c9a84c"
            strokeWidth={ray.strokeWidth}
            strokeLinecap="round"
          />
        ))}
        <circle cx="50" cy="50" r="14" fill="#c9a84c" />
      </svg>
      <span
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "1.6rem",
          letterSpacing: "0.25em",
          color: "#2d2d2d",
          fontWeight: "400",
        }}
      >
        OHRYA
      </span>
    </div>
  );
}
