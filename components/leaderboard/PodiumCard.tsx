import { Avatar } from "./Avatar";
import { RankBadge } from "./RankBadge";
import { RANK_BADGE_BORDER_COLOR, RANK_BADGE_GRADIENT_COLOR, RANK_STYLE } from "./leaderboardStyles";
import type { LeaderboardEntry } from "./Types";

const CARD_GLOW_SHADOW: Record<number, string> = {
  1: "shadow-[0_10px_30px_rgba(255,215,0,0.35)]",
  2: "shadow-[0_10px_30px_rgba(192,57,43,0.3)]",
  3: "shadow-[0_10px_30px_rgba(125,60,152,0.3)]",
};

export function PodiumCard({ entry }: { entry: LeaderboardEntry }) {
  const isFirst = entry.rank === 1;
  const style = RANK_STYLE[entry.rank];

  const avatarSize = isFirst ? 72 : 58;
  const badgeSize = 70;


  return (
    <div
      className={`relative`}
    >
      {/* Rank Badge */}
      <div className="absolute -top-10 left-0 right-0 z-10 flex justify-center">
        <RankBadge
          rank={entry.rank}
          color={style.starColor}
          firstColor={style.borderStart}
          secondColor={style.borderEnd}
          size={badgeSize}
        />
      </div>

      {/* Card */}
      <div className="rounded-t-[18px] p-[2px] bg-gradient-to-b from-[#6098AE] to-[#0A1B29] w-[260px] shadow-[0_10px_20px_-10px_rgba(0,0,0,0.6)]">
        <div className={`flex flex-col items-center rounded-t-[18px] bg-[#122A3E] px-[18px] pt-7 pb-[22px] w-[260px] ${isFirst ? "h-[270px]" : "h-[225px]"}`}>

          {/* Avatar */}
          <div className="mb-3.5">
            <Avatar
              name={entry.name}
              avatarUrl={entry.avatarUrl}
              size={avatarSize}
            />
          </div>

          {/* Name */}
          <div className="mb-8 text-center">
            <div
              className={`font-semibold leading-[1.25] text-white ${isFirst ? "text-xl" : "text-[17px]"}`}
            >
              {entry.name}
            </div>
          </div>

          {/* Score */}
          <div className="text-center">
            <div
              className={`font-extrabold leading-none text-[#FFC933] text-[30px]`}
            >
              {Math.round(entry.totalScore)} pts
            </div>

            {isFirst && entry.referralScore > 0 && (
              <div className="mt-3 text-[22px] font-medium text-[#F57BA6]">
                +{Math.round(entry.referralScore)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
