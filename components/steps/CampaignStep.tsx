"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
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

export default function CampaignStep({ value, onChange, onNext }: Props) {
  const [selected, setSelected] = useState(value);

  function handleSelect(id: string) {
    setSelected(id);
    onChange(id);
  }

  return (
    <div className="flex flex-col items-center gap-8 px-4 w-full max-w-2xl mx-auto">
      <h2
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
          fontWeight: "400",
          color: "#2d2d2d",
          textAlign: "center",
        }}
      >
        Which campaign inspires you the most?*
      </h2>

      <div className="grid grid-cols-3 gap-4 w-full">
        {campaigns.map((c) => (
          <button
            key={c.id}
            onClick={() => handleSelect(c.id)}
            className={`image-choice flex flex-col items-center ${selected === c.id ? "selected" : ""}`}
            style={{ background: "none", padding: 0, border: selected === c.id ? "2px solid #5a9aaa" : "2px solid #d0d9dc" }}
          >
            <div style={{ width: "100%", aspectRatio: "3/2", position: "relative" }}>
              <Image
                src={c.image}
                alt={c.alt}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 33vw, 200px"
              />
            </div>
            <span
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "0.9rem",
                color: "#5a9aaa",
                padding: "10px 0 8px",
              }}
            >
              {c.label}
            </span>
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
