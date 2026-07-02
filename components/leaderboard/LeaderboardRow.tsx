import { Avatar } from "./Avatar";
import { RankBadge } from "./RankBadge";
import type { LeaderboardEntry } from "./Types";
import { RANK_STYLE } from "./leaderboardStyles";

const DEFAULT_BADGE_COLOR = "#3993f4";
const DEFAULT_BADGE_FIRST_COLOR = "#a0c6ff";
const DEFAULT_BADGE_SECOND_COLOR = "#3990f1";

export function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const rankStyle = RANK_STYLE[entry.rank];

  const getMobileBg = (rank: number) => {
    if (rank === 1) return `max-sm:bg-[${RANK_STYLE[rank].mobileBg}]`;
    return "";
  };

  const getMobileGradient = (rank: number) => {
    const style = RANK_STYLE[rank];
    return style ? `max-sm:${style.mobileGradient}` : "";
  };

  return (
    <div className={`p-[2px] rounded-[20px] bg-gradient-to-b from-[#6098AE] to-[#0A1B29] ${getMobileGradient(entry.rank)}`}>
      <div className={`flex items-center gap-3.5 rounded-[20px] bg-[#122A3E] ${getMobileBg(entry.rank)} px-5 py-4`}>
        <RankBadge
          rank={entry.rank}
          color={rankStyle?.starColor ?? DEFAULT_BADGE_COLOR}
          firstColor={rankStyle?.borderStart ?? DEFAULT_BADGE_FIRST_COLOR}
          secondColor={rankStyle?.borderEnd ?? DEFAULT_BADGE_SECOND_COLOR}
          size={30}
        />
        <Avatar name={entry.name} avatarUrl={entry.avatarUrl} size={40} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-bold text-white">
            {entry.name}
          </div>
          <div className="mt-px text-xs text-white/40">
            {entry.email}
          </div>
        </div>
        <div className="shrink-0 text-lg font-bold text-white">
          {Math.round(entry.totalScore)} pts
        </div>
      </div>
    </div>
  );
}