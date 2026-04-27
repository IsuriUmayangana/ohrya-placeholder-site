"use client";

import { useState } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function ShineStep({ value, onChange }: Props) {
  const [selected, setSelected] = useState(value);

  function handleSelect(opt: string) {
    setSelected(opt);
    onChange(opt);
  }

  return (
    <div className="flex flex-col items-center gap-8 px-6 w-full max-w-xl mx-auto">
      {/* Heading */}
      <h2 className="text-[20px] lg:text-[28px] font-normal leading-[26px] lg:leading-[36px] tracking-[-0.25px] lg:tracking-[-0.5px] "
      >
        Will you <strong>SHINE</strong> by sharing your unique link to inspire your network to make their own impact?*
      </h2>

      {/* Options */}
      <div className="flex gap-3 w-full flex-col md:flex-row">
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

    </div>
  );
}
