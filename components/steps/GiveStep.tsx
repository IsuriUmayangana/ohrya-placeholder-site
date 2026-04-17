"use client";

import { useState } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
}

const options = ["Yes", "Not Yet"];

export default function GiveStep({ value, onChange, onNext }: Props) {
  const [selected, setSelected] = useState(value);

  function handleSelect(opt: string) {
    setSelected(opt);
    onChange(opt);
  }

  return (
    <div className="flex flex-col items-center gap-8 px-6 w-full max-w-xl mx-auto">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
            fontWeight: "400",
            color: "#2d2d2d",
          }}
        >
          After watching the video, will you{" "}
          <strong>GIVE</strong> to a campaign?*
        </h2>
        <p style={{ fontFamily: "Georgia, serif", fontSize: "0.9rem", color: "#777" }}>
          (by registering or donating to advocate)
        </p>
      </div>

      <div className="flex gap-3 w-full">
        {options.map((opt) => (
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
