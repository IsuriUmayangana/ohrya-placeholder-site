"use client";

import { useState } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onNext: (val: string) => void;
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
    onNext(id);
  }

  return (
    <div className="flex flex-col items-center gap-8 px-6 w-full max-w-xl mx-auto">
      {/* Heading */}
      <h2 className="text-[20px] lg:text-[28px] font-normal leading-[26px] lg:leading-[36px] tracking-[-0.25px] lg:tracking-[-0.5px] text-balance"
      >
        Is earning recognition and rewards through effort more appealing than relying on chance?*
      </h2>

      {/* Options */}
      <div className="flex gap-3 w-full flex-col md:flex-row">
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

    </div>
  );
}
