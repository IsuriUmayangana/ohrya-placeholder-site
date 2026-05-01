"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "./ui/Header";
import Image from "next/image";

type Status = "idle" | "loading" | "error";

export default function MyDashboardGateway() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const emailInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
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

            <h1 className="text-[1.6rem] font-medium text-slate-700 text-center leading-snug mt-4">
              View your dashboard
            </h1>
            <p className="text-[0.85rem] text-slate-400 text-center mt-1">
              Enter the email you used for the OHRYA survey.
            </p>
        </div>

        {/* Form */}
        <div className="px-8 py-6">
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

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <p className="text-[0.78rem] text-red-500">{error}</p>
              </div>
            )}

            {/* Continue button */}
            <button
              type="submit"
              disabled={status === "loading"}
              className={`w-full py-3 rounded-xl bg-[#6098AE] text-white text-[0.875rem] font-medium cursor-pointer mt-1
                ${
                  status === "loading"
                    ? "bg-[#6098AE] cursor-not-allowed opacity-50"
                    : "bg-[#6098AE] hover:bg-[#4a8798] active:scale-[0.98] transition-all"
                }
                text-white`}
            >
              {status === "loading" ? (
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
  
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}