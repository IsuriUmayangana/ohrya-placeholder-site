"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "./ui/Header";

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
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex items-center justify-center px-4 py-10 bg-white">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-sm p-8">

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e8f5f8] to-[#d0ecf0] flex items-center justify-center shadow-inner">
                {stage === "email" ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#5a9aaa" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="7" r="4" stroke="#5a9aaa" strokeWidth="2" />
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="#5a9aaa" strokeWidth="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="#5a9aaa" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </div>
            </div>

            {stage === "email" ? (
              <>
                <h1 className="text-center text-[1.6rem] text-[#2d2d2d] mb-2 font-serif">
                  View your dashboard
                </h1>
                <p className="text-center text-sm text-gray-400 mb-8 font-serif leading-relaxed">
                  Enter the email you used for the OHRYA survey. We&apos;ll send you a verification code.
                </p>

                <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
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
                      className={`w-full rounded-xl pl-11 pr-4 py-3 text-sm font-serif outline-none transition
                        ${status === "error"
                          ? "border border-red-400 focus:border-red-500"
                          : "border border-[#d0dde2] focus:border-[#5a9aaa]"}
                        bg-white text-[#2d2d2d]`}
                    />
                  </div>

                  {error && <ErrorBox message={error} />}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className={`mt-2 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-serif transition-all cursor-pointer
                      ${status === "loading"
                        ? "bg-[#a8d4de] cursor-not-allowed"
                        : "bg-gradient-to-r from-[#5a9aaa] to-[#4a8798] hover:shadow-lg hover:-translate-y-[1px]"}
                      text-white`}
                  >
                    {status === "loading" ? <Spinner label="Sending code…" /> : (
                      <>
                        Send verification code
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-center text-[1.6rem] text-[#2d2d2d] mb-2 font-serif">
                  Check your email
                </h1>
                <p className="text-center text-sm text-gray-400 mb-1 font-serif leading-relaxed">
                  We sent a 6-digit code to
                </p>
                <p className="text-center text-sm font-semibold text-[#5a9aaa] mb-8 font-serif">
                  {email}
                </p>

                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                      if (status === "error") { setStatus("idle"); setError(""); }
                    }}
                    className={`w-full rounded-xl px-4 py-3 text-center text-xl tracking-[0.4em] font-mono outline-none transition
                      ${status === "error"
                        ? "border border-red-400 focus:border-red-500"
                        : "border border-[#d0dde2] focus:border-[#5a9aaa]"}
                      bg-white text-[#2d2d2d]`}
                  />

                  {error && <ErrorBox message={error} />}

                  <button
                    type="submit"
                    disabled={status === "loading" || status === "success"}
                    className={`mt-2 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-serif transition-all cursor-pointer
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

                <div className="mt-5 text-center">
                  <span className="text-xs text-gray-400 font-serif">Didn&apos;t receive it? </span>
                  {resendCooldown > 0 ? (
                    <span className="text-xs text-gray-400 font-serif">Resend in {resendCooldown}s</span>
                  ) : (
                    <button
                      onClick={handleResend}
                      className="text-xs text-[#5a9aaa] font-serif border-b border-[#5a9aaa] hover:opacity-70 cursor-pointer"
                    >
                      Resend code
                    </button>
                  )}
                </div>

                <button
                  onClick={() => { setStage("email"); setError(""); setOtp(""); setStatus("idle"); }}
                  className="mt-3 w-full text-center text-xs text-gray-400 font-serif hover:text-gray-600 cursor-pointer"
                >
                  ← Use a different email
                </button>
              </>
            )}

            <div className="flex items-center gap-3 my-7">
              <div className="flex-1 h-px bg-[#e8f0f2]" />
              <span className="text-xs text-gray-300 font-serif">or</span>
              <div className="flex-1 h-px bg-[#e8f0f2]" />
            </div>

            <p className="text-center text-sm text-gray-400 font-serif">
              Haven&apos;t taken the survey?{" "}
              <a href="/" className="text-[#5a9aaa] border-b border-[#5a9aaa] hover:opacity-80">
                Start here →
              </a>
            </p>
          </div>
        </div>
      </main>
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
      <span className="text-xs text-red-600 font-serif">{message}</span>
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
