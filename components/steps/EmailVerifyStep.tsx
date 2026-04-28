"use client";

import { useRef, useEffect } from "react";

const OTP_LENGTH = 6;

interface Props {
  email: string;
  otp: string[];
  onOtpChange: (index: number, value: string) => void;
  onOtpKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onOtpPaste: (e: React.ClipboardEvent) => void;
  status: "idle" | "verifying" | "error" | "resending";
  error: string;
  onResend: () => void;
  onChangeEmail: () => void;
}

export default function EmailVerifyStep({
  email,
  otp,
  onOtpChange,
  onOtpKeyDown,
  onOtpPaste,
  status,
  error,
  onResend,
  onChangeEmail,
}: Props) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const isDisabled = status === "verifying" || status === "resending";

  return (
    <div className="flex flex-col items-center gap-6 px-6 w-full max-w-xl mx-auto">
      {/* Heading */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h2
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
            fontWeight: "400",
            color: "#2d2d2d",
          }}
        >
          Check your email
        </h2>
        <p style={{ fontFamily: "Georgia, serif", fontSize: "0.9rem", color: "#777" }}>
          We sent a 6-digit code to
        </p>
        <p
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "0.9rem",
            color: "#5a9aaa",
            fontWeight: "500",
          }}
        >
          {email}
        </p>
      </div>

      {/* 6-box OTP input */}
      <div
        style={{ display: "flex", gap: 8, justifyContent: "center" }}
        onPaste={onOtpPaste}
      >
        {Array.from({ length: OTP_LENGTH }).map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[i]}
            disabled={isDisabled}
            onChange={(e) => onOtpChange(i, e.target.value)}
            onKeyDown={(e) => onOtpKeyDown(i, e)}
            style={{
              width: 44,
              height: 56,
              textAlign: "center",
              fontSize: "1.4rem",
              fontFamily: "Georgia, serif",
              border: `1.5px solid ${
                status === "error" ? "#c0392b" : otp[i] ? "#5a9aaa" : "#b0b0b0"
              }`,
              borderRadius: 10,
              outline: "none",
              background:
                status === "error"
                  ? "#fff5f5"
                  : otp[i]
                  ? "#f0f9fb"
                  : "transparent",
              color: status === "error" ? "#c0392b" : "#2d2d2d",
              opacity: isDisabled ? 0.5 : 1,
              cursor: isDisabled ? "not-allowed" : "text",
              transition: "border-color 0.15s, background 0.15s",
            }}
          />
        ))}
      </div>

      {/* Feedback */}
      {status === "verifying" && (
        <p style={{ fontFamily: "Georgia, serif", fontSize: "0.85rem", color: "#777" }}>
          Verifying…
        </p>
      )}
      {error && (
        <p style={{ fontFamily: "Georgia, serif", fontSize: "0.85rem", color: "#c0392b", textAlign: "center" }}>
          {error}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <button
          type="button"
          onClick={onChangeEmail}
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "0.85rem",
            color: "#aaa",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          ← Change email
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={status === "resending"}
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "0.85rem",
            color: "#5a9aaa",
            background: "none",
            border: "none",
            cursor: status === "resending" ? "not-allowed" : "pointer",
            opacity: status === "resending" ? 0.5 : 1,
            padding: 0,
          }}
        >
          {status === "resending" ? "Sending…" : "Resend code"}
        </button>
      </div>
    </div>
  );
}
