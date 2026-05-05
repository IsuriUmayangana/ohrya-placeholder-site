"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "./ui/Header";
import Image from "next/image";

type Stage = "email" | "otp";
type Status = "idle" | "loading" | "error" | "success";

function MyDashboardGatewayInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const autoSentRef = useRef(false);

  useEffect(() => {
    const prefill = searchParams.get("email");
    if (prefill && !autoSentRef.current) {
      autoSentRef.current = true;
      setEmail(prefill);
      sendOtp(prefill);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Step 1: send OTP ────────────────────────────────────────────────────────
  async function sendOtp(emailToSend: string) {
    const trimmed = emailToSend.trim();
    if (!trimmed) { emailInputRef.current?.focus(); return; }

    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/user/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();

      if (res.ok) {
        setStage("otp");
        setStatus("idle");
        startResendCooldown();
        setTimeout(() => otpInputRef.current?.focus(), 100);
      } else {
        setError(data.error ?? "Failed to send code. Please try again.");
        setStatus("error");
      }
    } catch {
      setError("Network error. Please check your connection.");
      setStatus("error");
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    await sendOtp(email);
  }

  // ── Step 2: verify OTP ──────────────────────────────────────────────────────
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const trimmedCode = otp.trim();
    if (!trimmedCode) { otpInputRef.current?.focus(); return; }

    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/user/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: trimmedCode }),
      });

      const data = await res.json();

      if (res.ok && data.emailSlug) {
        setStatus("success");
        router.push(`/dashboard/${data.emailSlug}`);
      } else {
        setError(data.error ?? "Invalid or expired code. Please try again.");
        setStatus("error");
        setOtp("");
        setTimeout(() => otpInputRef.current?.focus(), 100);
      }
    } catch {
      setError("Network error. Please check your connection.");
      setStatus("error");
    }
  }

  // ── Resend cooldown (60 s) ──────────────────────────────────────────────────
  function startResendCooldown() {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) { clearInterval(interval); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setOtp("");
    await sendOtp(email);
  }

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen admin-login-animation flex items-center justify-center p-4">
      
      {/* Card */}
      <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-4">
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

        {stage === "email" ? (
          <>
            <div className="flex flex-col items-center px-6">
              <h1 className="text-[1.6rem] font-medium text-slate-700 text-center leading-snug">
                View Your Dashboard
              </h1>
              <p className="text-[0.85rem] text-slate-400 text-center mt-1">
                Enter the email you used for the OHRYA survey. We&apos;ll send you a verification code.
              </p>
            </div>

            {/* Form */}
            <div className="px-8 pt-6">
              <form onSubmit={handleSendOtp} className="flex flex-col gap-2">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      stroke={status === "error" ? "#e74c3c" : "#9ca3af"}
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
                      if (status === "error") { setStatus("idle"); setError(""); }
                    }}
                    className={`w-full rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition
                  ${status === "error"
                        ? "border border-red-400 focus:border-red-500"
                        : "border border-[#d0dde2] focus:border-[#5a9aaa]"}
                  bg-white text-[#2d2d2d]`}
                  />
                </div>

                {/* Error */}
                {error && <ErrorBox message={error} />}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className={`w-full py-3 rounded-xl bg-[#6098AE] flex items-center justify-center gap-2 text-white text-[0.875rem] font-medium cursor-pointer mt-1
                ${status === "loading"
                      ? "bg-[#6098AE] cursor-not-allowed opacity-50"
                      : "bg-[#6098AE] hover:bg-[#4a8798] active:scale-[0.98] transition-all"}
                text-white`}
                >
                  {status === "loading" ? <Spinner label="Sending code…" /> : (
                    <>
                      Send Verification Code
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 m-4 ">
              <div className="h-px bg-slate-100 mx-auto w-full" />
              <span className="text-xs text-gray-300 ">or</span>
              <div className="h-px bg-slate-100 mx-auto w-full" />
            </div>

            {/* Haven't taken the survey? */}
            <p className="text-center text-[0.85rem] text-gray-400 flex items-center justify-center gap-2 pb-4">
              Haven't taken the survey?{" "}
              <a
                href="/"
                className="text-[#5a9aaa] border-b border-[#5a9aaa] hover:opacity-80 flex items-center gap-2"
              >
                Start Here
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="#5a9aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </p>
          </>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col items-center gap-1">
              <h1
                className="text-[1.6rem] font-medium text-slate-700 text-center leading-snug"
              >
                Check Your Email
              </h1>
              <p className="text-[0.85rem] text-slate-400 text-center mt-1">
                We sent a 6-digit code to
                <span className="text-[#5a9aaa] font-medium px-2">{email}</span>
              </p>
            </div>

            {/* 6-box OTP input */}
            <div className="px-8 py-6">
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit Code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                    if (status === "error") { setStatus("idle"); setError(""); }
                  }}
                  className={`w-full rounded-xl px-4 py-3 text-center text-xl tracking-[0.4em] outline-none transition
                      ${status === "error"
                      ? "border border-red-400 focus:border-red-500"
                      : "border border-[#d0dde2] focus:border-[#5a9aaa]"}
                      bg-white text-[#2d2d2d]`}
                />

                {error && <ErrorBox message={error} />}

                {/* Verify button */}
                <button
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                  className={`mt-2 flex items-center justify-center gap-2 rounded-xl py-3 text-sm transition-all cursor-pointer
                      ${status === "loading" || status === "success"
                      ? "bg-[#a8d4de] cursor-not-allowed"
                      : "bg-gradient-to-r from-[#5a9aaa] to-[#4a8798] hover:shadow-lg hover:-translate-y-[1px]"}
                      text-white`}
                >
                  {status === "loading" ? <Spinner label="Verifying…" /> :
                    status === "success" ? <Spinner label="Redirecting…" /> : (
                      <>
                        Verify &amp; open dashboard
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" />
                        </svg>
                      </>
                    )}
                </button>
              </form>
            </div>

            {/* Resend code */}
            <div className="text-center my-2">
              <span className="text-xs text-gray-400 ">Didn&apos;t receive it? </span>
              {resendCooldown > 0 ? (
                <span className="text-xs text-gray-400 font-serif">Resend in {resendCooldown}s</span>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-xs text-[#5a9aaa] border-b border-[#5a9aaa] hover:opacity-70 cursor-pointer"
                >
                  Resend Code
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 px-15">
              <div className="flex-1 h-px bg-[#e8f0f2]" />
              <span className="text-xs text-gray-300">or</span>
              <div className="flex-1 h-px bg-[#e8f0f2]" />
            </div>

            {/* Use a different email */}
            <button
              onClick={() => { setStage("email"); setError(""); setOtp(""); setStatus("idle"); }}
              className="mt-3 w-full text-center text-xs text-gray-400 hover:text-[#5a9aaa] cursor-pointer"
            >
              ← Use a Different Email
            </button>
          </>
        )}

      </div>

    </div>
  );
}

export default function MyDashboardGateway() {
  return (
    <Suspense>
      <MyDashboardGatewayInner />
    </Suspense>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#e74c3c" strokeWidth="2" />
        <path d="M12 8v4M12 16h.01" stroke="#e74c3c" strokeWidth="2" />
      </svg>
      <span className="text-xs text-red-600">{message}</span>
    </div>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <>
      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      {label}
    </>
  );
}