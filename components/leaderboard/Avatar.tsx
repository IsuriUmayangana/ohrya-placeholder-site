"use client";

import { useState } from "react";
import Image from "next/image";
import { avatarColor } from "./leaderboardStyles";

const AVATAR_BG_CLASS: Record<string, string> = {
  "#5a9aaa": "bg-[#5a9aaa]",
  "#c9a84c": "bg-[#c9a84c]",
  "#e74c3c": "bg-[#e74c3c]",
  "#9b59b6": "bg-[#9b59b6]",
  "#27ae60": "bg-[#27ae60]",
  "#e67e22": "bg-[#e67e22]",
  "#3498db": "bg-[#3498db]",
  "#e91e63": "bg-[#e91e63]",
};

const AVATAR_DIMENSION_CLASS: Record<number, string> = {
  40: "size-10",
  52: "size-[52px]",
  58: "size-[58px]",
  72: "size-[72px]",
};

const AVATAR_TEXT_CLASS: Record<number, string> = {
  40: "text-[15.2px]",
  52: "text-[19.76px]",
  58: "text-[22.04px]",
  72: "text-[27.36px]",
};

const AVATAR_BASE_CLASS =
  "shrink-0 rounded-full border-[2.5px] border-white/25";

function avatarDimensionClass(size: number) {
  return AVATAR_DIMENSION_CLASS[size] ?? AVATAR_DIMENSION_CLASS[52];
}

function avatarTextClass(size: number) {
  return AVATAR_TEXT_CLASS[size] ?? AVATAR_TEXT_CLASS[52];
}

function initialsAvatarBgClass(name: string) {
  return AVATAR_BG_CLASS[avatarColor(name)] ?? "bg-[#5a9aaa]";
}

function InitialsAvatar({ name, size = 52 }: { name: string; size?: number }) {
  return (
    <div
      className={`flex items-center justify-center font-bold uppercase tracking-[0.04em] text-white ${AVATAR_BASE_CLASS} ${avatarDimensionClass(size)} ${avatarTextClass(size)} ${initialsAvatarBgClass(name)}`}
    >
      {name[0] ?? "?"}
    </div>
  );
}

export function Avatar({
  name,
  avatarUrl,
  size = 52,
}: {
  name: string;
  avatarUrl: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <InitialsAvatar name={name} size={size} />;
  }

  return (
    <Image
      src={avatarUrl}
      alt={name}
      width={size}
      height={size}
      unoptimized
      onError={() => setFailed(true)}
      className={`object-cover ${AVATAR_BASE_CLASS} ${avatarDimensionClass(size)}`}
    />
  );
}
