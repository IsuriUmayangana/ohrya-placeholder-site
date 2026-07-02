"use client";

import { useEffect, useState, useCallback } from "react";
import OhryaLogo from "./OhryaLogo";
import type { PublicUserStats } from "@/lib/survey-types";
import Loading from "@/app/loading";
import NotFound from "./ui/NotFond";
import Image from "next/image";
import Link from "next/link";

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


  const leaderboardRank = stats!.leaderboardRank ?? null;

  
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
          <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm pt-6">
            
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

                  {/* Referral Score */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#000000] font-medium">Referral Score</p>
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
              {/* 8 */}
              <div className="w-full sm:w-[500px] relative rounded-[20px] sm:rounded-[24px] bg-gradient-to-r from-[#005A71] to-[#30B1D5]/80 text-white p-5 sm:p-7 shadow-md flex flex-col gap-4 sm:gap-6 min-h-[160px] sm:min-h-[160px]">
                {/* Floating medallion badge */}
                <div
                  className="absolute -top-2 right-8 sm:-top-11 sm:right-10 w-[76px] h-[76px] sm:w-[116px] sm:h-[116px] flex items-center justify-center shadow-lg"
                  style={{
                    clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                    background: "linear-gradient(145deg, #FFE9A8, #FFC62B 45%, #B8860B 100%)",
                  }}
                >
                  <div
                    className="w-[66px] h-[66px] sm:w-[102px] sm:h-[102px] flex flex-col items-center justify-center gap-0.5 p-1.5 sm:p-2"
                    style={{
                      clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                      background: "linear-gradient(145deg, #06596D, #0A3A47)",
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" className="sm:w-[19px] sm:h-[19px]" viewBox="0 0 24 24" fill="none" stroke="#FFC62B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg>
                    <span className="text-[12px] sm:text-[19px] font-bold text-white leading-none">{leaderboardRank ?? "—"}</span>
                    <p className="text-[5.5px] sm:text-[8.5px] text-center leading-tight text-white/85 max-w-[52px] sm:max-w-[74px] mt-0.5">
                      Your position on the leaderboard
                    </p>
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] sm:text-xs uppercase font-bold tracking-[0.16em] sm:tracking-[0.18em] text-white">
                      Total impact score
                    </p>
                    <div className="mt-3 sm:mt-4 flex items-end gap-2 sm:gap-3">
                      <h2 className="text-4xl sm:text-6xl font-semibold leading-none">{totalScore}</h2>
                      <span className="text-xs sm:text-sm text-white pb-1.5 sm:pb-2">pts</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/20 pt-3 sm:pt-4">
                  <p className="text-xs sm:text-sm text-white flex-1">
                    Keep sharing your referral link to continue increasing your score.
                  </p>
                  <Link
                    href="/leaderboard"
                    className="bg-[#FFC62B] text-[#4A3600] text-xs font-semibold px-3.5 py-2 rounded-full whitespace-nowrap flex-shrink-0 hover:bg-[#FFD65C] transition-colors self-start sm:self-auto"
                  >
                    View leaderboard
                  </Link>
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
                  Every referral who completes the survey helps boost your score.
                </p>
                {/* Referrals */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#000000] font-medium">REFERRAL COUNT</p>
                    <p className="mt-2 text-2xl font-semibold text-[#2d2d2d]">{stats!.referralCount}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#000000] font-medium">CONVERSION RATE</p>

                    {/* TODO: conversion rate need to add */}
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
