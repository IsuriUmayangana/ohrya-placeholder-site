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
  { cardHeight: string; bgColor: string; rankBoarder: string; glow: string; borderStart: string; borderEnd: string; starColor: string; mobileBg: string; mobileGradient: string; mobileScoreTextColor: string }
> = {
  1: { cardHeight: "318px", bgColor: "#2F2606", rankBoarder: "#FFC62B", glow: "rgba(255,215,0,0.35)", borderStart: "#FFE397", borderEnd: "#C89200", starColor: "#BC8900", mobileBg: "bg-[#2F2606]", mobileGradient: "bg-gradient-to-b from-[#FFE397] to-[#C89200]", mobileScoreTextColor: "text-[#FFC62B]" },
  3: { cardHeight: "256px", bgColor: "#221616", rankBoarder: "#FF7676", glow: "rgba(192,57,43,0.3)", borderStart: "#FF9595", borderEnd: "#FFD9D9", starColor: "#E78669", mobileBg: "bg-[#221616]", mobileGradient: "bg-gradient-to-b from-[#FF7676] to-[#6A0707]", mobileScoreTextColor: "text-[#FFC62B]" },
  2: { cardHeight: "256px", bgColor: "#212427", rankBoarder: "#FFFFFF", glow: "rgba(125,60,152,0.3)", borderStart: "#FFFFFF", borderEnd: "#B6B6B6", starColor: "#6B6B6B", mobileBg: "bg-[#212427]", mobileGradient: "bg-gradient-to-b from-[#FFFFFF] to-[#3B3B3B]", mobileScoreTextColor: "text-[#FFC62B]" },
};

export const RANK_BADGE_COLOR = "#3b82e0";
export const RANK_BADGE_BORDER_COLOR = "#6098AE";
export const RANK_BADGE_GRADIENT_COLOR = "#3b82e0";

