"use client";

import { useState } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
}

export default function VoteStep({ value, onChange, onNext }: Props) {
  const [selected, setSelected] = useState(value);

  function handleSelect(opt: string) {
    setSelected(opt);
    onChange(opt);
  }

  return (
    <div className="flex flex-col items-center gap-8 px-6 w-full max-w-xl mx-auto">
      <h2
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
          fontWeight: "400",
          color: "#2d2d2d",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        Will you <strong>VOTE</strong> for a vetted nonprofit to receive the pooled funding in the campaign you support?*
      </h2>

      <div className="flex gap-3 w-full">
        {["Yes", "No"].map((opt) => (
          <button
            key={opt}
            className={`choice-btn flex-1 text-center${selected === opt ? " selected" : ""}`}
            onClick={() => handleSelect(opt)}
          >
            {opt}
          </button>
        ))}
      </div>

      <button
        className="btn-primary"
        onClick={onNext}
        disabled={!selected}
        style={{ minWidth: 100, opacity: selected ? 1 : 0.5 }}
      >
        OK
      </button>
    </div>
  );
}
