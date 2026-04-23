"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import DateFilter, { type DateRange } from "./DateFilter";
import FiltersModal, { ActiveFilter } from "./FiltersModal";

const TEAL = "#5a9aaa";
const TEAL_LIGHT = "#a8d4de";

interface DataPoint { name: string; value: number; }

interface RawResponse {
  id: string; email: string; campaign: string; willGive: string;
  donationAmount: string; willVote: string; willShine: string;
  prefersEarning: string; surveyScore: number; referralScore: number;
  referralCount: number; totalScore: number; submittedAt: string;
  device: string; dashboardUrl: string;
}

interface StatsData {
  total: number;
  responses: RawResponse[];
}

// ---- Bar chart card ----
function QuestionChart({ title, data, total }: { title: string; data: DataPoint[]; total: number }) {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const answered = data.reduce((s, d) => s + d.value, 0);
  return (
    <div style={{ background: "white", border: "1px solid #e8f0f2", borderRadius: 10, padding: "24px" }}>
      <p style={{ fontFamily: "Georgia, serif", fontSize: "0.95rem", color: "#2d2d2d", fontWeight: "bold", marginBottom: 2 }}>{title}</p>
      <p style={{ fontFamily: "Georgia, serif", fontSize: "0.78rem", color: "#aaa", marginBottom: 16 }}>
        {answered} out of {total} answered this question
      </p>
      {data.length === 0 ? (
        <p style={{ fontFamily: "Georgia, serif", color: "#ccc", fontSize: "0.85rem" }}>No data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={sorted} barSize={40}>
            <XAxis dataKey="name" tick={{ fontFamily: "Georgia, serif", fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontFamily: "Georgia, serif", fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(val) => {
                const n = typeof val === "number" ? val : Number(val) || 0;
                return [`${n} (${total > 0 ? Math.round((n / total) * 100) : 0}%)`, "Responses"];
              }}
              contentStyle={{ fontFamily: "Georgia, serif", fontSize: 12, borderRadius: 8, border: "1px solid #e8f0f2" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {sorted.map((_, i) => (
                <Cell key={i} fill={i === 0 ? TEAL : TEAL_LIGHT} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ---- Tally helper ----
function tally(rows: RawResponse[], field: keyof RawResponse): DataPoint[] {
  const map: Record<string, number> = {};
  rows.forEach((r) => {
    const val = String(r[field] || "");
    if (!val) return;
    map[val] = (map[val] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export default function SummaryTab() {
  const [dateRange, setDateRange] = useState<DateRange>({ from: "", to: "", label: "All time" });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dateRange.from) params.set("from", dateRange.from);
    if (dateRange.to) params.set("to", dateRange.to);
    try {
      const res = await fetch(`/api/admin/stats?${params.toString()}`);
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Apply question-based filters client-side
  const filteredRows = useMemo(() => {
    if (!data?.responses) return [];
    return data.responses.filter((r) =>
      activeFilters.every((f) => {
        const val = (r as unknown as Record<string, string>)[f.fieldId] ?? "";
        switch (f.operator) {
          case "is_any_of":       return f.values.includes(val);
          case "is_not_any_of":  return !f.values.includes(val);
          case "is_equal_to":    return val === f.values[0];
          case "is_not_equal_to": return val !== f.values[0];
          case "is_empty":       return !val;
          case "is_not_empty":   return !!val;
          default:               return true;
        }
      })
    );
  }, [data, activeFilters]);

  const total = filteredRows.length;

  const charts = [
    { title: "Which campaign inspires you the most?",                                        data: tally(filteredRows, "campaign") },
    { title: "After watching the video, will you GIVE to a campaign?",                       data: tally(filteredRows, "willGive") },
    { title: "If you chose to donate, what amount feels right?",                             data: tally(filteredRows, "donationAmount") },
    { title: "Will you VOTE for a vetted nonprofit?",                                        data: tally(filteredRows, "willVote") },
    { title: "Will you SHINE by sharing your unique link?",                                  data: tally(filteredRows, "willShine") },
    { title: "Is earning recognition more appealing than relying on chance?",                data: tally(filteredRows, "prefersEarning") },
  ];

  const hasFilters = activeFilters.length > 0;

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {/* Date filter */}
        <DateFilter value={dateRange} onChange={setDateRange} />

        {/* Filters button */}
        <button
          onClick={() => setShowFilters(true)}
          style={{
            display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
            border: `1px solid ${hasFilters ? "#5a9aaa" : "#d0dde2"}`,
            borderRadius: 8, background: hasFilters ? "#e8f5f8" : "white",
            color: hasFilters ? "#5a9aaa" : "#555",
            fontFamily: "Georgia, serif", fontSize: "0.85rem", cursor: "pointer",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Filters{hasFilters ? ` (${activeFilters.length})` : ""}
        </button>

        {/* Active filter tags */}
        {activeFilters.map((f, i) => {
          const opLabel: Record<string, string> = { is_any_of: "is any of", is_not_any_of: "is not any of", is_equal_to: "=", is_not_equal_to: "≠", is_empty: "is empty", is_not_empty: "is not empty" };
          const valLabel = f.values.length > 0 ? f.values.join(", ") : "";
          return (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 5, background: "#e8f5f8", borderRadius: 20, padding: "4px 12px", fontFamily: "Georgia, serif", fontSize: "0.78rem", color: "#5a9aaa", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                {f.fieldId.replace(/([A-Z])/g, " $1").trim()} {opLabel[f.operator] ?? f.operator}{valLabel ? `: ${valLabel}` : ""}
              </span>
              <button onClick={() => setActiveFilters((a) => a.filter((_, idx) => idx !== i))}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#5a9aaa", fontSize: "0.9rem", lineHeight: 1, padding: 0, flexShrink: 0 }}>✕</button>
            </span>
          );
        })}

        {hasFilters && (
          <button onClick={() => setActiveFilters([])}
            style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "0.8rem", color: "#e74c3c", textDecoration: "underline" }}>
            Clear all
          </button>
        )}

        {/* Response count */}
        <span style={{ marginLeft: "auto", fontFamily: "Georgia, serif", fontSize: "0.82rem", color: "#aaa" }}>
          {loading ? "Loading…" : `${total} response${total !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Charts grid */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "#aaa", fontFamily: "Georgia, serif" }}>
          Loading…
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
          {charts.map((q) => (
            <QuestionChart key={q.title} title={q.title} data={q.data} total={total} />
          ))}
        </div>
      )}

      {/* Filters modal */}
      {showFilters && (
        <FiltersModal
          initial={activeFilters}
          onApply={setActiveFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}
