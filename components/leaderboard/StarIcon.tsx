/** Softly rounded 5-point star (viewBox 0 0 24 24). */
export const STAR_PATH =
  "M12 2.55c.32 0 .6.18.74.46l2.42 5.05c.1.2.28.34.5.4l5.48.8c.7.1.98.96.47 1.45l-4.1 4c-.16.16-.24.38-.2.6l.97 5.45c.12.7-.6 1.24-1.25.9l-4.8-2.52c-.2-.1-.44-.1-.64 0l-4.8 2.52c-.65.34-1.37-.2-1.25-.9l.97-5.45c.04-.22-.04-.44-.2-.6l-4.1-4c-.51-.49-.23-1.35.47-1.45l5.48-.8c.22-.06.4-.2.5-.4l2.42-5.05c.14-.28.42-.46.74-.46z";

export function StarIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d={STAR_PATH} />
    </svg>
  );
}
