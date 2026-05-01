"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "./ui/Header";
import Image from "next/image";

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

  // ── OTP input keydown handler ────────────────────────────────────────────────
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

  // ── OTP input paste handler ────────────────────────────────────────────────
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

  // ── Change email handler ────────────────────────────────────────────────────
  function handleChangeEmail() {
    setScreen("email");
    setEmailStatus("idle");
    setEmailError("");
    setOtpStatus("idle");
    setOtpError("");
    setOtp(Array(OTP_LENGTH).fill(""));
    verifyingRef.current = false;
  }

  return (
    <div className="min-h-screen admin-login-animation flex items-center justify-center p-4">

      {/* Card */}
      <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-4">
        {/* OHRYA Logo */}
        <div className="flex flex-col items-center pt-4">
          <Image
            src="/logo.png"
            alt="Ohrya"
            width={160}
            height={160}
            className="w-auto h-auto"
            style={{ maxHeight: 60, width: "auto" }}
          />
        </div>
        {/* Email screen */}
        {screen === "email" ? (
          /* ── Email screen ── */
          <>
          {/* Header */}
          <div className="flex flex-col items-center px-6">
            <h1 className="text-[1.6rem] font-medium text-slate-700 text-center leading-snug">
              View your dashboard
            </h1>
            <p className="text-[0.85rem] text-slate-400 text-center mt-1">
              Enter the email you used for the OHRYA survey. We'll send a
              one-time code to verify it's you.
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-6">
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

              {/* Error message */}
              {emailError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
                    <path d="M12 8v4M12 16h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <p className="text-[0.78rem] text-red-500">{emailError}</p>
                </div>
              )}

              {/* Continue button */}
              <button
                type="submit"
                disabled={emailStatus === "loading"}
                className={`w-full py-3 rounded-xl bg-[#6098AE] text-white text-[0.875rem] font-medium cursor-pointer mt-1
                  ${
                    emailStatus === "loading"
                      ? "bg-[#6098AE] cursor-not-allowed opacity-50"
                      : "bg-[#6098AE] hover:bg-[#4a8798] active:scale-[0.98] transition-all"
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
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Or separator */}
          <div className="flex items-center gap-3 m-4 ">
            <div className="h-px bg-slate-100 mx-auto w-full" />
            <span className="text-xs text-gray-300 font-serif">or</span>
            <div className="h-px bg-slate-100 mx-auto w-full" />
          </div>

          {/* Haven't taken the survey? */}
          <p className="text-center text-[0.85rem] text-gray-400 flex items-center justify-center gap-2 pb-4">
            Haven't taken the survey?{" "}
            <a
              href="/"
              className="text-[#5a9aaa] border-b border-[#5a9aaa] hover:opacity-80 flex items-center gap-2"
            >
              Start here
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="#5a9aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </p>
        </>
        ) : (
          /* ── OTP screen ── */
          <>
            {/* Header */}
            <div className="flex flex-col items-center gap-1">
              <h1
                className="text-[1.6rem] font-medium text-slate-700 text-center leading-snug"
              >
                Check your email
              </h1>
              <p className="text-[0.85rem] text-slate-400 text-center mt-1">
                We sent a 6-digit code to
                <span className="text-[#5a9aaa] font-medium px-2">test@test.com {email}</span>
              </p>
            </div>

            {/* 6-box OTP input */}
            <div
              className="flex gap-2 md:gap-3 lg:gap-3 justify-center my-4"
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
                  className={`w-10 h-10 md:w-14 md:h-14 lg:w-14 lg:h-14 text-center text-xl md:text-2xl lg:text-2xl rounded-xl border outline-none transition-all
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
            <div className=" flex items-center justify-center mb-2">
              {otpStatus === "loading" && (
                <div className="flex items-center gap-2 text-sm text-gray-400 ">
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

            {/* Resend code button */}
            <div className=" w-full flex items-center justify-center gap-2 pb-4">
              {/* Resend code button */}
              <button
                type="button"
                disabled={emailStatus === "loading"}
                onClick={() => sendOtp(email.trim())}
                className="text-xs text-[#5a9aaa] hover:opacity-70 hover:underline transition font-normal cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {emailStatus === "loading" ? "Sending…" : "Resend code"}
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100 my-4 mx-auto w-full max-w-xs" />

            {/* Change email button */}
            <div className="flex items-center justify-center gap-2 pb-4 flex-col md:flex-row lg:flex-row">
              <p className="text-center text-[0.85rem] text-gray-400 ">
                Want to change the email?
              </p>
              <button
                type="button"
                onClick={handleChangeEmail}
                className="text-xs text-[#5a9aaa] hover:text-[#5a9aaa] hover:opacity-70 hover:underline transition font-medium cursor-pointer"
              >
                Change email
              </button>
            </div>
          </>
        )}
  
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}