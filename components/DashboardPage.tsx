"use client";

import { useEffect, useState, useCallback } from "react";
import OhryaLogo from "./OhryaLogo";
import type { PublicUserStats } from "@/lib/store";

interface Props {
  slug: string;
}

export default function DashboardPage({ slug }: Props) {
  const [stats, setStats] = useState<PublicUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const referralLink = stats ? `${baseUrl}/?ref=${stats.referralCode}` : "";
  const dashboardUrl = `${baseUrl}/dashboard/${slug}`;

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/user/${slug}`);
      if (res.status === 404) { setNotFound(true); return; }
      if (res.ok) { setStats(await res.json()); setLoading(false); }
    } catch {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  function copyLink(link: string) {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  if (loading && !notFound) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <OhryaLogo />
        <p style={{ fontFamily: "Georgia, serif", color: "#aaa", marginTop: 16 }}>Loading your dashboard…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 px-6 text-center">
        <OhryaLogo />
        <p style={{ fontFamily: "Georgia, serif", fontSize: "1.1rem", color: "#555", marginTop: 16 }}>
          Dashboard not found. Please complete the survey to get your personal link.
        </p>
        <a href="/" className="btn-primary" style={{ textDecoration: "none", padding: "12px 32px", borderRadius: 9999 }}>
          Take the Survey
        </a>
      </div>
    );
  }

  const totalScore = stats!.totalScore;
  const maxBar = 16;
  const progressPct = Math.min((totalScore / maxBar) * 100, 100);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex justify-center pt-8 pb-4 px-6 border-b border-gray-100">
        <OhryaLogo />
      </header>

      <main className="flex-1 flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-lg flex flex-col gap-6">

          {/* Title */}
          <div className="text-center">
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "1.5rem", fontWeight: 400, color: "#2d2d2d" }}>
              Your Social Impact Dashboard
            </h1>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "0.85rem", color: "#999", marginTop: 4 }}>
              {stats!.email}
            </p>
          </div>

          {/* Score hero card */}
          <div style={{ borderRadius: 14, overflow: "hidden", border: "1.5px solid #d0e8ed" }}>
            <div style={{ background: "linear-gradient(135deg, #5a9aaa 0%, #4a8798 100%)", padding: "30px 28px", textAlign: "center" }}>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.75)", marginBottom: 8 }}>
                Total Social Impact Score
              </p>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "4rem", color: "white", fontWeight: "bold", lineHeight: 1 }}>
                {totalScore}
              </p>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.65)", marginTop: 4 }}>points</p>
              <div style={{ marginTop: 18, background: "rgba(255,255,255,0.2)", borderRadius: 9999, height: 7 }}>
                <div style={{ width: `${progressPct}%`, background: "#c9a84c", height: "100%", borderRadius: 9999, transition: "width 1s ease" }} />
              </div>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
                Keep sharing to earn more points
              </p>
            </div>

            {/* Breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1.5px solid #d0e8ed" }}>
              <div style={{ padding: "20px", textAlign: "center", borderRight: "1px solid #e8f0f2" }}>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "0.78rem", color: "#999", marginBottom: 4 }}>Survey Score</p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "2.2rem", color: "#5a9aaa", fontWeight: "bold" }}>{stats!.surveyScore}</p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "0.72rem", color: "#bbb" }}>/ 6 pts max</p>
              </div>
              <div style={{ padding: "20px", textAlign: "center" }}>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "0.78rem", color: "#999", marginBottom: 4 }}>Referral Bonus</p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "2.2rem", color: "#c9a84c", fontWeight: "bold" }}>+{stats!.referralScore}</p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "0.72rem", color: "#bbb" }}>
                  from {stats!.referralCount} friend{stats!.referralCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Campaign badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", background: "#f8fbfc", borderRadius: 10, border: "1px solid #e0ecef" }}>
            <span style={{ fontSize: "1.4rem" }}>🌟</span>
            <div>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "0.78rem", color: "#999" }}>Your chosen campaign</p>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "1rem", color: "#2d2d2d", fontWeight: "bold" }}>{stats!.campaign}</p>
            </div>
          </div>

          {/* Referral section */}
          <div style={{ border: "1.5px solid #d0e8ed", borderRadius: 12, padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "0.9rem", color: "#2d2d2d", fontWeight: "bold", marginBottom: 2 }}>
                Share &amp; earn more points
              </p>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "0.82rem", color: "#777" }}>
                Each friend who completes the survey earns you +1 point.
              </p>
            </div>

            {/* Referral link */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fbfc", border: "1px solid #d0d9dc", borderRadius: 8, padding: "9px 12px" }}>
              <span style={{ flex: 1, fontFamily: "monospace", fontSize: "0.8rem", color: "#5a9aaa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {referralLink}
              </span>
              <button
                onClick={() => copyLink(referralLink)}
                style={{ flexShrink: 0, background: copied ? "#5a9aaa" : "white", border: "1.5px solid #5a9aaa", borderRadius: 6, padding: "5px 12px", fontSize: "0.78rem", color: copied ? "white" : "#5a9aaa", cursor: "pointer", fontFamily: "Georgia, serif", transition: "all 0.2s" }}
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>

            {/* Share buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Join me on OHRYA! GIVE. VOTE. SHINE.\n${referralLink}`)}`}
                target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#25D366", color: "white", borderRadius: 9999, padding: "10px", fontFamily: "Georgia, serif", fontSize: "0.85rem", textDecoration: "none" }}
              >
                <svg width="16" height="16" viewBox="0 0 32 32" fill="white"><path d="M16 2C8.28 2 2 8.28 2 16c0 2.46.67 4.88 1.94 7.02L2 30l7.17-1.88A13.94 13.94 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5c-2.26 0-4.47-.61-6.4-1.77l-.46-.27-4.25 1.11 1.14-4.13-.3-.48A11.47 11.47 0 014.5 16c0-6.34 5.16-11.5 11.5-11.5S27.5 9.66 27.5 16 22.34 27.5 16 27.5zm6.3-8.6c-.34-.17-2.02-1-2.33-1.11-.32-.12-.54-.17-.77.17-.22.34-.87 1.11-1.07 1.34-.2.22-.4.25-.74.08-.34-.17-1.44-.53-2.74-1.69-1.01-.9-1.7-2.02-1.89-2.36-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.22-.34.34-.57.11-.22.06-.42-.03-.59-.08-.17-.77-1.86-1.06-2.55-.28-.67-.56-.58-.77-.59h-.65c-.22 0-.57.08-.87.42-.3.34-1.14 1.11-1.14 2.71s1.17 3.14 1.33 3.36c.17.22 2.3 3.51 5.57 4.92.78.34 1.38.54 1.85.69.78.25 1.49.21 2.05.13.62-.09 1.92-.78 2.19-1.54.27-.76.27-1.41.19-1.54-.08-.13-.3-.21-.64-.38z"/></svg>
                WhatsApp
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent("Join me on OHRYA")}&body=${encodeURIComponent(`Take the OHRYA survey!\n\n${referralLink}`)}`}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "white", color: "#5a9aaa", border: "1.5px solid #5a9aaa", borderRadius: 9999, padding: "10px", fontFamily: "Georgia, serif", fontSize: "0.85rem", textDecoration: "none" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#5a9aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Email
              </a>
            </div>
          </div>

          {/* Dashboard URL */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "0.78rem", color: "#bbb", marginBottom: 6 }}>
              Bookmark your personal dashboard:
            </p>
            <button
              onClick={() => copyLink(dashboardUrl)}
              style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#5a9aaa", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
            >
              {dashboardUrl}
            </button>
          </div>

          <p style={{ fontFamily: "Georgia, serif", fontSize: "0.75rem", color: "#ccc", textAlign: "center" }}>
            Score updates live every 10 seconds as friends complete the survey.
          </p>
        </div>
      </main>
    </div>
  );
}
