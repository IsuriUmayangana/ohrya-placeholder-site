"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/admin";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push(from);
      } else {
        setError("Incorrect password. Please try again.");
        setPassword("");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fa] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Header strip with logo */}
          <div className="flex flex-col items-center pt-8 pb-6 px-8 border-b border-slate-50">
            <Image
              src="/logo.png"
              alt="Ohrya"
              width={120}
              height={120}
              className="w-auto h-auto mb-4"
              style={{ maxHeight: 56, width: "auto" }}
            />
            <h1
              className="text-[1.05rem] text-slate-700 text-center leading-snug"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Admin Access
            </h1>
            <p className="text-[0.78rem] text-slate-400 text-center mt-1">
              Enter your password to continue
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[0.875rem] text-slate-700 placeholder-slate-300 outline-none focus:border-[#6098AE] focus:ring-2 focus:ring-[#6098AE]/15 transition-all bg-slate-50/50"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
                    <path d="M12 8v4M12 16h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <p className="text-[0.78rem] text-red-500">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="w-full py-3 rounded-xl bg-[#6098AE] text-white text-[0.875rem] font-medium hover:bg-[#4a8798] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer mt-1"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[0.72rem] text-slate-300 mt-5">
          Ohrya Admin · Restricted Access
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
