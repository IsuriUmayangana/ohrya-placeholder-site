"use client";

import { useEffect, useState, useCallback } from "react";
import OhryaLogo from "./OhryaLogo";
import type { PublicUserStats } from "@/lib/survey-types";
import Loading from "@/app/loading";
import NotFound from "./ui/NotFond";
import Image from "next/image";

interface Props {
  slug: string;
}

export default function DashboardPage({ slug }: Props) {
  const [stats, setStats] = useState<PublicUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const referralLink = stats ? `https://form.ohrya.org/?ref=${stats.referralCode}` : "";
  const dashboardUrl = `https://dashboard.ohrya.org/dashboard/${slug}`;

  // Fetch stats from API
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/user/${slug}`);
      if (res.status === 404) { setNotFound(true); return; }
      if (res.ok) { setStats(await res.json()); setLoading(false); }
    } catch {
      setLoading(false);
    }
  }, [slug]);

  // Fetch stats every 10 seconds
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  // Copy link to clipboard
  function copyLink(link: string) {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  // Loading state
  if (loading && !notFound) {
    return (
      <Loading />
    );
  }

  // Not found state
  if (notFound) {
    return (
      <NotFound />
    );
  }

  // Calculate total score
  const totalScore = stats!.totalScore;
  const maxBar = 16;
  const progressPct = Math.min((totalScore / maxBar) * 100, 100);

  // Calculate survey and referral percentages
  const surveyPct = (stats!.surveyScore / 6) * 100;
  const referralPct = Math.min((stats!.referralScore / Math.max(totalScore || 1, 1)) * 100, 100);

  
  return (
    <div className="min-h-screen bg-[#f6f8f9]">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur bg-white/80 border-b border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-0 flex justify-center">
          <Image
            src="/logo.png"
            alt="Ohrya"
            width={160}
            height={160}
            className="w-auto h-auto dashboard-logo"
          />
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto px-4 py-8 lg:px-12">

        <div className="flex flex-col gap-6">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            
            {/* Content */}
            <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] gap-6 p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-6">
                <div>

                  <h1 className="lg:text-4xl text-2xl font-semibold text-[#0f172a] leading-tight"
                  >
                    Your Social Impact Dashboard
                  </h1>

                  <p className="lg:text-sm text-sm text-[#4a8798] mt-2"
                  >
                    {stats!.email}
                  </p>

                  <p className="mt-4 max-w-2xl text-sm text-slate-500 leading-6">
                    Track your survey score, referral momentum, and campaign participation in one place.
                    Your dashboard refreshes automatically as new responses come in.
                  </p>
                </div>

                {/* Score cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Survey score */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#4a8798] font-bold">Survey score</p>
                    <p className="mt-2 text-2xl font-semibold text-[#4a8798]">{stats!.surveyScore}</p>
                    <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#4a8798] transition-all duration-700"
                        style={{ width: `${surveyPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Referral bonus */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#c9a84c] font-bold">Referral bonus</p>
                    <p className="mt-2 text-2xl font-semibold text-[#c9a84c]">+{stats!.referralScore}</p>
                    <p className="mt-2 text-xs text-[#64748b]">
                      {stats!.referralCount} referral{stats!.referralCount !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Campaign */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#64748b] font-bold">Campaign</p>
                    <p className="mt-2 text-sm font-semibold text-[#2d2d2d]">{stats!.campaign}</p>
                    <p className="mt-2 text-xs text-[#64748b]">Your selected cause</p>
                  </div>
                </div>
              </div>

              {/* Score panel */}
              <div className="rounded-[24px] bg-[#6098AE] text-white p-6 sm:p-7 shadow-lg flex flex-col justify-between min-h-[280px]">
                <div>
                  <p className="text-xs uppercase font-bold tracking-[0.18em] text-[#ffffff]">Total impact score</p>
                  <div className="mt-4 flex items-end gap-3">
                    <h2 className="text-6xl font-semibold leading-none">{totalScore}</h2>
                    <span className="text-sm text-[#ffffff] pb-2">pts</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-8">
                  <div className="flex items-center justify-between text-[11px] text-[#ffffff] mb-2">
                    <span>Progress</span>
                    <span>{Math.round(progressPct)}%</span>
                  </div>

                  <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full flex rounded-full overflow-hidden" style={{ width: `${progressPct}%` }}>
                      <div
                        className="h-full bg-teal-400 transition-all duration-700"
                        style={{
                          width: totalScore > 0 ? `${(stats!.surveyScore / totalScore) * 100}%` : "0%",
                        }}
                      />
                      <div
                        className="h-full bg-amber-300 transition-all duration-700"
                        style={{
                          width: totalScore > 0 ? `${(stats!.referralScore / totalScore) * 100}%` : "0%",
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-[#ffffff]">
                    <span>Survey contribution</span>
                    <span>Referral contribution</span>
                  </div>

                  <p className="mt-4 text-sm text-[#ffffff]">
                    Keep sharing your referral link to continue increasing your score.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Lower grid */}
          <section className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-6">
            {/* Referral card */}
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[#2d2d2d] font-bold">Your referral score</p>
                <h3 className="text-base font-semibold text-[#2d2d2d]">+{stats!.referralScore}</h3>
                <p className="text-sm text-[#64748b] mt-1 leading-6">
                  Each friend who completes the survey gives you{" "}
                  <span className="font-semibold text-[#c9a84c]">+1 point</span>.
                </p>
              </div>
              <div className="flex items-start gap-4">
                {/* Referrals */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#64748b] font-bold">Referrals</p>
                    <p className="mt-2 text-2xl font-semibold text-[#2d2d2d]">{stats!.referralCount}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#64748b] font-bold">Referral share</p>
                    <p className="mt-2 text-2xl font-semibold text-[#c9a84c]">{Math.round(referralPct)}%</p>
                  </div>
                </div>
              </div>
                
            </div>

            {/* Share and earn more points */}
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-base font-semibold text-[#2d2d2d]">Share and earn more points</h3>
                  <p className="text-sm text-slate-500 mt-1 leading-6">
                    Each friend who completes the survey gives you{" "}
                    <span className="font-semibold text-[#c9a84c]">+1 point</span>.
                  </p>
                </div>

                {/* Referral link */}
                <div className="w-full flex items-center gap-2 border border-[#5A9AAA] rounded-lg p-3 bg-[#EEF5F6]">
                  <span className="flex-1 font-mono text-sm text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">{referralLink}</span>

                  <button
                    onClick={() => copyLink(referralLink)}
                    className="flex-shrink-0 bg-[#5A9AAA] hover:bg-[#477D8A] text-white rounded-full px-4 py-2 text-sm transition-all duration-200 cursor-pointer"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>

                {/* Share buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* WhatsApp button */}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Join me on OHRYA! GIVE. VOTE. SHINE.\n${referralLink}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 border border-[#2AA63E] hover:bg-[#EAFAED] text-[#2AA63E] rounded-full px-6 py-3 text-sm no-underline"
                  >
                    <svg width="20" height="20" viewBox="0 0 32 32" fill="#2AA63E"><path d="M16 2C8.28 2 2 8.28 2 16c0 2.46.67 4.88 1.94 7.02L2 30l7.17-1.88A13.94 13.94 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5c-2.26 0-4.47-.61-6.4-1.77l-.46-.27-4.25 1.11 1.14-4.13-.3-.48A11.47 11.47 0 014.5 16c0-6.34 5.16-11.5 11.5-11.5S27.5 9.66 27.5 16 22.34 27.5 16 27.5zm6.3-8.6c-.34-.17-2.02-1-2.33-1.11-.32-.12-.54-.17-.77.17-.22.34-.87 1.11-1.07 1.34-.2.22-.4.25-.74.08-.34-.17-1.44-.53-2.74-1.69-1.01-.9-1.7-2.02-1.89-2.36-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.22-.34.34-.57.11-.22.06-.42-.03-.59-.08-.17-.77-1.86-1.06-2.55-.28-.67-.56-.58-.77-.59h-.65c-.22 0-.57.08-.87.42-.3.34-1.14 1.11-1.14 2.71s1.17 3.14 1.33 3.36c.17.22 2.3 3.51 5.57 4.92.78.34 1.38.54 1.85.69.78.25 1.49.21 2.05.13.62-.09 1.92-.78 2.19-1.54.27-.76.27-1.41.19-1.54-.08-.13-.3-.21-.64-.38z"/></svg>
                    WhatsApp
                  </a>

                  {/* Email button */}
                  <a
                    href={`mailto:?subject=${encodeURIComponent("Join me on OHRYA")}&body=${encodeURIComponent(
                      `Take the OHRYA survey!\n\n${referralLink}`
                    )}`}
                    className="w-full flex items-center justify-center gap-2 bg-white text-[#A18330] border border-[#A18330] hover:bg-[#F9F5EB] rounded-full px-6 py-3 text-sm no-underline"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#A18330" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Email
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Footer bits */}
          <section className="flex flex-col items-center gap-3 pt-2">
            <div className="text-center">
              <p
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "0.78rem",
                  color: "#94a3b8",
                  marginBottom: 6,
                }}
              >
                Bookmark your personal dashboard
              </p>

              <button
                onClick={() => copyLink(dashboardUrl)}
                className="text-[12px] text-teal-700 font-mono underline underline-offset-4"
              >
                {dashboardUrl}
              </button>
            </div>

            <p
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "0.78rem",
                color: "#cbd5e1",
                textAlign: "center",
              }}
            >
              Score updates live every 10 seconds as friends complete the survey.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
