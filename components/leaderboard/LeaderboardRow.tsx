import { Avatar } from "./Avatar";
import { RankBadge } from "./RankBadge";
import type { LeaderboardEntry } from "./Types";
import { RANK_STYLE } from "./leaderboardStyles";

const DEFAULT_BADGE_COLOR = "#3993f4";
const DEFAULT_BADGE_FIRST_COLOR = "#a0c6ff";
const DEFAULT_BADGE_SECOND_COLOR = "#3990f1";

export function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const rankStyle = RANK_STYLE[entry.rank];

  const rowBg = rankStyle?.mobileBg || "bg-[#122A3E]";
  const rowGradient = rankStyle?.mobileGradient || "bg-gradient-to-b from-[#6098AE] to-[#0A1B29]";

  return (
    <div className={`p-[2px] rounded-[20px] ${rowGradient}`}>
      <div className={`flex items-center gap-3.5 rounded-[20px] ${rowBg} px-5 py-4`}>
        <RankBadge
          rank={entry.rank}
          color={rankStyle?.starColor ?? DEFAULT_BADGE_COLOR}
          firstColor={rankStyle?.borderStart ?? DEFAULT_BADGE_FIRST_COLOR}
          secondColor={rankStyle?.borderEnd ?? DEFAULT_BADGE_SECOND_COLOR}
          size={40}
        />
        <Avatar name={entry.name} avatarUrl={entry.avatarUrl} size={40} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-bold text-white">
            {entry.name}
          </div>
        </div>
        <div className="shrink-0 text-lg font-medium text-[#6098AE]">
          {Math.round(entry.totalScore)} pts
        </div>
      </div>
    </div>
  );
}