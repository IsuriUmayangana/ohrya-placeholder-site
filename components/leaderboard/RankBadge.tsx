import { useId } from "react";

const SIZE_TEXT_CLASSES: Record<number, string> = {
  30: "pt-[1.8px] text-[12.6px]",
  34: "pt-[2.04px] text-[14.28px]",
};

const STAR_PATH =
  "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

export function RankBadge({
  rank,
  color,
  firstColor,
  secondColor,
  size = 30,
}: {
  rank: number;
  color: string;
  firstColor: string;
  secondColor: string;
  size?: number;
}) {
  const textSizeClass = SIZE_TEXT_CLASSES[size] ?? SIZE_TEXT_CLASSES[30];

  // Unique per instance so multiple RankBadges on the same page
  // don't collide on the same gradient id.
  const gradientId = useId();

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
          strokeWidth="2"
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
        className={`absolute inset-0 flex items-center justify-center font-extrabold text-white ${textSizeClass}`}
      >
        {rank}
      </div>
    </div>
  );
}