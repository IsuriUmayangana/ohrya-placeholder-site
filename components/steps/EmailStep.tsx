"use client";

interface Props {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

export default function EmailStep({ value, onChange, error }: Props) {
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
          style={{
            width: "100%",
            border: "none",
            borderBottom: `1.5px solid ${error ? "#c0392b" : "#b0b0b0"}`,
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
    </div>
  );
}