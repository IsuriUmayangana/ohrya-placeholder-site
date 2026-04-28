"use client";

import { useEffect, useState, useRef } from "react";
import OhryaLogo from "../OhryaLogo";
import InsightsTab from "./InsightsTab";
import SummaryTab from "./SummaryTab";
import ResponsesTab from "./ResponsesTab";
import Loading from "@/app/loading";

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
      {/* Top nav */}
      <header className="bg-white border-b border-[#e8f0f2] sticky top-0 z-20">

        {/* Logo row — mobile */}
        <div className="flex sm:hidden items-center justify-between px-4 py-1 border-b border-[#f4f4f4]">
          <OhryaLogo />

          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button
              onClick={load}
              title="Refresh"
              className="flex items-center gap-1.5 text-[#888] rounded-md px-3 py-1.5 text-[0.8rem] cursor-pointer bg-transparent"
              style={{
                border: "1px solid #e0e8ec",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M23 4v6h-6M1 20v-6h6" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Refresh
            </button>

            {/* Logout — mobile */}
            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex items-center gap-1.5 text-[#888] rounded-md px-3 py-1.5 text-[0.8rem] cursor-pointer bg-transparent"
              style={{ border: "1px solid #e0e8ec" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sign out
            </button>

            {/* Hamburger */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex flex-col justify-center items-center w-9 h-9 rounded-md border border-[#e0e8ec] gap-[5px] bg-white cursor-pointer"
                aria-label="Open navigation menu"
              >
                <span className={`block w-4 h-[1.5px] bg-[#5a9aaa] transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
                <span className={`block w-4 h-[1.5px] bg-[#5a9aaa] transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`block w-4 h-[1.5px] bg-[#5a9aaa] transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 top-11 w-48 bg-white border border-[#e8f0f2] rounded-xl shadow-lg overflow-hidden z-30">
                  {TABS.map((tab, i) => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left text-[0.88rem] cursor-pointer transition-colors ${
                        activeTab === tab.id
                          ? "bg-[#5a9aaa]/08 text-[#5a9aaa]"
                          : "text-[#666] hover:bg-[#f7f9fa]"
                      } ${i !== TABS.length - 1 ? "border-b border-[#f4f4f4]" : ""}`}
                      style={{ fontFamily: "Georgia, serif", background: activeTab === tab.id ? "rgba(90,154,170,0.07)" : undefined }}
                    >
                      <span className="flex items-center gap-2">
                        {/* Active dot */}
                        {activeTab === tab.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5a9aaa] flex-shrink-0" />
                        )}
                        {activeTab !== tab.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-transparent flex-shrink-0" />
                        )}
                        {tab.label}
                      </span>
                      {tab.id === "responses" && data && data.total > 0 && (
                        <span style={{ background: "#5a9aaa", color: "white", borderRadius: 9999, padding: "4px 7px", fontFamily: "Poppins, sans-serif" }}>
                          {data.total}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active tab label */}
        <div className="flex sm:hidden items-center gap-1.5 px-4 py-2.5 border-b border-[#f4f4f4]">
          <span className="text-[#bbb] text-xs">Dashboard</span>
          <span className="text-[#ddd] text-xs">›</span>
          <span className="text-[#5a9aaa] text-xs font-medium">{activeLabel}</span>
        </div>

        {/* Desktop view */}
        <div className="hidden sm:flex items-center justify-between px-8">
          <OhryaLogo />

          {/* Navigation */}
          <div className="flex items-center gap-2 flex-1 ml-8">
            {/* Navigation */}
            <nav className="flex gap-0 flex-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={tabStyle(activeTab === tab.id)}
                >
                  {tab.label}
                  {tab.id === "responses" && data && data.total > 0 && (
                    <span className="bg-[#5a9aaa] text-white rounded-full px-1.5 py-1 aspect-square text-[0.8rem] font-medium ml-2">
                      {data.total}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Refresh button */}
            <button
              onClick={load}
              title="Refresh"
              style={{
                background: "none",
                border: "1px solid #e0e8ec",
                borderRadius: 6,
                padding: "7px 12px",
                cursor: "pointer",
                color: "#888",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.8rem",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M23 4v6h-6M1 20v-6h6" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Refresh
            </button>

            {/* Logout — desktop */}
            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex items-center gap-1.5 text-[#4a8798] rounded-md px-3 py-1.5 text-[0.8rem] cursor-pointer bg-[#a9d0da]/10 hover:bg-[#a9d0da]/30 transition-colors duration-200 border border-[#4a8798]"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="#4a8798" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-8 lg:px-12 lg:py-8 mx-auto w-full">
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