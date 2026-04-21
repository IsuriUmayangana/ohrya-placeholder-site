"use client";

import { useState, useRef, useEffect } from "react";

const DEVICES = ["All devices", "Desktop", "Mobile", "Tablet", "Other"];

interface Props {
  value: string;
  onChange: (device: string) => void;
}

export default function DeviceFilter({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function select(d: string) {
    onChange(d);
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "white", border: "1px solid #e0e8ec",
          borderRadius: 7, padding: "7px 14px",
          fontFamily: "Georgia, serif", fontSize: "0.85rem", color: "#444",
          cursor: "pointer", whiteSpace: "nowrap",
        }}
      >
        {/* Device icon */}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="4" width="14" height="10" rx="2" stroke="#888" strokeWidth="1.8"/>
          <path d="M16 9h4a2 2 0 012 2v5a2 2 0 01-2 2H2a2 2 0 01-2-2v-1" stroke="#888" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M8 20h8" stroke="#888" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        {value}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 2 }}>
          <path d="M6 9l6 6 6-6" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 100,
          background: "white", borderRadius: 10, minWidth: 160,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid #e8f0f2",
          overflow: "hidden",
        }}>
          {DEVICES.map((d) => (
            <button key={d} onClick={() => select(d)}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "11px 18px", border: "none", cursor: "pointer",
                fontFamily: "Georgia, serif", fontSize: "0.85rem",
                background: value === d ? "#f0f8fa" : "white",
                color: value === d ? "#5a9aaa" : "#444",
                fontWeight: value === d ? "bold" : "normal",
              }}
            >
              {d}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
