"use client";

import { useEffect, useState, useCallback } from "react";
import OhryaLogo from "./OhryaLogo";
import type { PublicUserStats } from "@/lib/survey-types";
import Loading from "@/app/loading";
import NotFound from "./ui/NotFond";
import Image from "next/image";
import Link from "next/link";
import { buildReferralSignupUrl, ensureAbsoluteReferralLink } from "@/lib/site-urls";

interface Props {
  slug: string;
}

export default function DashboardPage({ slug }: Props) {
  const [stats, setStats] = useState<PublicUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const referralLink = stats
    ? ensureAbsoluteReferralLink(buildReferralSignupUrl(stats.referralCode))
    : "";
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

  // Download social image
  function downloadSocialImage() {
    const link = document.createElement("a");
    link.href = "/referral-social-share/OHRYA.jpg";
    link.download = "OHRYA.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <a href="https://ohrya.org" target="_blank">
            <Image
              src="/logo.png"
              alt="Ohrya"
              width={160}
              height={160}
              className="w-auto h-auto dashboard-logo"
            />
          </a>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-[1440px] mx-auto px-4 py-8 lg:px-12">

        <div className="flex flex-col gap-6">

          {/* Hero */}
          <section className="relative overflow-visible rounded-[24px] border border-slate-200 bg-white shadow-sm pt-6">
            
            {/* Content */}
            <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(280px,440px)] gap-5 lg:gap-6 p-6 sm:p-8 lg:items-stretch">
              <div className="flex flex-col justify-between gap-6 min-w-0">
                <div>
                  {/* Title */}
                  <h1 className="lg:text-3xl xl:text-4xl text-2xl font-semibold text-[#000000] leading-tight"
                  >
                    Your Social Impact Dashboard
                  </h1>

                  {/* Name & email */}
                  <p className="lg:text-base xl:text-lg text-base font-bold text-[#4a8798] mt-3">
                    {stats!.name}
                  </p>
                  <p className="text-sm text-[#4a8798] mt-1 break-all">
                    {stats!.email}
                  </p>

                  {/* Description */}
                  <p className="mt-4 max-w-2xl text-sm text-[#000000] leading-6">
                    Track your survey score, referral momentum, and campaign participation in one place.
                    Your dashboard refreshes automatically as new responses come in.
                  </p>
                </div>

                {/* Score cards — stay 3-up once side-by-side starts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 lg:gap-3">
                  {/* Survey score */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 lg:p-4 min-w-0">
                    <p className="text-[10px] lg:text-xs uppercase tracking-[0.12em] lg:tracking-[0.16em] text-[#000000] font-medium">
                      Survey score
                    </p>
                    <p className="mt-2 text-xl lg:text-2xl font-semibold text-[#06596d]">{stats!.surveyScore}</p>
                    <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#06596d] transition-all duration-700"
                        style={{ width: `${surveyPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Referral Score */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 lg:p-4 min-w-0">
                    <p className="text-[10px] lg:text-xs uppercase tracking-[0.12em] lg:tracking-[0.16em] text-[#000000] font-medium">
                      Referral Score
                    </p>
                    <p className="mt-2 text-xl lg:text-2xl font-semibold text-[#FFBB00] truncate">
                      +{stats!.referralScore}
                    </p>
                    <p className="mt-2 text-xs text-[#000000]/50 truncate">
                      {stats!.referralCount} referral{stats!.referralCount !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Campaign */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 lg:p-4 min-w-0">
                    <p className="text-[10px] lg:text-xs uppercase tracking-[0.12em] lg:tracking-[0.16em] text-[#000000] font-medium">
                      Campaign
                    </p>
                    <p className="mt-2 text-xl lg:text-2xl font-semibold text-[#06596d] truncate">{stats!.campaign}</p>
                    <p className="mt-2 text-xs text-[#000000]/50 truncate">Your selected cause</p>
                  </div>
                </div>
              </div>

              {/* Score panel — fixed height, flexible width in the grid */}
              <div className="w-full h-auto lg:h-[280px] mt-10 md:mt-20 lg:mt-0 relative rounded-[24px] bg-gradient-to-r from-[#005A71] to-[#30B1D5]/80 text-white p-5 sm:p-6 lg:p-7 shadow-md flex flex-col justify-between gap-4 self-stretch lg:self-end">
                {/* Floating medallion badge */}
                <div
                  className="absolute -top-7 right-6 md:-top-14 md:right-8 lg:-top-10 lg:right-8 w-[96px] h-[96px] md:w-[132px] md:h-[132px] lg:w-[108px] lg:h-[108px] flex items-center justify-center shadow-lg"
                  style={{
                    clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                    background: "linear-gradient(145deg, #FFE9A8, #FFC62B 45%, #B8860B 100%)",
                  }}
                >
                  <div
                    className="w-[84px] h-[84px] md:w-[116px] md:h-[116px] lg:w-[94px] lg:h-[94px] flex flex-col items-center justify-center gap-0.5 p-2"
                    style={{
                      clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                      background: "linear-gradient(145deg, #06596D, #0A3A47)",
                    }}
                  >
                    
                    <span className="text-2xl md:text-3xl lg:text-2xl font-bold text-white leading-none">{leaderboardRank ?? "—"}</span>
                    <p className="text-[9px] md:text-[10px] lg:text-[8.5px] text-center leading-tight text-white/85 max-w-[62px] md:max-w-[80px] lg:max-w-[68px] mt-0.5">
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
                      <h2 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-semibold leading-none">{totalScore}</h2>
                      <span className="text-xs sm:text-sm text-white pb-1.5 sm:pb-2">pts</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-start gap-3 border-t border-white/20 pt-3 sm:pt-4">
                  <p className="text-xs sm:text-sm text-white">
                    Keep sharing your referral link to continue increasing your score.
                  </p>
                  <Link
                    href="https://leaderboard.ohrya.org/"
                    className="bg-[#FFC62B] text-[#4A3600] max-w-[150px] text-xs text-center font-semibold px-3.5 py-2 rounded-full whitespace-nowrap flex-shrink-0 hover:bg-[#FFD65C] transition-colors self-start"
                  >
                    View leaderboard
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Lower grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
            {/* Your referral link */}
            <div className="order-1 xl:order-2 md:col-span-2 xl:col-span-1 rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col gap-5 h-full">
                <h3 className="text-base font-semibold text-[#000000]">Your referral link</h3>
                <p className="text-sm text-[#000000] leading-6">
                  The more you share, the more you earn. Copy your referral link and share on social media, email, or any other platform to unlock additional points.
                </p>

                <div className="mt-auto w-full flex items-center gap-2 border border-[#5A9AAA] rounded-lg p-3 bg-[#EEF5F6]">
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

            {/* Referral score */}
            <div className="order-2 xl:order-1 rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col gap-5 h-full">
                <p className="text-base font-semibold text-[#000000]">Your referral score</p>
                <p className="text-sm text-[#000000] leading-6">
                  Every referral who completes the survey helps boost your score.
                </p>
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

            {/* Share with a social visual */}
            <div className="order-3 rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col gap-5 h-full">
                <h3 className="text-base font-semibold text-[#000000]">Share with a social visual</h3>
                <p className="text-sm text-[#000000] leading-6">
                  Save this ready-to-post graphic and share it anywhere along with your referral link to start earning points faster.
                </p>

                <div className="mt-auto flex justify-end">
                  <button
                    type="button"
                    onClick={downloadSocialImage}
                    aria-label="Download social share image"
                    className="text-[#5A9AAA] hover:text-[#477D8A] transition-colors cursor-pointer bg-transparent border-none p-2"
                  >
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                      <path
                        d="M24 32V8M24 32L16 24M24 32L32 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 36V38C8 39.1046 8.89543 40 10 40H38C39.1046 40 40 39.1046 40 38V36"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Footer bits */}
          <section className="flex flex-col items-center gap-3 pt-6">
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
