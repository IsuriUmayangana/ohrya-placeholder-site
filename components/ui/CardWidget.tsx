"use client";

import React from "react";
import Link from "next/link";
import useCountUp from "@/hooks/useCountUp";

type CardTheme = "blue" | "teal" | "combined";
type CardVariant = "solid" | "outline";
type iconType = "submissions" | "score" | "time";

function AnimatedStat({ value }: { value: string | number }) {
    const raw = String(value);
    const match = raw.match(/^([^\d]*)(\d[\d,.]*)(.*)$/);
    
    const numeric = match ? parseFloat(match[2].replace(/,/g, "")) : NaN;
    const isInteger = Number.isInteger(numeric);
  
    // Hook always called unconditionally at top level
    const animated = useCountUp(!isNaN(numeric) ? numeric : 0, 1200);
  
    if (!match || isNaN(numeric)) return <>{raw}</>;
  
    const [, prefix, , suffix] = match;
    const formatted = isInteger ? animated.toLocaleString() : animated.toFixed(1);
  
    return <>{prefix}{formatted}{suffix}</>;
  }

const icon: Record<iconType, React.ReactNode> = {
  submissions: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  ),
  score: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  ),
  time: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
};

type CardWidgetProps = {
  title: string;
  value: number | string;
  icons?: iconType;
  badge?: string;
  subtitle?: string;
  theme?: CardTheme;
  variant?: CardVariant;
  href?: string;
};

const themes: Record<
  CardTheme,
  {
    bg: string;
    title: string;
    value: string;
    badge: string;
    badgeText: string;
    subtitle: string;
    iconBtn: string;
  }
> = {
    blue: {
        bg: "from-[#5a9aaa]/50 to-[#4a8798]/50",
        title: "text-[#3d6b76]",
        value: "text-[#2d2d2d]",
        badge: "bg-[#e8f4f7]",
        badgeText: "text-[#3d6b76]",
        subtitle: "text-[#7aabb8]",
        iconBtn: "bg-[#e8f4f7] text-[#5a9aaa] hover:bg-[#d0eaf0]",
    },
    teal: {
        bg: "from-[#c9a84c]/50 to-[#a8892e]/50",
        title: "text-[#7a6020]",
        value: "text-[#2d2d2d]",
        badge: "bg-[#fdf6e3]",
        badgeText: "text-[#7a6020]",
        subtitle: "text-[#c9a84c]",
        iconBtn: "bg-[#fdf6e3] text-[#c9a84c] hover:bg-[#faedc4]",
    },
    combined: {
        bg: "from-[#5a9aaa]/50 via-[#a9d0da]/50 to-[#c9a84c]/50",
        title: "text-[#3d6b76]",
        value: "text-[#2d2d2d]",
        badge: "bg-[#e8f4f7]",
        badgeText: "text-[#3d6b76]",
        subtitle: "text-[#7aabb8]",
        iconBtn: "bg-[#e8f4f7] text-[#5a9aaa] hover:bg-[#d0eaf0]",
    },
};

const ArrowIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
    />
  </svg>
);

export default function CardWidget({
  title,
  value,
  icons,
  badge,
  subtitle,
  theme = "blue",
  variant = "solid",
  href,
}: CardWidgetProps) {
  const t = themes[theme];

  // SOLID (gradient card)
  if (variant === "solid") {
    return (
        <div
        className={`relative overflow-hidden bg-gradient-to-b ${t.bg} p-5 rounded-2xl h-[150px] w-full flex flex-col justify-between`}
      >
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-34 h-34 rounded-full -translate-y-8 translate-x-8 opacity-30"
            style={{ background: theme === "teal" ? "#fdf6e3" : "#e8f4f7" }} />
        <div className="absolute top-0 right-0 w-36 h-36 rounded-full border opacity-20 -translate-y-9 translate-x-9"
            style={{ borderColor: theme === "teal" ? "#c9a84c" : "#5a9aaa" }} />

        <div className="relative z-10 flex flex-col justify-between h-full">
            {/* Top */}
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <div className="flex items-center gap-2">
                    {icons && icon[icons]}
                </div>
            </div>

            {/* Bottom */}
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-5xl md:text-4xl pl-5 md:pl-2 font-medium text-gray-900">
                        <AnimatedStat value={value} />
                    </span>
                    {badge && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {badge}
                        </span>
                    )}
                </div>
                {subtitle && (
                    <p className="text-xs text-gray-500">{subtitle}</p>
                )}
            </div>
        </div>
      </div>
    );
  }

  // OUTLINE (white + gradient border)
  return (
    <div className={`h-[150px] w-full p-[1.5px] rounded-2xl bg-gradient-to-b ${t.bg}`}>
      
      <div className="relative overflow-hidden bg-white rounded-2xl h-full w-full p-5 flex flex-col justify-between">

        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-34 h-34 rounded-full -translate-y-8 translate-x-8 opacity-60"
            style={{ background: theme === "teal" ? "#fdf6e3" : "#e8f4f7" }} />
        <div className="absolute top-0 right-0 w-36 h-36 rounded-full border opacity-20 -translate-y-9 translate-x-9"
            style={{ borderColor: theme === "teal" ? "#c9a84c" : "#5a9aaa" }} />

        <div className="relative z-10 flex flex-col justify-between h-full">
          
          {/* Top */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center gap-2">
                {icons && icon[icons]}
            </div>
          </div>
  
          {/* Bottom */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-5xl md:text-4xl pl-5 md:pl-2 font-medium text-gray-900">
                <AnimatedStat value={value} />
              </span>
              {badge && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
  
        </div>
      </div>
    </div>
  );
}