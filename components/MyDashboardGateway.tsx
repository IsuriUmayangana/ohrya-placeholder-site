"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import OhryaLogo from "./OhryaLogo";

type State = "idle" | "loading" | "error";

export default function MyDashboardGateway() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) { inputRef.current?.focus(); return; }

    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/user/by-email?email=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const { emailSlug } = await res.json();
        router.push(`/dashboard/${emailSlug}`);
      } else {
        const { error } = await res.json();
        setErrorMsg(error ?? "Something went wrong. Please try again.");
        setState("error");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection.");
      setState("error");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "white", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "center", padding: "32px 24px 0" }}>
        <OhryaLogo />
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>

          {/* Icon */}
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #e8f5f8, #d0ecf0)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#5a9aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="#5a9aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Heading */}
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "1.65rem", fontWeight: 400, color: "#2d2d2d", textAlign: "center", marginBottom: 8 }}>
            View your dashboard
          </h1>
          <p style={{ fontFamily: "Georgia, serif", fontSize: "0.9rem", color: "#999", textAlign: "center", marginBottom: 36, lineHeight: 1.6 }}>
            Enter the email address you used when you completed the OHRYA survey to see your social impact score and referral progress.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ position: "relative" }}>
              {/* Email icon */}
              <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke={state === "error" ? "#e74c3c" : "#aaa"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                ref={inputRef}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (state === "error") { setState("idle"); setErrorMsg(""); } }}
                style={{
                  width: "100%", boxSizing: "border-box",
                  border: `1.5px solid ${state === "error" ? "#e74c3c" : "#d0dde2"}`,
                  borderRadius: 10, padding: "13px 14px 13px 42px",
                  fontFamily: "Georgia, serif", fontSize: "0.95rem",
                  color: "#2d2d2d", outline: "none", background: "white",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => { if (state !== "error") e.currentTarget.style.borderColor = "#5a9aaa"; }}
                onBlur={(e) => { if (state !== "error") e.currentTarget.style.borderColor = "#d0dde2"; }}
                suppressHydrationWarning
              />
            </div>

            {/* Error message */}
            {errorMsg && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 14px", background: "#fff5f5", border: "1px solid #fccaca", borderRadius: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" stroke="#e74c3c" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span style={{ fontFamily: "Georgia, serif", fontSize: "0.83rem", color: "#c0392b" }}>{errorMsg}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={state === "loading"}
              style={{
                padding: "13px", borderRadius: 10, border: "none",
                background: state === "loading" ? "#a8d4de" : "linear-gradient(135deg, #5a9aaa 0%, #4a8798 100%)",
                color: "white", fontFamily: "Georgia, serif", fontSize: "0.95rem",
                cursor: state === "loading" ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "opacity 0.2s",
              }}
            >
              {state === "loading" ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.9s linear infinite" }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Looking up your dashboard…
                </>
              ) : (
                <>
                  View my dashboard
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", margin: "28px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#e8f0f2" }} />
            <span style={{ fontFamily: "Georgia, serif", fontSize: "0.78rem", color: "#ccc" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "#e8f0f2" }} />
          </div>

          {/* CTA to take survey */}
          <p style={{ fontFamily: "Georgia, serif", fontSize: "0.88rem", color: "#999", textAlign: "center" }}>
            Haven&apos;t taken the survey yet?{" "}
            <a href="/" style={{ color: "#5a9aaa", textDecoration: "none", borderBottom: "1px solid #5a9aaa" }}>
              Start here →
            </a>
          </p>
        </div>
      </main>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
