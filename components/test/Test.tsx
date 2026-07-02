export default function Test() {
  return (
          <section className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-6">
            {/* 1 */}
            <div className="w-[500px] relative rounded-[24px] bg-gradient-to-r from-[#005A71] to-[#30B1D5]/80 text-white p-6 sm:p-7 shadow-md flex flex-col gap-6 min-h-[280px]">
              <div>
                <p className="text-xs uppercase font-bold tracking-[0.18em] text-[#ffffff]">
                  Total impact score
                </p>

                <div className="mt-4 grid grid-cols-2 gap-4 items-end">
                  <div className="flex items-end gap-3">
                    <h2 className="text-6xl font-semibold leading-none">Score</h2>
                    <span className="text-sm text-[#ffffff] pb-2">pts</span>
                  </div>

                  <div className="border-l border-white/30 pl-4">
                    <p className="text-xs text-white/75 mb-1">Your position on the Leaderboard is</p>
                    <span className="text-3xl text-[#FFBB00] font-semibold leading-none">1</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-[#ffffff] border-t border-white/20 pt-4">
                Keep sharing your referral link to continue increasing your score.
              </p>
            </div>

            {/* 2 */}
            <div className="w-[500px] relative rounded-[24px] bg-gradient-to-r from-[#005A71] to-[#30B1D5]/80 text-white p-6 sm:p-7 shadow-md flex flex-col gap-6 min-h-[280px]">
              <div>
                <p className="text-xs uppercase font-bold tracking-[0.18em] text-[#ffffff]">
                  Your impact
                </p>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/10 px-4 py-3.5">
                    <p className="text-xs text-white/75 mb-1">Total score</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-semibold leading-none">Score</span>
                      <span className="text-xs text-white/75">pts</span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/10 px-4 py-3.5">
                    <p className="text-xs text-white/75 mb-1">Leaderboard Rank</p>
                    <span className="text-3xl font-semibold leading-none">1</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-[#ffffff] border-t border-white/20 pt-4">
                Keep sharing your referral link to continue increasing your score.
              </p>
            </div>

            {/* 3 */}
            <div className="w-[500px] relative rounded-[24px] bg-gradient-to-r from-[#005A71] to-[#30B1D5]/80 text-white p-6 sm:p-7 shadow-md flex flex-col gap-6 min-h-[200px] overflow-visible">
              {/* Floating rank badge */}
              <div className="absolute -top-3.5 right-5 bg-[#FFC62B] text-[#4A3600] rounded-full px-4 py-2 text-[13px] font-semibold shadow-md">
                1 on leaderboard
              </div>

              <div>
                <p className="mt-2 text-xs uppercase font-bold tracking-[0.18em] text-[#ffffff]">
                  Total impact score
                </p>

                <div className="mt-4 flex items-end gap-3">
                  <h2 className="text-6xl font-semibold leading-none">Score</h2>
                  <span className="text-sm text-[#ffffff] pb-2">pts</span>
                </div>
              </div>

              <p className="text-sm text-[#ffffff] border-t border-white/20 pt-4">
                Keep sharing your referral link to continue increasing your score.
              </p>
            </div>

            {/* 4 */}
            <div className="w-[500px] relative rounded-[24px] bg-gradient-to-r from-[#005A71] to-[#30B1D5]/80 text-white p-6 sm:p-7 shadow-md flex flex-col gap-6 min-h-[280px]">
              <div>
                <p className="text-xs uppercase font-bold tracking-[0.18em] text-[#ffffff]">
                  Total impact score
                </p>

                <div className="mt-5 flex items-center gap-5">
                  {/* Score */}
                  <div className="flex-1 flex items-end gap-3">
                    <h2 className="text-5xl font-semibold leading-none">Score</h2>
                    <span className="text-sm text-[#ffffff] pb-1">pts</span>
                  </div>

                  {/* Medallion badge */}
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0 border-l border-white/20 pl-5">
                    <div
                      className="w-[76px] h-[76px] flex items-center justify-center shadow-md"
                      style={{
                        clipPath:
                          "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                        background: "linear-gradient(145deg, #FFE9A8, #FFC62B 45%, #B8860B 100%)",
                      }}
                    >
                      <div
                        className="w-16 h-16 flex flex-col items-center justify-center gap-0.5"
                        style={{
                          clipPath:
                            "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                          background: "linear-gradient(145deg, #06596D, #0A3A47)",
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFC62B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star-icon lucide-star"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>
                        <span className="text-base font-bold text-white leading-none">1</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-center leading-tight text-white/85 max-w-[90px]">
                      Your position on the leaderboard
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-[#ffffff] border-t border-white/20 pt-4">
                Keep sharing your referral link to continue increasing your score.
              </p>
            </div>

            {/* 5 */}
            <div className="w-[500px] relative rounded-[24px] bg-gradient-to-r from-[#005A71] to-[#30B1D5]/80 text-white p-6 sm:p-7 shadow-md flex flex-col gap-6 min-h-[200px] overflow-visible mt-11">

              {/* Floating medallion badge */}
              <div
                className="absolute -top-11 right-4 w-[116px] h-[116px] flex items-center justify-center shadow-lg"
                style={{
                  clipPath:
                    "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                  background: "linear-gradient(145deg, #FFE9A8, #FFC62B 45%, #B8860B 100%)",
                }}
              >
                <div
                  className="w-[102px] h-[102px] flex flex-col items-center justify-center gap-0.5 p-2"
                  style={{
                    clipPath:
                      "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                    background: "linear-gradient(145deg, #06596D, #0A3A47)",
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#FFC62B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star-icon lucide-star"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>
                  <span className="text-[19px] font-bold text-white leading-none">1</span>
                  <p className="text-[8.5px] text-center leading-tight text-white/85 max-w-[74px] mt-0.5">
                    Your position on the leaderboard
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase font-bold tracking-[0.18em] text-[#ffffff] max-w-[62%]">
                  Total impact score
                </p>

                <div className="mt-4 flex items-end gap-3">
                <h2 className="text-6xl font-semibold leading-none">
                  <span className="text-sm text-[#ffffff] pb-2">pts</span>
                  </h2>
                </div>
              </div>

              <p className="text-sm text-[#ffffff] border-t border-white/20 pt-4">
                Keep sharing your referral link to continue increasing your score.
              </p>
            </div>

            {/* 6 */}
            <div className="w-[500px] relative rounded-[24px] bg-gradient-to-r from-[#005A71] to-[#30B1D5]/80 text-white p-6 sm:p-7 shadow-md flex flex-col gap-6 min-h-[200px]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase font-bold tracking-[0.18em] text-[#ffffff]">
                    Total impact score
                  </p>
                  <div className="mt-4 flex items-end gap-3">
                    <h2 className="text-6xl font-semibold leading-none">Score</h2>
                    <span className="text-sm text-[#ffffff] pb-2">pts</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFC62B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crown-icon lucide-crown"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>
                  <span className="text-xl font-bold leading-none">1</span>
                  <p className="text-[10px] text-center text-white/80 leading-tight">
                    Leaderboard rank
                  </p>
                </div>
              </div>

              <p className="text-sm text-[#ffffff] border-t border-white/20 pt-4">
                Keep sharing your referral link to continue increasing your score.
              </p>
            </div>

            {/* 7 */}
            <div className="w-[500px] relative rounded-[24px] bg-gradient-to-r from-[#005A71] to-[#30B1D5]/80 text-white p-6 sm:p-7 shadow-md flex flex-col gap-6 min-h-[200px]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase font-bold tracking-[0.18em] text-[#ffffff]">
                    Total impact score
                  </p>
                  <div className="mt-4 flex items-end gap-3">
                    <h2 className="text-6xl font-semibold leading-none">Score</h2>
                    <span className="text-sm text-[#ffffff] pb-2">pts</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFC62B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crown-icon lucide-crown"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>
                    <span className="text-xl font-bold leading-none">1</span>
                  <p className="text-[10px] text-center text-white/80 leading-tight">
                    Leaderboard rank
                  </p>
                </div>
              </div>

              <p className="text-sm text-[#ffffff] border-t border-white/20 pt-4">
                Keep sharing your referral link to continue increasing your score.
              </p>
            </div>

            {/* 8 */}
            <div className="w-[500px] relative rounded-[24px] bg-gradient-to-r from-[#005A71] to-[#30B1D5]/80 text-white p-6 sm:p-7 shadow-md flex flex-col gap-6 min-h-[200px]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase font-bold tracking-[0.18em] text-[#ffffff]">
                    Total impact score
                  </p>
                  <div className="mt-4 flex items-end gap-3">
                    <h2 className="text-6xl font-semibold leading-none">Score</h2>
                    <span className="text-sm text-[#ffffff] pb-2">pts</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFC62B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crown-icon lucide-crown"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>
                  <span className="text-xl font-bold leading-none">1</span>
                  <p className="text-[10px] text-center text-white/80 leading-tight">
                    Leaderboard rank
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-white/20 pt-4">
                <p className="text-sm text-[#ffffff] flex-1">
                  Keep sharing your referral link to continue increasing your score.
                </p>
              </div>
            </div>

            {/* 9 */}
            <div className="w-[500px] relative rounded-[24px] bg-gradient-to-r from-[#005A71] to-[#30B1D5]/80 text-white p-6 sm:p-7 shadow-md flex flex-col gap-6 min-h-[200px]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase font-bold tracking-[0.18em] text-[#ffffff]">
                    Total impact score
                  </p>
                  <div className="mt-4 flex items-end gap-3">
                    <h2 className="text-6xl font-semibold leading-none">Score</h2>
                    <span className="text-sm text-[#ffffff] pb-2">pts</span>
                  </div>
                </div>

                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFC62B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crown-icon lucide-crown"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>
                  <span className="text-lg font-bold leading-none">1</span>
              </div>

              <p className="text-sm text-[#ffffff] border-t border-white/20 pt-4">
                Keep sharing your referral link to continue increasing your score.
              </p>
            </div>
            
          </section>
  );
}