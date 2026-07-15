import { Avatar } from "./Avatar";
import { RankBadge } from "./RankBadge";
import type { LeaderboardEntry } from "./Types";
import { RANK_STYLE } from "./leaderboardStyles";

const DEFAULT_BADGE_COLOR = "#3893F5";
const DEFAULT_BADGE_FIRST_COLOR = "#A0C9FF";
const DEFAULT_BADGE_SECOND_COLOR = "#388DF5";

export function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const rankStyle = RANK_STYLE[entry.rank];

  const rowBg = rankStyle?.mobileBg || "bg-[#122A3E]";
  const rowGradient = rankStyle?.mobileGradient || "bg-gradient-to-b from-[#6098AE] to-[#0A1B29]";
  const rowScoreTextColor = rankStyle?.mobileScoreTextColor || "text-[#6098AE]";

  return (
    <div className={`rounded-[20px] p-[2px] shadow-[0_10px_28px_rgba(0,0,0,0.55)] ${rowGradient}`}>
      <div className={`flex items-center gap-3.5 rounded-[20px] ${rowBg} px-4 lg:px-8 py-3`}>
        <RankBadge
          rank={entry.rank}
          color={rankStyle?.starColor ?? DEFAULT_BADGE_COLOR}
          firstColor={rankStyle?.borderStart ?? DEFAULT_BADGE_FIRST_COLOR}
          secondColor={rankStyle?.borderEnd ?? DEFAULT_BADGE_SECOND_COLOR}
          size={60}
          textSize={16}
        />

        {/* 
          DISABLED: Avatar component is not used in the leaderboard row
          <Avatar name={entry.name} avatarUrl={entry.avatarUrl} size={40} />
        */}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[20px] font-regular tracking-medium leading-normal text-white">
            {entry.name}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className={`text-[20px] font-medium tracking-medium leading-normal ${rowScoreTextColor}`}>
            {Math.round(entry.totalScore)} pts
          </div>
          {entry.rank <= 3 && (
            <div className="mt-1 text-[14px] font-medium text-[#FF7676] sm:hidden">
              +{Math.round(entry.referralScore)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}