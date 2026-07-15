import { RankBadge } from "./RankBadge";
import { RANK_STYLE } from "./leaderboardStyles";
import type { LeaderboardEntry } from "./Types";

export function PodiumCard({ entry }: { entry: LeaderboardEntry }) {
  const isFirst = entry.rank === 1;
  const style = RANK_STYLE[entry.rank];

  return (
    <div className="relative min-w-0 flex-1 max-w-[300px]">
      {/* Rank Badge */}
      <div className="absolute -top-7 left-0 right-0 z-10 flex justify-center md:-top-8 lg:-top-10">
        <div className="origin-bottom scale-[0.7] md:scale-[0.85] lg:scale-100">
          <RankBadge
            rank={entry.rank}
            color={style.starColor}
            firstColor={style.borderStart}
            secondColor={style.borderEnd}
            size={85}
            textSize={26}
          />
        </div>
      </div>

      {/* Card */}
      <div
        className={`relative z-[1] flex w-full flex-col items-center justify-center rounded-t-[14px] border-2 border-transparent px-3 pb-4 md:rounded-t-[16px] md:px-4 md:pb-5 lg:rounded-t-[18px] lg:px-[18px] lg:pb-[22px] ${isFirst ? "h-[195px] pt-5 md:h-[230px] md:pt-6 lg:h-[270px] lg:pt-7" : "h-[165px] pt-9 md:h-[195px] md:pt-11 lg:h-[225px] lg:pt-12"}`}
        style={{
          background: `linear-gradient(${style.bgColor}, ${style.bgColor}) padding-box, linear-gradient(to bottom, ${style.rankBoarder}, #0A1B29) border-box`,
        }}
      >
        {/* Name + scores vertically centered as one block */}
        <div className="flex w-full flex-col items-center gap-3 md:gap-4 lg:gap-5">
          <div className="w-full text-center">
            <div className="line-clamp-2 h-[2.5em] break-words font-semibold leading-[1.25] text-white text-[16px] sm:text-[18px] md:text-[22px] lg:text-[26px]">
              {entry.name}
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5 md:gap-2">
            <div className="font-semibold leading-[1.25] text-[#FFC62B] text-[16px] sm:text-[18px] md:text-[22px] lg:text-[26px]">
              {Math.round(entry.totalScore)} pts
            </div>
            <div className="font-medium leading-[1.25] text-[#FF7676] text-[16px] sm:text-[18px] md:text-[22px] lg:text-[26px]">
              +{Math.round(entry.referralScore)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
