"use client";

import { useState } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
}

export default function EmailStep({ value, onChange, onNext }: Props) {
  const [email, setEmail] = useState(value);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    onChange(e.target.value);
    setError("");
  }

  function handleSubmit() {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    onNext();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
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
          Want to hear when the first campaigns go live?*
        </h2>
        <p style={{ fontFamily: "Georgia, serif", fontSize: "0.9rem", color: "#777" }}>
          Register with your email now
        </p>
      </div>

      <div className="w-full flex flex-col gap-1">
        <input
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            width: "100%",
            border: "none",
            borderBottom: "1.5px solid #b0b0b0",
            outline: "none",
            fontSize: "1.1rem",
            fontFamily: "Georgia, serif",
            color: "#2d2d2d",
            padding: "10px 4px",
            background: "transparent",
          }}
        />
        {error && (
          <p style={{ color: "#c0392b", fontSize: "0.85rem", fontFamily: "Georgia, serif" }}>{error}</p>
        )}
      </div>

      <button
        className="btn-primary"
        onClick={handleSubmit}
        style={{ minWidth: 100 }}
      >
        OK
      </button>
    </div>
  );
}
