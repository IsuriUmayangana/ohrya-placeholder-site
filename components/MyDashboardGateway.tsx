"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "./ui/Header";

type Status = "idle" | "loading" | "error";

export default function MyDashboardGateway() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const emailInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      emailInputRef.current?.focus();
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const res = await fetch(`/api/user/by-email?email=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        router.push(`/dashboard/${data.emailSlug}`);
      } else {
        setError("No survey found for this email. Please check and try again.");
        setStatus("error");
      }
    } catch {
      setError("Network error. Please check your connection.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex items-center justify-center px-4 py-10 bg-white">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-sm p-8">

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
              Enter the email you used for the OHRYA survey.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                    if (status === "error") {
                      setStatus("idle");
                      setError("");
                    }
                  }}
                  className={`w-full rounded-xl pl-11 pr-4 py-3 text-sm font-serif outline-none transition
                    ${
                      status === "error"
                        ? "border border-red-400 focus:border-red-500"
                        : "border border-[#d0dde2] focus:border-[#5a9aaa]"
                    }
                    bg-white text-[#2d2d2d]`}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#e74c3c" strokeWidth="2" />
                    <path d="M12 8v4M12 16h.01" stroke="#e74c3c" strokeWidth="2" />
                  </svg>
                  <span className="text-xs text-red-600 font-serif">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className={`mt-2 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-serif transition-all cursor-pointer
                  ${
                    status === "loading"
                      ? "bg-[#a8d4de] cursor-not-allowed"
                      : "bg-gradient-to-r from-[#5a9aaa] to-[#4a8798] hover:shadow-lg hover:-translate-y-[1px]"
                  }
                  text-white`}
              >
                {status === "loading" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading…
                  </>
                ) : (
                  <>
                    View my dashboard
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
              Haven&apos;t taken the survey?{" "}
              <a
                href="/"
                className="text-[#5a9aaa] border-b border-[#5a9aaa] hover:opacity-80"
              >
                Start here →
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
