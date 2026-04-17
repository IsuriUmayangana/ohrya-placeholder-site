"use client";

import { useState } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
}

const amounts = ["$25", "$50", "$75", "$100", "$150", "$200"];

export default function DonationStep({ value, onChange, onNext }: Props) {
  const [selected, setSelected] = useState(value);

  function handleSelect(amt: string) {
    setSelected(amt);
    onChange(amt);
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
        }}
      >
        If you chose to donate, what amount feels right?*
      </h2>

      <div className="grid grid-cols-3 gap-3 w-full">
        {amounts.map((amt) => (
          <button
            key={amt}
            className={`choice-btn text-center${selected === amt ? " selected" : ""}`}
            onClick={() => handleSelect(amt)}
          >
            {amt}
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
