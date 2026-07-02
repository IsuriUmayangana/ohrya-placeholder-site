import { Avatar } from "./Avatar";
import { RankBadge } from "./RankBadge";
import type { LeaderboardEntry } from "./Types";
import { RANK_ROW_GRADIENT } from "./leaderboardStyles";

const ROW_BADGE_COLOR = "#3b82e0";
const ROW_BADGE_BORDER_COLOR = "#6098AE";
const ROW_BADGE_GRADIENT_COLOR = "#3b82e0";

export function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {

  const getMobileBg = (rank: number) => {
    if (rank === 1) return "max-sm:bg-yellow-500";
    return "";
  };

  const getMobileBorder = (rank: number) => {
    return `max-sm:${RANK_ROW_GRADIENT[rank]}`;
  };

  return (
    <div className={`p-[2px] rounded-[20px] bg-gradient-to-b from-[#6098AE] to-[#0A1B29] ${getMobileBorder(entry.rank)}`}>
      <div className={`flex items-center gap-3.5 rounded-[20px] bg-[#122A3E] ${getMobileBg(entry.rank)} px-5 py-4`}>
        <RankBadge rank={entry.rank} color={ROW_BADGE_COLOR} borderColor={ROW_BADGE_BORDER_COLOR} gradientColor={ROW_BADGE_GRADIENT_COLOR} size={30} />
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
