"use client";

import { useState } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
}

const options = [
  { id: "Yes", label: "Yes, I prefer earning it" },
  { id: "No", label: "No, I prefer chance" },
];

export default function RecognitionStep({ value, onChange, onNext }: Props) {
  const [selected, setSelected] = useState(value);

  function handleSelect(id: string) {
    setSelected(id);
    onChange(id);
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
        Is earning recognition and rewards through effort more appealing than relying on chance?*
      </h2>

      <div className="flex gap-3 w-full">
        {options.map((opt) => (
          <button
            key={opt.id}
            className={`choice-btn flex-1 text-center${selected === opt.id ? " selected" : ""}`}
            onClick={() => handleSelect(opt.id)}
          >
            {opt.label}
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
