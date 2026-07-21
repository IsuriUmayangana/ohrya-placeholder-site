"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PodiumCard } from "./leaderboard/PodiumCard";
import { LeaderboardRow } from "./leaderboard/LeaderboardRow";
import type { LeaderboardEntry } from "./leaderboard/Types";

const PAGE_SIZE = 10;

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

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

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const pageEntries = entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const top3 = entries.slice(0, 3);
  const showPodium = page === 1 && top3.length > 0;
  const desktopRows = page === 1 ? pageEntries.slice(3) : pageEntries;

  // Podium order: 2nd (left), 1st (center), 3rd (right)
  const podium =
    top3.length >= 3
      ? [top3[1], top3[0], top3[2]]
      : top3.length === 2
      ? [top3[1], top3[0]]
      : top3;

  function goToPage(next: number) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="relative min-h-dvh bg-[#04374B]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-no-repeat"
          style={{
            backgroundImage: `
              url('/leaderboard-bg.svg'),
              radial-gradient(ellipse 85% 75% at 50% 45%, #2F95BE 0%, #1D637E 42%, #04374B 78%)
            `,
            backgroundSize: "cover, cover",
            backgroundPosition: "center top, center top",
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
            {/* DESKTOP VIEW (SM+) */}
            <div className="hidden sm:block">
              {showPodium && (
                <div className="relative mx-auto mb-5 w-full max-w-[920px]">
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
              )}

              {desktopRows.length > 0 && (
                <div className="flex flex-col gap-5">
                  {desktopRows.map((entry) => (
                    <LeaderboardRow key={entry.rank} entry={entry} />
                  ))}
                </div>
              )}
            </div>

            {/* MOBILE VIEW */}
            <div className="flex flex-col gap-5 sm:hidden">
              {pageEntries.map((entry) => (
                <LeaderboardRow key={entry.rank} entry={entry} />
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-col gap-4">

                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => goToPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="cursor-pointer flex items-center gap-2 rounded-xl border border-[#a9d0da] bg-[#a9d0da] px-3.5 py-2 text-[12px] text-[#04374B] transition-colors hover:bg-[#a9d0da]/90 hover:border-[#a9d0da]/90 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="w-4 h-4"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
                     Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => goToPage(p)}
                      className={`min-w-[34px] h-[34px] cursor-pointer rounded-xl border text-[12px] transition-colors ${
                        p === page
                          ? "border-[#4a8798] bg-[#4a8798] font-bold text-white"
                          : "border-[#a9d0da] bg-[#a9d0da] text-[#04374B] hover:bg-[#a9d0da]/90 hover:border-[#a9d0da]/90 "
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => goToPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="cursor-pointer flex items-center gap-2 rounded-xl border border-[#a9d0da] bg-[#a9d0da] px-3.5 py-2 text-[12px] text-[#04374B] transition-colors hover:bg-[#a9d0da]/90 hover:border-[#a9d0da]/90 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" strokeWidth="2" className="w-4 h-4"><path fill="#04374B" d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
