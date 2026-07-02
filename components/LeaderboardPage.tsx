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
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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
    <div className="relative flex h-dvh flex-col overflow-hidden bg-cover bg-center bg-no-repeat bg-[url('/leaderboard-bg-mobile.svg'),radial-gradient(ellipse_at_50%_32%,#257291,#1B5F72,#0A394B)] sm:bg-[url('/leaderboard-bg.svg'),radial-gradient(ellipse_at_50%_32%,#257291,#1B5F72,#0A394B)]">

      <div className="relative z-[1] min-h-0 flex-1 overflow-y-auto overscroll-contain">

        <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col justify-center px-4 py-8">

          {/* HEADER */}
          <div className="text-center mb-11">
            <div className="mb-6 flex justify-center">
              <Image
                src="/logo.png"
                alt="Ohrya"
                width={120}
                height={120}
                className="h-14 w-auto"
              />
            </div>

            <div className="text-[#FFD700] text-[clamp(30px,7vw,46px)] font-extrabold tracking-[0.14em] uppercase leading-[1.05]">
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
                <div className="mb-9 flex items-end justify-center gap-3">
                  {podium.map((entry) => (
                    <PodiumCard key={entry.rank} entry={entry} />
                  ))}
                </div>

                {/* Rest */}
                {rest.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    {rest.map((entry) => (
                      <LeaderboardRow key={entry.rank} entry={entry} />
                    ))}
                  </div>
                )}
              </div>

              {/* ===================== */}
              {/* MOBILE VIEW */}
              {/* ===================== */}
              <div className="sm:hidden flex flex-col gap-2.5">
                {entries.map((entry) => (
                  <LeaderboardRow key={entry.rank} entry={entry} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}