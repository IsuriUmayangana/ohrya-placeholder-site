"use client";

interface Props {
  score: number;
  variant: "brilliant" | "almost" | "welldone";
  onNext: () => void;
}

const messages = {
  brilliant: { prefix: "Brilliant!", suffix: "points so far" },
  almost: { prefix: "Almost there!", suffix: "points so far" },
  welldone: { prefix: "Well done!", suffix: "points in total" },
};

export default function ScoreStep({ score, variant, onNext }: Props) {
  const { prefix, suffix } = messages[variant];

  return (
    <div className="flex flex-col items-center gap-10 px-6 text-center">
      <p
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "clamp(1.2rem, 2.8vw, 1.6rem)",
          color: "#2d2d2d",
        }}
      >
        <strong>{prefix}</strong> You have scored {score} {suffix}
      </p>
      <button className="btn-primary" onClick={onNext} style={{ minWidth: 120 }}>
        Continue
      </button>
    </div>
  );
}
