"use client";

import { useState } from "react";
import StepButton from "../ui/StepButton";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const options = ["Yes", "Not Yet"];

export default function GiveStep({ value, onChange }: Props) {
  const [selected, setSelected] = useState(value);

  function handleSelect(opt: string) {
    setSelected(opt);
    onChange(opt);
  }

  return (
    <div className="flex flex-col items-center gap-8 px-6 w-full max-w-xl mx-auto">
      {/* Heading */}
      <div className="flex max-w-4xl flex-col items-center gap-3 text-center">
        <h2
          className="text-[20px] lg:text-[28px] font-normal leading-[26px] lg:leading-[36px] tracking-[-0.25px] lg:tracking-[-0.5px] lg:whitespace-nowrap text-balance"
        >
          After watching the video, will you{" "}
          <strong>GIVE</strong> to a campaign?*
        </h2>
        <p className="text-[16px] lg:text-[18px] leading-[22px] lg:leading-[24px] text-thin-text tracking-[0px] lg:tracking-[0.5px] text-[#2d2d2d]">
          (by registering or donating to advocate)
        </p>
      </div>

      {/* Options */}
      <div className="flex gap-3 w-full flex-col md:flex-row">
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

    </div>
  );
}
