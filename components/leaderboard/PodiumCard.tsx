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
        className={`relative z-[1] flex w-full flex-col items-center rounded-t-[14px] border-2 border-transparent px-3 pt-5 pb-4 md:rounded-t-[16px] md:px-4 md:pt-6 md:pb-5 lg:rounded-t-[18px] lg:px-[18px] lg:pt-7 lg:pb-[22px] ${isFirst ? "h-[195px] md:h-[230px] lg:h-[270px]" : "h-[165px] md:h-[195px] lg:h-[225px]"}`}
        style={{
          background: `linear-gradient(${style.bgColor}, ${style.bgColor}) padding-box, linear-gradient(to bottom, ${style.rankBoarder}, #0A1B29) border-box`,
        }}
      >
          {/* Name */}
          <div className="mt-5 mb-5 w-full text-center md:mt-6 md:mb-6 lg:mt-8 lg:mb-8">
            <div
              className="line-clamp-2 break-words font-semibold leading-[1.25] text-white text-[16px] sm:text-[18px] md:text-[22px] lg:text-[26px]"
            >
              {entry.name}
            </div>
          </div>

          {/* Score */}
          <div className="text-center">
            <div
              className="font-semibold leading-[1.25] text-[#FFC62B] text-[16px] sm:text-[18px] md:text-[22px] lg:text-[26px]"
            >
              {Math.round(entry.totalScore)} pts
            </div>

            {/* Referral Score */}
            <div className="mt-2 text-[14px] font-medium text-[#FF7676] md:mt-2.5 md:text-[16px] lg:mt-3 lg:text-[20px]">
              +{Math.round(entry.referralScore)}
            </div>
          </div>
      </div>
    </div>
  );
}
