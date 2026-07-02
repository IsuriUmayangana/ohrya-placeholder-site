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
    { bgColor: string; glow: string; borderStart: string; borderEnd: string; starColor: string; mobileBg: string; mobileGradient: string; mobileScoreTextColor: string }
  > = {
    1: { bgColor: "#FFD700", glow: "rgba(255,215,0,0.35)", borderStart: "#fee28e", borderEnd: "#c79300", starColor: "#bd8901", mobileBg: "bg-[#4E3F06]", mobileGradient: "bg-gradient-to-b from-[#FFE397] to-[#C89200]", mobileScoreTextColor: "text-[#FFC62B]" },
    2: { bgColor: "#c0392b", glow: "rgba(192,57,43,0.3)",  borderStart: "#ff9192", borderEnd: "#ff2627",  starColor: "#ff412b", mobileBg: "bg-[#122A3E]", mobileGradient: "bg-gradient-to-b from-[#6098AE] to-[#0A1B29]", mobileScoreTextColor: "text-[#FFC62B]" },
    3: { bgColor: "#7d3c98", glow: "rgba(125,60,152,0.3)", borderStart: "#c99cff", borderEnd: "#8e3af0", starColor: "#8a38f6", mobileBg: "bg-[#122A3E]", mobileGradient: "bg-gradient-to-b from-[#6098AE] to-[#0A1B29]", mobileScoreTextColor: "text-[#FFC62B]" },
  };

  export const RANK_BADGE_COLOR = "#3b82e0";
  export const RANK_BADGE_BORDER_COLOR = "#6098AE";
  export const RANK_BADGE_GRADIENT_COLOR = "#3b82e0";

