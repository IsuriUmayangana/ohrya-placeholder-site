const SIZE_TEXT_CLASSES: Record<number, string> = {
  30: "pt-[1.8px] text-[12.6px]",
  34: "pt-[2.04px] text-[14.28px]",
};

export function RankBadge({
    rank,
    color,
    borderColor,
    gradientColor,
    size = 30,
  }: {
    rank: number;
    color: string;
    borderColor: string;
    size?: number;
    gradientColor: string;
  }) {
    const textSizeClass = SIZE_TEXT_CLASSES[size] ?? SIZE_TEXT_CLASSES[30];
  
    return (
      <div className="relative shrink-0">
        {/* BORDER STAR */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          className="absolute inset-0"
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="none"
            stroke={borderColor}
            strokeWidth="2"
            strokeLinejoin="round"
          />
  
          <defs>
            <linearGradient id="starGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={gradientColor} />
            </linearGradient>
          </defs>
        </svg>
  
        {/* FILLED STAR */}
        <svg width={size} height={size} viewBox="0 0 24 24" className="relative">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
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
