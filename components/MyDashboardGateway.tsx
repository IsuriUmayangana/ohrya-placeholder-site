"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "./ui/Header";

const OTP_LENGTH = 6;

type Screen = "email" | "otp";
type Status = "idle" | "loading" | "error";

export default function MyDashboardGateway() {
  const router = useRouter();

  // Email step
  const [screen, setScreen] = useState<Screen>("email");
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<Status>("idle");
  const [emailError, setEmailError] = useState("");
  const emailInputRef = useRef<HTMLInputElement>(null);

  // OTP step
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [otpStatus, setOtpStatus] = useState<Status>("idle");
  const [otpError, setOtpError] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verifyingRef = useRef(false);

  // ── Send OTP ──────────────────────────────────────────────────────────────

  async function sendOtp(targetEmail: string) {
    setEmailStatus("loading");
    setEmailError("");

    try {
      const res = await fetch("/api/user/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });

      if (res.ok) {
        setScreen("otp");
        setOtp(Array(OTP_LENGTH).fill(""));
        setOtpStatus("idle");
        setOtpError("");
        verifyingRef.current = false;
        setTimeout(() => otpRefs.current[0]?.focus(), 60);
      } else {
        const { error } = await res.json();
        setEmailError(error ?? "Something went wrong. Please try again.");
        setEmailStatus("error");
      }
    } catch {
      setEmailError("Network error. Please check your connection.");
      setEmailStatus("error");
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      emailInputRef.current?.focus();
      return;
    }
    await sendOtp(trimmed);
  }

  // ── Verify OTP ────────────────────────────────────────────────────────────

  const handleVerifyOtp = useCallback(
    async (code: string) => {
      if (verifyingRef.current) return;
      verifyingRef.current = true;
      setOtpStatus("loading");
      setOtpError("");

      try {
        const res = await fetch("/api/user/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), code }),
        });

        if (res.ok) {
          const { emailSlug } = await res.json();
          router.push(`/dashboard/${emailSlug}`);
        } else {
          const { error } = await res.json();
          setOtpError(error ?? "Invalid code. Please try again.");
          setOtpStatus("error");
          setOtp(Array(OTP_LENGTH).fill(""));
          verifyingRef.current = false;
          setTimeout(() => otpRefs.current[0]?.focus(), 60);
        }
      } catch {
        setOtpError("Network error. Please check your connection.");
        setOtpStatus("error");
        verifyingRef.current = false;
      }
    },
    [email, router]
  );

  // ── OTP input handlers ─────────────────────────────────────────────────────

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (otpStatus === "error") {
      setOtpStatus("idle");
      setOtpError("");
    }
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
    if (next.every((d) => d !== "") && digit) {
      handleVerifyOtp(next.join(""));
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const next = [...otp];
        next[index] = "";
        setOtp(next);
      } else if (index > 0) {
        const next = [...otp];
        next[index - 1] = "";
        setOtp(next);
        otpRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setOtp(next);
    const focusIdx = Math.min(text.length, OTP_LENGTH - 1);
    otpRefs.current[focusIdx]?.focus();
    if (text.length === OTP_LENGTH) {
      handleVerifyOtp(text);
    }
  }

  function handleChangeEmail() {
    setScreen("email");
    setEmailStatus("idle");
    setEmailError("");
    setOtpStatus("idle");
    setOtpError("");
    setOtp(Array(OTP_LENGTH).fill(""));
    verifyingRef.current = false;
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex items-center justify-center px-4 py-10 bg-white">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-sm p-8">

            {screen === "email" ? (
              /* ── Email screen ── */
              <>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e8f5f8] to-[#d0ecf0] flex items-center justify-center shadow-inner">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                        stroke="#5a9aaa"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle cx="12" cy="7" r="4" stroke="#5a9aaa" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                <h1 className="text-center text-[1.6rem] text-[#2d2d2d] mb-2 font-serif">
                  View your dashboard
                </h1>
                <p className="text-center text-sm text-gray-400 mb-8 font-serif leading-relaxed">
                  Enter the email you used for the OHRYA survey. We'll send a
                  one-time code to verify it's you.
                </p>

                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
                  <div className="relative">
                    <svg
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        stroke={emailStatus === "error" ? "#e74c3c" : "#9ca3af"}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                    <input
                      ref={emailInputRef}
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailStatus === "error") {
                          setEmailStatus("idle");
                          setEmailError("");
                        }
                      }}
                      className={`w-full rounded-xl pl-11 pr-4 py-3 text-sm font-serif outline-none transition
                        ${
                          emailStatus === "error"
                            ? "border border-red-400 focus:border-red-500"
                            : "border border-[#d0dde2] focus:border-[#5a9aaa]"
                        }
                        bg-white text-[#2d2d2d]`}
                    />
                  </div>

                  {emailError && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#e74c3c" strokeWidth="2" />
                        <path d="M12 8v4M12 16h.01" stroke="#e74c3c" strokeWidth="2" />
                      </svg>
                      <span className="text-xs text-red-600 font-serif">{emailError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={emailStatus === "loading"}
                    className={`mt-2 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-serif transition-all cursor-pointer
                      ${
                        emailStatus === "loading"
                          ? "bg-[#a8d4de] cursor-not-allowed"
                          : "bg-gradient-to-r from-[#5a9aaa] to-[#4a8798] hover:shadow-lg hover:-translate-y-[1px]"
                      }
                      text-white`}
                  >
                    {emailStatus === "loading" ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending code…
                      </>
                    ) : (
                      <>
                        Continue
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                <div className="flex items-center gap-3 my-7">
                  <div className="flex-1 h-px bg-[#e8f0f2]" />
                  <span className="text-xs text-gray-300 font-serif">or</span>
                  <div className="flex-1 h-px bg-[#e8f0f2]" />
                </div>

                <p className="text-center text-sm text-gray-400 font-serif">
                  Haven't taken the survey?{" "}
                  <a
                    href="/"
                    className="text-[#5a9aaa] border-b border-[#5a9aaa] hover:opacity-80"
                  >
                    Start here →
                  </a>
                </p>
              </>
            ) : (
              /* ── OTP screen ── */
              <>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e8f5f8] to-[#d0ecf0] flex items-center justify-center shadow-inner">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="5"
                        y="11"
                        width="14"
                        height="10"
                        rx="2"
                        stroke="#5a9aaa"
                        strokeWidth="2"
                      />
                      <path
                        d="M8 11V7a4 4 0 018 0v4"
                        stroke="#5a9aaa"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle cx="12" cy="16" r="1.5" fill="#5a9aaa" />
                    </svg>
                  </div>
                </div>

                <h1 className="text-center text-[1.6rem] text-[#2d2d2d] mb-2 font-serif">
                  Check your email
                </h1>
                <p className="text-center text-sm text-gray-400 mb-1 font-serif leading-relaxed">
                  We sent a 6-digit code to
                </p>
                <p className="text-center text-sm text-[#5a9aaa] font-serif mb-8 font-medium">
                  {email}
                </p>

                {/* 6-box OTP input */}
                <div
                  className="flex gap-2 justify-center mb-2"
                  onPaste={handleOtpPaste}
                >
                  {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[i]}
                      disabled={otpStatus === "loading"}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-11 h-14 text-center text-2xl font-serif rounded-xl border outline-none transition-all
                        ${
                          otpStatus === "error"
                            ? "border-red-400 bg-red-50 text-red-600"
                            : otp[i]
                            ? "border-[#5a9aaa] bg-[#f0f9fb] text-[#2d2d2d]"
                            : "border-[#d0dde2] focus:border-[#5a9aaa] bg-white text-[#2d2d2d]"
                        }
                        ${otpStatus === "loading" ? "opacity-50 cursor-not-allowed" : ""}`}
                    />
                  ))}
                </div>

                {/* Status feedback */}
                <div className="min-h-[36px] flex items-center justify-center mb-2">
                  {otpStatus === "loading" && (
                    <div className="flex items-center gap-2 text-sm text-gray-400 font-serif">
                      <div className="w-4 h-4 border-2 border-[#5a9aaa]/30 border-t-[#5a9aaa] rounded-full animate-spin" />
                      Verifying…
                    </div>
                  )}
                  {otpError && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 w-full">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#e74c3c" strokeWidth="2" />
                        <path d="M12 8v4M12 16h.01" stroke="#e74c3c" strokeWidth="2" />
                      </svg>
                      <span className="text-xs text-red-600 font-serif">{otpError}</span>
                    </div>
                  )}
                </div>

                {/* Footer actions */}
                <div className="flex items-center justify-between mt-4">
                  <button
                    type="button"
                    onClick={handleChangeEmail}
                    className="text-xs text-gray-400 font-serif hover:text-[#5a9aaa] transition"
                  >
                    ← Change email
                  </button>
                  <button
                    type="button"
                    disabled={emailStatus === "loading"}
                    onClick={() => sendOtp(email.trim())}
                    className="text-xs text-[#5a9aaa] font-serif hover:opacity-70 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {emailStatus === "loading" ? "Sending…" : "Resend code"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
