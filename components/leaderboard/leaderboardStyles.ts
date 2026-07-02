export const AVATAR_COLORS = [
    "#5a9aaa", "#c9a84c", "#e74c3c", "#9b59b6",
    "#27ae60", "#e67e22", "#3498db", "#e91e63",
  ];
  
  export function avatarColor(name: string): string {
    let n = 0;
    for (const c of name) n += c.charCodeAt(0);
    return AVATAR_COLORS[n % AVATAR_COLORS.length];
  }
  
  export const RANK_STYLE: Record<
    number,
    { badge: string; glow: string; border: string; starColor: string }
  > = {
    1: { badge: "#FFD700", glow: "rgba(255,215,0,0.35)", border: "rgba(255,215,0,0.45)", starColor: "#FFD700" },
    2: { badge: "#c0392b", glow: "rgba(192,57,43,0.3)",  border: "rgba(231,76,60,0.4)",  starColor: "#e74c3c" },
    3: { badge: "#7d3c98", glow: "rgba(125,60,152,0.3)", border: "rgba(155,89,182,0.4)", starColor: "#9b59b6" },
  };

  export const RANK_BADGE_COLOR = "#3b82e0";
  export const RANK_BADGE_BORDER_COLOR = "#6098AE";
  export const RANK_BADGE_GRADIENT_COLOR = "#3b82e0";

  // Tailwind gradient classes for the mobile podium row background, per rank.
// Tints toward the rank color, then blends into the standard card base (#122A3E).
export const RANK_ROW_GRADIENT: Record<number, string> = {
  1: "bg-gradient-to-r from-[#3a2f0a] to-[#122A3E]",
  2: "bg-gradient-to-r from-[#3a1512] to-[#122A3E]",
  3: "bg-gradient-to-r from-[#251530] to-[#122A3E]",
};