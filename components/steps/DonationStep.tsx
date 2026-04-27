"use client";

import { useState } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const amounts = ["$25", "$50", "$75", "$100", "$150", "$200"];

export default function DonationStep({ value, onChange }: Props) {
  const [selected, setSelected] = useState(value);

  function handleSelect(amt: string) {
    setSelected(amt);
    onChange(amt);
  }

  return (
    <div className="flex flex-col items-center gap-8 px-6 w-full max-w-xl mx-auto">
      {/* Heading */}
      <h2 className="text-[20px] lg:text-[28px] font-normal leading-[26px] lg:leading-[36px] tracking-[-0.25px] lg:tracking-[-0.5px] lg:whitespace-nowrap "
      >
        If you chose to donate, what amount feels right?*
      </h2>

      {/* Amount Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
        {amounts.map((amt) => (
          <button
            key={amt}
            className={`choice-btn w-full text-center${selected === amt ? " selected" : ""}`}
            onClick={() => handleSelect(amt)}
          >
            {amt}
          </button>
        ))}
      </div>
    </div>
  );
}
