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
  const surveyPct = (stats!.surveyScore / 10) * 100;
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
      <main className="max-w-[1440px] mx-auto px-4 py-8 lg:px-12">

        <div className="flex flex-col gap-6">

          {/* Hero */}
          <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            
            {/* Content */}
            <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] gap-6 p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-6">
                <div>
                  {/* Title */}
                  <h1 className="lg:text-4xl text-2xl font-semibold text-[#000000] leading-tight"
                  >
                    Your Social Impact Dashboard
                  </h1>

                  {/* Email */}
                  <p className="lg:text-sm text-sm text-[#4a8798] mt-2"
                  >
                    {stats!.email}
                  </p>

                  {/* Description */}
                  <p className="mt-4 max-w-2xl text-sm text-[#000000] leading-6">
                    Track your survey score, referral momentum, and campaign participation in one place.
                    Your dashboard refreshes automatically as new responses come in.
                  </p>
                </div>

                {/* Score cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Survey score */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#000000] font-medium">Survey score</p>
                    <p className="mt-2 text-2xl font-semibold text-[#06596d]">{stats!.surveyScore}</p>
                    <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#06596d] transition-all duration-700"
                        style={{ width: `${surveyPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Referral bonus */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#000000] font-medium">Referral bonus</p>
                    <p className="mt-2 text-2xl font-semibold text-[#FFBB00]">+{stats!.referralScore}</p>
                    <p className="mt-2 text-xs text-[#000000]/50">
                      {stats!.referralCount} referral{stats!.referralCount !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Campaign */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#000000] font-medium">Campaign</p>
                    <p className="mt-2 text-2xl font-semibold text-[#06596d]">{stats!.campaign}</p>
                    <p className="mt-2 text-xs text-[#000000]/50">Your selected cause</p>
                  </div>
                </div>
              </div>

              {/* Score panel */}
              <div className="relative rounded-[24px] bg-gradient-to-r from-[#005A71] to-[#30B1D5]/80 text-white p-6 sm:p-7 shadow-md flex flex-col gap-6 min-h-[280px]">
                <div>
                  <p className="text-xs uppercase font-bold tracking-[0.18em] text-[#ffffff]">
                    Total impact score
                  </p>

                  <div className="flex items-center justify-between w-full">
                    <div className="mt-4 flex items-end gap-3 flex-1">
                      <h2 className="text-6xl font-semibold leading-none">{totalScore}</h2>
                      <span className="text-sm text-[#ffffff] pb-2">pts</span>
                    </div>
                  
                    {/* Top right legend */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="w-full flex items-center gap-1.5 px-2.5 py-1 text-[12px] lg:tracking-[0.05em] font-medium text-white backdrop-blur-sm bg-[#06596D]/20 border border-white/30 rounded-lg">
                        <span className="w-3 h-3 rounded-full bg-teal-400 flex-shrink-0" />
                        Survey
                      </div>
                      <div className="w-full flex items-center gap-1.5 px-2.5 py-1 text-[12px] lg:tracking-[0.05em] font-medium text-white backdrop-blur-sm bg-[#06596D]/20 border border-white/30 rounded-lg">
                        <span className="w-3 h-3 rounded-full bg-[#FFC62B] flex-shrink-0" />
                        Referral
                      </div>
                    </div>
                  </div>

                </div>

                {/* Progress */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[12px] text-[#ffffff] mb-2">
                    <span>Progress</span>
                    <span className="font-medium tracking-[0.10em]">{Math.round(progressPct)}%</span>
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
                        className="h-full bg-[#FFC62B] transition-all duration-700"
                        style={{
                          width: totalScore > 0 ? `${(stats!.referralScore / totalScore) * 100}%` : "0%",
                        }}
                      />
                    </div>
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
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col gap-5">
                <p className="text-base font-semibold text-[#000000]">Your referral score</p>
                <p className="text-sm text-[#000000] leading-6">
                  Each friend who completes the survey gives you{" "}
                  <span className="font-bold text-[#FFBB00]">+1 point</span>.
                </p>
                {/* Referrals */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#000000] font-medium">Referrals</p>
                    <p className="mt-2 text-2xl font-semibold text-[#2d2d2d]">{stats!.referralCount}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#000000] font-medium">Referral share</p>
                    <p className="mt-2 text-2xl font-semibold text-[#FFBB00]">{Math.round(referralPct)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Share and earn more points */}
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col gap-5">
                <h3 className="text-base font-semibold text-[#000000]">Share and earn more points</h3>
                <p className="text-sm text-[#000000] leading-6">
                  The more you share, the more you earn. Copy your referral link and share on social media, email, or any other platform to unlock additional points.
                </p>

                {/* Referral link */}
                <div className="w-full flex items-center gap-2 border border-[#5A9AAA] rounded-lg p-3 bg-[#EEF5F6]">
                  <span className="flex-1 text-sm text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">{referralLink}</span>

                  <button
                    onClick={() => copyLink(referralLink)}
                    className="flex-shrink-0 bg-[#5A9AAA] hover:bg-[#477D8A] text-white rounded-full px-4 py-2 text-sm transition-all duration-200 cursor-pointer"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>

                
              </div>
            </div>
          </section>

          {/* Footer bits */}
          <section className="flex flex-col items-center gap-3 pt-2">
            <div className="text-center">
              <p className="text-xs text-[#94a3b8] mb-2"
              >
                Bookmark your personal dashboard
              </p>

              <button
                className="text-xs text-teal-700 underline underline-offset-4"
              >
                {dashboardUrl}
              </button>
            </div>

            <p
              className="text-xs text-[#94a3b8] text-center"
            >
              Score updates live every 10 seconds as friends complete the survey.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
