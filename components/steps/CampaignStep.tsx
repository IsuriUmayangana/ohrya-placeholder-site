"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const campaigns = [
  {
    id: "Children",
    label: "Children",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=260&fit=crop&auto=format",
    alt: "Children with colorful painted hands",
  },
  {
    id: "Animals",
    label: "Animals",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=260&fit=crop&auto=format",
    alt: "Dog looking at camera",
  },
  {
    id: "Veterans",
    label: "Veterans",
    image: "https://images.unsplash.com/photo-1541802645635-11f2286a7482?w=400&h=260&fit=crop&auto=format",
    alt: "Veterans in military uniform",
  },
];

export default function CampaignStep({ value, onChange }: Props) {
  const [selected, setSelected] = useState(value);

  function handleSelect(id: string) {
    setSelected(id);
    onChange(id);
  }

  return (
    <div className="flex flex-col items-center gap-8 px-4 w-full max-w-4xl mx-auto">
      {/* Heading */}
      <h2
        className="text-[20px] md:text-[26px] lg:text-[28px] font-normal leading-[26px] lg:leading-[36px] tracking-[-0.25px] lg:tracking-[-0.5px]"
      >
        Which campaign inspires you the most?*
      </h2>

      {/* Campaigns */}
      <div className="grid lg:grid-cols-3 md:grid-cols-3 grid-cols-2 gap-4 lg:gap-6 w-full">
        {campaigns.map((c) => (
          <button
            key={c.id}
            onClick={() => handleSelect(c.id)}
            className={`image-choice flex flex-col items-center ${selected === c.id ? "selected" : ""}`}
          >
            <div className="w-full h-full aspect-square lg:aspect-video md:aspect-video relative">
              <Image
                src={c.image}
                alt={c.alt}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 33vw, 200px"
              />
            </div>
            <span
              className="text-[16px] lg:text-[18px] leading-[22px] lg:leading-[24px] text-thin-text tracking-[0px] lg:tracking-[0.5px]"
            >
              {c.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}