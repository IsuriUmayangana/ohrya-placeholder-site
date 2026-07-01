"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type LeaderboardEntry = {
  rank: number;
  name: string;
  totalScore: number;
  surveyScore: number;
  referralScore: number;
  referralCount: number;
  campaign: string;
  avatarUrl: string;
};

const AVATAR_COLORS = [
  "#5a9aaa", "#c9a84c", "#e74c3c", "#9b59b6",
  "#27ae60", "#e67e22", "#3498db", "#e91e63",
];

function avatarColor(name: string): string {
  let n = 0;
  for (const c of name) n += c.charCodeAt(0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

function InitialsAvatar({ name, size = 52 }: { name: string; size?: number }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: avatarColor(name),
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white", fontWeight: 700, fontSize: size * 0.38,
        border: "2.5px solid rgba(255,255,255,0.25)",
        flexShrink: 0, letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {name[0] ?? "?"}
    </div>
  );
}

function Avatar({ name, avatarUrl, size = 52 }: { name: string; avatarUrl: string; size?: number }) {
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
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        border: "2.5px solid rgba(255,255,255,0.25)",
        flexShrink: 0,
      }}
    />
  );
}

const RANK_STYLE: Record<number, { badge: string; glow: string; border: string; starColor: string }> = {
  1: { badge: "#FFD700", glow: "rgba(255,215,0,0.35)", border: "rgba(255,215,0,0.45)", starColor: "#FFD700" },
  2: { badge: "#c0392b", glow: "rgba(192,57,43,0.3)",  border: "rgba(231,76,60,0.4)",  starColor: "#e74c3c" },
  3: { badge: "#7d3c98", glow: "rgba(125,60,152,0.3)", border: "rgba(155,89,182,0.4)", starColor: "#9b59b6" },
};

function StarIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function PodiumCard({ entry }: { entry: LeaderboardEntry }) {
  const isFirst = entry.rank === 1;
  const style = RANK_STYLE[entry.rank];

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        width: isFirst ? 172 : 140,
        marginTop: isFirst ? 0 : 44,
      }}
    >
      {/* Star + rank badge */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
        <StarIcon color={style.starColor} size={isFirst ? 22 : 17} />
        <div
          style={{
            width: 32, height: 32, borderRadius: "50%",
            background: style.badge,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 800, fontSize: 15,
            boxShadow: `0 0 12px ${style.glow}`,
          }}
        >
          {entry.rank}
        </div>
      </div>

      {/* Card */}
      <div
        style={{
          background: "rgba(255,255,255,0.07)",
          border: `1.5px solid ${style.border}`,
          borderRadius: 18,
          padding: isFirst ? "22px 16px" : "16px 12px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          backdropFilter: "blur(10px)",
          width: "100%",
          boxShadow: `0 6px 32px ${style.glow}`,
        }}
      >
        <Avatar name={entry.name} avatarUrl={entry.avatarUrl} size={isFirst ? 68 : 52} />

        <div style={{ textAlign: "center" }}>
          <div style={{ color: "white", fontWeight: 700, fontSize: isFirst ? 15 : 13, lineHeight: 1.3 }}>
            {entry.name}
          </div>
          {entry.campaign && (
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 3 }}>
              {entry.campaign}
            </div>
          )}
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ color: isFirst ? "#FFD700" : "white", fontWeight: 800, fontSize: isFirst ? 24 : 19 }}>
            {Math.round(entry.totalScore)} pts
          </div>
          {entry.referralScore > 0 && (
            <div style={{ color: "#FFD700", fontSize: 12, fontWeight: 600, marginTop: 2 }}>
              +{Math.round(entry.referralScore)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => { setEntries(data); setLoading(false); })
      .catch(() => setLoading(false));

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetch("/api/leaderboard")
        .then((r) => r.json())
        .then(setEntries)
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  // Podium order: 2nd (left), 1st (center), 3rd (right)
  const podium =
    top3.length >= 3 ? [top3[1], top3[0], top3[2]] :
    top3.length === 2 ? [top3[1], top3[0]] :
    top3;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% 32%, #1b5f72 0%, #0d2a3a 45%, #060f1a 100%)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px 80px",
      }}
    >
      {/* Sunburst rays */}
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage:
            "repeating-conic-gradient(from 0deg at 50% 32%, rgba(255,255,255,0.022) 0deg, rgba(255,255,255,0.022) 1deg, transparent 1deg, transparent 14deg)",
        }}
      />

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 660 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <Image src="/logo.png" alt="Ohrya" width={120} height={120} style={{ width: "auto", height: 56 }} />
          </div>
          <div
            style={{
              color: "#FFD700",
              fontSize: "clamp(30px, 7vw, 46px)",
              fontWeight: 900,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              lineHeight: 1.05,
              textShadow: "0 0 40px rgba(255,215,0,0.45)",
            }}
          >
            Fairfluence
          </div>
          <div
            style={{
              color: "rgba(255,215,0,0.8)",
              fontSize: "clamp(13px, 3vw, 18px)",
              fontWeight: 600,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              marginTop: 4,
            }}
          >
            Leaderboard
          </div>
        </div>

        {loading ? (
          <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 80, fontSize: 16 }}>
            Loading…
          </div>
        ) : entries.length === 0 ? (
          <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 80, fontSize: 16 }}>
            No entries yet. Be the first!
          </div>
        ) : (
          <>
            {/* Podium – top 3 */}
            <div
              style={{
                display: "flex", justifyContent: "center", alignItems: "flex-end",
                gap: 12, marginBottom: 36,
              }}
            >
              {podium.map((entry) => (
                <PodiumCard key={entry.rank} entry={entry} />
              ))}
            </div>

            {/* 4th place and below */}
            {rest.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {rest.map((entry) => (
                  <div
                    key={entry.rank}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 14,
                      padding: "12px 18px",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div style={{ width: 26, textAlign: "center" }}>
                      <StarIcon color="#5a9aaa" size={18} />
                    </div>
                    <Avatar name={entry.name} avatarUrl={entry.avatarUrl} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "white", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {entry.name}
                      </div>
                      {entry.campaign && (
                        <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 11, marginTop: 1 }}>
                          {entry.campaign}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>
                        {Math.round(entry.totalScore)} pts
                      </div>
                      {entry.referralScore > 0 && (
                        <div style={{ color: "#FFD700", fontSize: 11, fontWeight: 600 }}>
                          +{Math.round(entry.referralScore)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
