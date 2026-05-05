"use client";

import { useState, useRef, useEffect } from "react";
import OhryaLogo from "../OhryaLogo";

type TabId = "insights" | "summary" | "responses";

const TABS: { id: TabId; label: string }[] = [
  { id: "insights", label: "Insights" },
  { id: "summary", label: "Summary" },
  { id: "responses", label: "Responses" },
];

interface DashboardNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  totalResponses?: number;
  onRefresh: () => void;
  onLogout: () => void;
}

export default function DashboardNav({
  activeTab,
  onTabChange,
  totalResponses,
  onRefresh,
  onLogout,
}: DashboardNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeLabel = TABS.find((t) => t.id === activeTab)?.label ?? "";

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="bg-white border-b border-[#e8f0f2] fixed top-0 left-0 right-0 z-20">

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between px-8 py-1">
        
        {/* Left */}
        <div className="flex items-center gap-6">
          <OhryaLogo />

          {/* Tabs */}
          <nav className="flex gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 text-sm border-b-2 transition cursor-pointer ${
                  activeTab === tab.id
                    ? "border-[#5a9aaa] text-[#5a9aaa]"
                    : "border-transparent text-[#888]"
                }`}
              >
                {tab.label}
                {tab.id === "responses" && totalResponses && totalResponses > 0 && (
                  <span className="ml-2 bg-[#5a9aaa] text-white text-xs rounded-full px-2 py-0.5">
                    {totalResponses}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <button
            onClick={onRefresh}
            className="flex items-center cursor-pointer gap-2 border border-[#e0e8ec] px-3 py-1.5 rounded-md text-sm text-[#666] hover:bg-[#f7f9fa]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </button>

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="flex items-center cursor-pointer gap-2 border border-[#4a8798] text-[#4a8798] px-3 py-1.5 rounded-md text-sm hover:bg-[#a9d0da]/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
            </svg>
            Sign out
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-1 border-b border-[#f4f4f4]">
        <OhryaLogo />

        <button
          onClick={() => setMenuOpen(true)}
          className="flex flex-col justify-center items-center w-9 h-9 rounded-md border border-[#e0e8ec] gap-[5px]"
        >
          <span className="w-4 h-[1.5px] bg-[#5a9aaa]" />
          <span className="w-4 h-[1.5px] bg-[#5a9aaa]" />
          <span className="w-4 h-[1.5px] bg-[#5a9aaa]" />
        </button>
      </div>

      {/* Mobile breadcrumb */}
      <div className="lg:hidden flex items-center gap-2 px-4 py-2 border-b border-[#f4f4f4] text-xs">
        <span className="text-[#bbb]">Dashboard</span>
        <span className="text-[#ddd]">›</span>
        <span className="text-[#5a9aaa] font-medium">{activeLabel}</span>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 ">
            <OhryaLogo />
            <button onClick={() => setMenuOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#4a8798" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <nav className="flex-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setMenuOpen(false);
                }}
                className={`w-full text-left px-6 py-4 cursor-pointer ${
                  activeTab === tab.id
                    ? "text-[#5a9aaa] bg-[#5a9aaa]/10"
                    : "text-[#444]"
                }`}
              >
                {tab.label}
                {tab.id === "responses" && totalResponses && totalResponses > 0 && (
                  <span className="ml-2 bg-[#5a9aaa] text-white text-xs rounded-full px-2 py-0.5">
                    {totalResponses}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 flex flex-col gap-2">
            <button
                onClick={onRefresh}
                className="flex items-center cursor-pointer gap-2 border border-[#e0e8ec] px-3 py-1.5 rounded-md text-sm text-[#666] hover:bg-[#f7f9fa]"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Refresh
            </button>

            {/* Logout button */}
            <button
                onClick={onLogout}
                className="flex items-center cursor-pointer gap-2 border border-[#4a8798] text-[#4a8798] px-3 py-1.5 rounded-md text-sm bg-[#4a8798]/20"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                </svg>
                Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

