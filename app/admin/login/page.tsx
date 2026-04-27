"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OhryaLogo from "@/components/OhryaLogo";

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
    <div className="min-h-screen bg-[#f7f9fa] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <OhryaLogo />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-8 py-8">
          <h1
            className="text-center text-[1.15rem] text-slate-700 mb-1"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Admin Access
          </h1>
          <p className="text-center text-[0.8rem] text-slate-400 mb-7">
            Enter your password to continue
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoFocus
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-[0.9rem] text-slate-700 placeholder-slate-300 outline-none focus:border-[#6098AE] focus:ring-2 focus:ring-[#6098AE]/15 transition"
            />

            {error && (
              <p className="text-[0.8rem] text-red-500 text-center -mt-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-2.5 rounded-lg bg-[#6098AE] text-white text-[0.9rem] font-medium hover:bg-[#4a8798] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
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
