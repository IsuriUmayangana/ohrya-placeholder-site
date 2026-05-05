"use client";

import { useEffect, useState, useRef } from "react";
import OhryaLogo from "../OhryaLogo";
import InsightsTab from "./InsightsTab";
import SummaryTab from "./SummaryTab";
import ResponsesTab from "./ResponsesTab";
import Loading from "@/app/loading";
import AdminDashboardNav from "./AdminDashboardNav";

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

function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: "20px 20px",
    background: "none",
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
    borderBottom: active ? "2.5px solid #5a9aaa" : "2.5px solid transparent",
    color: active ? "#5a9aaa" : "#999",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "color 0.15s",
  };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("insights");
  const [menuOpen, setMenuOpen] = useState(false);
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

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

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const activeLabel = TABS.find((t) => t.id === activeTab)?.label ?? "";

  return (
    <div className="min-h-screen bg-[#f7f9fa] w-full overflow-x-hidden">
      <AdminDashboardNav activeTab={activeTab} onTabChange={setActiveTab} onRefresh={load} onLogout={handleLogout} totalResponses={data?.total || 0} />

      {/* Content */}
      <main className="px-4 py-8 lg:px-12 mx-auto w-full pt-45 md:pt-35">
        {loading ? (
          <Loading />
        ) : !data || data.total === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 12, color: "#bbb", textAlign: "center" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p style={{ fontSize: "1rem" }}>No survey responses yet.</p>
            <p style={{ fontSize: "0.85rem", color: "#ccc" }}>Responses will appear here once users complete the survey.</p>
          </div>
        ) : (
          <>
            {activeTab === "insights" && <InsightsTab />}
            {activeTab === "summary" && <SummaryTab />}
            {activeTab === "responses" && <ResponsesTab />}
          </>
        )}
      </main>
    </div>
  );
}