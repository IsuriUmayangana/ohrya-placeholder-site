"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PodiumCard } from "./leaderboard/PodiumCard";
import { LeaderboardRow } from "./leaderboard/LeaderboardRow";
import type { LeaderboardEntry } from "./leaderboard/Types";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const interval = setInterval(() => {
      fetch("/api/leaderboard")
        .then((r) => r.json())
        .then(setEntries)
        .catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  // Podium order: 2nd (left), 1st (center), 3rd (right)
  const podium =
    top3.length >= 3
      ? [top3[1], top3[0], top3[2]]
      : top3.length === 2
      ? [top3[1], top3[0]]
      : top3;

  return (
    <div className="relative min-h-dvh">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute left-1/2 top-0 h-[max(100dvh,1100px)] w-[max(100vw,1100px)] -translate-x-1/2 bg-no-repeat sm:h-[max(100dvh,1400px)] sm:w-[max(100vw,1440px)]"
          style={{
            backgroundImage: `
              url('/leaderboard-bg.svg'),
              radial-gradient(ellipse 85% 75% at 50% 45%, #2F95BE 0%, #1D637E 42%, #04374B 78%)
            `,
            backgroundSize: "cover, cover",
            backgroundPosition: "center center, center center",
          }}
        />
      </div>

      <div className="relative z-[1] mx-auto flex min-h-dvh w-full max-w-[950px] flex-col justify-center px-4 py-8">
        {/* HEADER */}
        <div className="mb-11 text-center">
          <div className="mt-5 mb-8 flex justify-center">
            <a href="https://ohrya.org" target="_blank">
              <Image
                src="/logo-white.svg"
                alt="Ohrya"
                width={120}
                height={120}
                className="z-20 h-10 w-auto"
              />
            </a>
          </div>

          <div className="text-[clamp(30px,7vw,46px)] mt-5 mb-6 font-extrabold uppercase leading-[1.05] tracking-[0.14em] text-[#FFFFFF]">
            Leaderboard
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="mt-20 text-center text-base text-white/40">
            Loading…
          </div>
        ) : entries.length === 0 ? (
          <div className="mt-20 text-center text-base text-white/40">
            No entries yet. Be the first!
          </div>
        ) : (
          <>
            {/* ===================== */}
            {/* DESKTOP VIEW (SM+) */}
            {/* ===================== */}
            <div className="hidden sm:block">
              {/* Podium */}
              <div className="relative mx-auto mb-14 w-full max-w-[920px]">
                <div className="relative z-[1] flex items-end justify-center gap-2 md:gap-2.5 lg:gap-3">
                  {podium.map((entry) => (
                    <PodiumCard key={entry.rank} entry={entry} />
                  ))}
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-0 right-0 top-full z-0 h-8"
                  style={{
                    background: "rgba(0, 6, 12, 0.75)",
                    borderRadius: "100%",
                    filter: "blur(22px)",
                    transform: "translateY(-4px) scaleY(1.8)",
                  }}
                />
              </div>

              {/* Rest */}
              {rest.length > 0 && (
                <div className="flex flex-col gap-5">
                  {rest.map((entry) => (
                    <LeaderboardRow key={entry.rank} entry={entry} />
                  ))}
                </div>
              )}
            </div>

            {/* ===================== */}
            {/* MOBILE VIEW */}
            {/* ===================== */}
            <div className="flex flex-col gap-5 sm:hidden">
              {entries.map((entry) => (
                <LeaderboardRow key={entry.rank} entry={entry} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
