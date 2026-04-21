"use client";

import { useEffect, useState } from "react";
import OhryaLogo from "../OhryaLogo";
import InsightsTab from "./InsightsTab";
import SummaryTab from "./SummaryTab";
import ResponsesTab from "./ResponsesTab";

type TabId = "insights" | "summary" | "responses";

interface StatsData {
  total: number;
  avgScore: number;
  avgTimeToComplete: string;
  trends: { date: string; count: number }[];
  campaigns: { name: string; value: number }[];
  giveAnswers: { name: string; value: number }[];
  donationAmounts: { name: string; value: number }[];
  voteAnswers: { name: string; value: number }[];
  shineAnswers: { name: string; value: number }[];
  recognitionAnswers: { name: string; value: number }[];
  dropOff: { question: string; views: number; answered: number }[];
  responses: {
    id: string; email: string; campaign: string; willGive: string;
    donationAmount: string; willVote: string; willShine: string;
    prefersEarning: string; surveyScore: number; referralScore: number;
    referralCount: number; totalScore: number; submittedAt: string; dashboardUrl: string;
  }[];
}

const TABS: { id: TabId; label: string }[] = [
  { id: "insights", label: "Insights" },
  { id: "summary", label: "Summary" },
  { id: "responses", label: "Responses" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("insights");
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("/api/admin/stats");
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f7f9fa", fontFamily: "Georgia, serif" }}>
      {/* Top nav */}
      <header style={{ background: "white", borderBottom: "1px solid #e8f0f2", padding: "0 32px", display: "flex", alignItems: "center", gap: 32, position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ padding: "16px 0" }}>
          <OhryaLogo />
        </div>

        <nav style={{ display: "flex", gap: 0, flex: 1 }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "20px 20px",
                background: "none",
                border: "none",
                borderBottom: activeTab === tab.id ? "2.5px solid #5a9aaa" : "2.5px solid transparent",
                color: activeTab === tab.id ? "#5a9aaa" : "#999",
                fontFamily: "Georgia, serif",
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "color 0.15s",
              }}
            >
              {tab.label}
              {tab.id === "responses" && data && data.total > 0 && (
                <span style={{ marginLeft: 6, background: "#5a9aaa", color: "white", borderRadius: 9999, padding: "2px 7px", fontSize: "0.72rem" }}>
                  {data.total}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Refresh indicator */}
        <button
          onClick={load}
          title="Refresh"
          style={{ background: "none", border: "1px solid #e0e8ec", borderRadius: 6, padding: "7px 12px", cursor: "pointer", color: "#888", display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M23 4v6h-6M1 20v-6h6" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Refresh
        </button>
      </header>

      {/* Content */}
      <main style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#aaa" }}>
            Loading…
          </div>
        ) : !data || data.total === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 12, color: "#bbb", textAlign: "center" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "1rem" }}>No survey responses yet.</p>
            <a href="/" style={{ color: "#5a9aaa", fontFamily: "Georgia, serif", fontSize: "0.9rem" }}>Take the survey →</a>
          </div>
        ) : (
          <>
            {activeTab === "insights" && (
              <InsightsTab />
            )}
            {activeTab === "summary" && (
              <SummaryTab />
            )}
            {activeTab === "responses" && (
              <ResponsesTab />
            )}
          </>
        )}
      </main>
    </div>
  );
}
