"use client";

interface Props {
  score: number;
  variant: "brilliant" | "almost" | "welldone";
}

const messages = {
  brilliant: { prefix: "Brilliant!", suffix: "points so far" },
  almost: { prefix: "Almost there!", suffix: "points so far" },
  welldone: { prefix: "Well done!", suffix: "points in total" },
};

export default function ScoreStep({ score, variant }: Props) {
  const { prefix, suffix } = messages[variant];

  return (
    <div className="flex flex-col items-center gap-10 px-6 text-center">
      {/* Heading */}
      <p className="text-[20px] lg:text-[28px] font-normal leading-[26px] lg:leading-[36px] tracking-[-0.25px] lg:tracking-[-0.5px] lg:whitespace-nowrap text-balance">
        <strong>{prefix}</strong> You have scored {score} {suffix}
      </p>
    </div>
  );
}
