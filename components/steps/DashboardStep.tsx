"use client";

import { useEffect, useState, useCallback } from "react";
import type { PublicUserStats } from "@/lib/survey-types";

interface Props {
  referralCode: string;
  initialSurveyScore: number;
  onRestart: () => void;
}

export default function DashboardStep({ referralCode, initialSurveyScore, onRestart }: Props) {
  const [stats, setStats] = useState<PublicUserStats | null>(null);
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const referralLink = `${baseUrl}/?ref=${referralCode}`;

  // Fetch stats from API
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/user/${referralCode}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // use fallback
    }
  }, [referralCode]);

  // Fetch stats every 10 seconds
  useEffect(() => {
    fetchStats();
    // Poll every 10s so score updates live as referrals come in
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const totalScore = stats ? stats.totalScore : initialSurveyScore;
  const surveyScore = stats ? stats.surveyScore : initialSurveyScore;
  const referralScore = stats ? stats.referralScore : 0;
  const referralCount = stats ? stats.referralCount : 0;

  // Copy link to clipboard
  function copyLink() {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  // Calculate progress percentage
  const maxScore = 6;
  const progressPct = Math.min((totalScore / (maxScore + 10)) * 100, 100);

  return (
    <div className="flex flex-col items-center gap-6 px-4 w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">
          Your Social Impact Dashboard
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          GIVE. VOTE. SHINE.
        </p>
      </div>

      {/* Score card */}
      <div
        style={{
          width: "100%",
          borderRadius: 12,
          border: "1.5px solid #d0e8ed",
          overflow: "hidden",
        }}
      >
        {/* Total score hero */}
        <div
          style={{
            background: "linear-gradient(135deg, #5a9aaa 0%, #4a8798 100%)",
            padding: "28px 24px",
            textAlign: "center",
          }}
        >
          <p style={{ fontFamily: "Georgia, serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", marginBottom: 6 }}>
            Total Social Impact Score
          </p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: "3.5rem", color: "white", fontWeight: "bold", lineHeight: 1 }}>
            {totalScore}
          </p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
            points
          </p>

          {/* Score bar */}
          <div style={{ marginTop: 16, background: "rgba(255,255,255,0.25)", borderRadius: 9999, height: 6 }}>
            <div
              style={{
                width: `${progressPct}%`,
                background: "#c9a84c",
                height: "100%",
                borderRadius: 9999,
                transition: "width 0.8s ease",
              }}
            />
          </div>
        </div>

        {/* Score breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
          <div
            style={{
              padding: "20px 24px",
              borderRight: "1px solid #e8f0f2",
              borderBottom: "1px solid #e8f0f2",
              textAlign: "center",
            }}
          >
            <p style={{ fontFamily: "Georgia, serif", fontSize: "0.8rem", color: "#888", marginBottom: 4 }}>
              Survey Score
            </p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#5a9aaa", fontWeight: "bold" }}>
              {surveyScore}
            </p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "0.75rem", color: "#aaa" }}>
              / 6 pts max
            </p>
          </div>

          <div style={{ padding: "20px 24px", borderBottom: "1px solid #e8f0f2", textAlign: "center" }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "0.8rem", color: "#888", marginBottom: 4 }}>
              Referral Bonus
            </p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#c9a84c", fontWeight: "bold" }}>
              +{referralScore}
            </p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "0.75rem", color: "#aaa" }}>
              from {referralCount} friend{referralCount !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Referral CTA */}
          <div style={{ gridColumn: "1 / -1", padding: "16px 24px" }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "0.85rem", color: "#666", marginBottom: 10 }}>
              Share your link to earn more points:
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1.5px solid #d0d9dc",
                borderRadius: 8,
                padding: "9px 12px",
                background: "#f8fbfc",
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontFamily: "monospace",
                  fontSize: "0.8rem",
                  color: "#5a9aaa",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {referralLink}
              </span>
              <button
                onClick={copyLink}
                style={{
                  flexShrink: 0,
                  background: copied ? "#5a9aaa" : "white",
                  border: "1.5px solid #5a9aaa",
                  borderRadius: 6,
                  padding: "5px 12px",
                  fontSize: "0.78rem",
                  color: copied ? "white" : "#5a9aaa",
                  cursor: "pointer",
                  fontFamily: "Georgia, serif",
                  transition: "all 0.2s",
                }}
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>

            {/* Share mini buttons */}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Join me on OHRYA! GIVE. VOTE. SHINE.\n${referralLink}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  background: "#25D366",
                  color: "white",
                  borderRadius: 9999,
                  padding: "9px 12px",
                  fontFamily: "Georgia, serif",
                  fontSize: "0.82rem",
                  textDecoration: "none",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 32 32" fill="white">
                  <path d="M16 2C8.28 2 2 8.28 2 16c0 2.46.67 4.88 1.94 7.02L2 30l7.17-1.88A13.94 13.94 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5c-2.26 0-4.47-.61-6.4-1.77l-.46-.27-4.25 1.11 1.14-4.13-.3-.48A11.47 11.47 0 014.5 16c0-6.34 5.16-11.5 11.5-11.5S27.5 9.66 27.5 16 22.34 27.5 16 27.5zm6.3-8.6c-.34-.17-2.02-1-2.33-1.11-.32-.12-.54-.17-.77.17-.22.34-.87 1.11-1.07 1.34-.2.22-.4.25-.74.08-.34-.17-1.44-.53-2.74-1.69-1.01-.9-1.7-2.02-1.89-2.36-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.22-.34.34-.57.11-.22.06-.42-.03-.59-.08-.17-.77-1.86-1.06-2.55-.28-.67-.56-.58-.77-.59h-.65c-.22 0-.57.08-.87.42-.3.34-1.14 1.11-1.14 2.71s1.17 3.14 1.33 3.36c.17.22 2.3 3.51 5.57 4.92.78.34 1.38.54 1.85.69.78.25 1.49.21 2.05.13.62-.09 1.92-.78 2.19-1.54.27-.76.27-1.41.19-1.54-.08-.13-.3-.21-.64-.38z" />
                </svg>
                WhatsApp
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent("Join me on OHRYA")}&body=${encodeURIComponent(`Take the OHRYA survey and earn your Social Impact Score!\n\n${referralLink}`)}`}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  background: "white",
                  color: "#5a9aaa",
                  border: "1.5px solid #5a9aaa",
                  borderRadius: 9999,
                  padding: "9px 12px",
                  fontFamily: "Georgia, serif",
                  fontSize: "0.82rem",
                  textDecoration: "none",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#5a9aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Email
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Live refresh note */}
      <p style={{ fontFamily: "Georgia, serif", fontSize: "0.78rem", color: "#bbb", textAlign: "center" }}>
        Your score updates live as friends complete the survey using your link.
      </p>

      <button
        onClick={onRestart}
        style={{
          background: "none",
          border: "none",
          color: "#aaa",
          fontFamily: "Georgia, serif",
          fontSize: "0.85rem",
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        Take survey again
      </button>
    </div>
  );
}
