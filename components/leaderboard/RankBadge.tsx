import { useId } from "react";
import { STAR_PATH } from "./StarIcon";

const SIZE_TEXT_CLASSES: Record<number, string> = {
  30: "text-[12.6px]",
  34: "text-[14.28px]",
};

export function RankBadge({
  rank,
  color,
  firstColor,
  secondColor,
  size = 30,
  textSize,
}: {
  rank: number;
  color: string;
  firstColor: string;
  secondColor: string;
  size?: number;
  textSize?: number;
}) {
  const textSizeClass = textSize
    ? undefined
    : (SIZE_TEXT_CLASSES[size] ?? SIZE_TEXT_CLASSES[30]);

  // Unique per instance so multiple RankBadges on the same page
  // don't collide on the same gradient id.
  const gradientId = useId();

  // 5-point stars sit high in the box — nudge text into the visual center.
  const opticalNudgeY = size * 0.06;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* STROKE STAR */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={firstColor} />
            <stop offset="100%" stopColor={secondColor} />
          </linearGradient>
        </defs>

        {/* STROKE STAR */}
        <path
          d={STAR_PATH}
          transform="translate(12 12) scale(0.92) translate(-12 -12)"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>

      {/* FILLED STAR */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="absolute inset-0"
      >
        <path
          d={STAR_PATH}
          transform="translate(12 12) scale(0.92) translate(-12 -12)"
          fill={color}
        />
      </svg>

      {/* TEXT */}
      <div
        className={`absolute inset-0 flex items-center justify-center font-extrabold leading-none text-white ${textSizeClass ?? ""}`}
        style={textSize ? { fontSize: textSize } : undefined}
      >
        <span style={{ transform: `translateY(${opticalNudgeY}px)` }}>{rank}</span>
      </div>
    </div>
  );
}
