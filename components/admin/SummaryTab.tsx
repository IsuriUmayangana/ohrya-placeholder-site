"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";
import DateFilter, { type DateRange } from "./DateFilter";
import FiltersModal, { ActiveFilter } from "./FiltersModal";

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

// ---- Animated Bar Chart Card ----
function QuestionChart({ title, data, total }: { title: string; data: DataPoint[]; total: number }) {
  const [animated, setAnimated] = useState(false);
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const answered = data.reduce((s, d) => s + d.value, 0);

  // Trigger animation on mount
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-5 hover:border-slate-200 transition-colors duration-200">
      <p className="text-[14px] font-medium text-slate-700 mb-0.5 leading-snug">{title}</p>
      <p className="text-[12px] text-slate-400 mb-4">
        {answered} of {total} answered
      </p>

      {data.length === 0 ? (
        <p className="text-[13px] text-slate-300">No data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={sorted} barSize={38} barCategoryGap="30%">
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#cbd5e1" }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              cursor={{ fill: "#f1f5f9" }}
              formatter={(val: number) => [
                `${val} (${total > 0 ? Math.round((val / total) * 100) : 0}%)`,
                "Responses",
              ]}
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                fontFamily: "inherit",
              }}
              labelStyle={{ color: "#475569", fontWeight: 500 }}
            />
            <Bar
              dataKey="value"
              radius={[5, 5, 0, 0]}
              isAnimationActive={true}
              animationBegin={0}
              animationDuration={600}
              animationEasing="ease-out"
            >
              {sorted.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === 0 ? "#6098AE" : i === 1 ? "#93B9C8" : "#D0E0E7"}
                />
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

// ---- Custom Tooltip ----
function CustomTooltip({ active, payload, label, total }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value as number;
  const pct = total > 0 ? Math.round((val / total) * 100) : 0;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-md text-[12px]">
      <p className="text-slate-500 font-medium mb-0.5">{label}</p>
      <p className="text-slate-800 font-semibold">{val} responses <span className="text-slate-400 font-normal">({pct}%)</span></p>
    </div>
  );
}

// ---- Skeleton loader ----
function ChartSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-5 animate-pulse">
      <div className="h-3.5 w-3/4 bg-slate-100 rounded mb-2" />
      <div className="h-3 w-1/3 bg-slate-100 rounded mb-5" />
      <div className="flex items-end gap-3 h-[130px]">
        {[65, 45, 30, 20, 15].map((h, i) => (
          <div key={i} className="flex-1 bg-slate-100 rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
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

  const filteredRows = useMemo(() => {
    if (!data?.responses) return [];
    return data.responses.filter((r) =>
      activeFilters.every((f) => {
        const val = (r as unknown as Record<string, string>)[f.fieldId] ?? "";
        switch (f.operator) {
          case "is_any_of":        return f.values.includes(val);
          case "is_not_any_of":   return !f.values.includes(val);
          case "is_equal_to":     return val === f.values[0];
          case "is_not_equal_to": return val !== f.values[0];
          case "is_empty":        return !val;
          case "is_not_empty":    return !!val;
          default:                return true;
        }
      })
    );
  }, [data, activeFilters]);

  const total = filteredRows.length;
  const hasFilters = activeFilters.length > 0;

  const charts = [
    { title: "Which campaign inspires you the most?",                         data: tally(filteredRows, "campaign") },
    { title: "After watching the video, will you GIVE to a campaign?",        data: tally(filteredRows, "willGive") },
    { title: "If you chose to donate, what amount feels right?",              data: tally(filteredRows, "donationAmount") },
    { title: "Will you VOTE for a vetted nonprofit?",                         data: tally(filteredRows, "willVote") },
    { title: "Will you SHINE by sharing your unique link?",                   data: tally(filteredRows, "willShine") },
    { title: "Is earning recognition more appealing than relying on chance?", data: tally(filteredRows, "prefersEarning") },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-6 flex-wrap bg-white rounded-lg p-4 border border-slate-200 shadow-sm justify-between">

        {/* Date filter */}
        <div className="flex items-center gap-2">
          <DateFilter value={dateRange} onChange={setDateRange} />

          {/* Filters button */}
          <button
            onClick={() => setShowFilters(true)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
              hasFilters
                ? "bg-[#c9a84c] text-[#ffffff] border-[#A18330] hover:bg-[#c9a84c]/90"
                : "bg-white text-[#6098AE] border-[#6098AE] hover:border-[#4a8798] hover:bg-[#f0f8fa]"
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Filters
            {hasFilters && (
              <span className="ml-0.5 bg-white/25 text-white text-[11px] font-semibold rounded-full px-1.5 py-px leading-none">
                {activeFilters.length}
              </span>
            )}
          </button>          
        </div>

        {/* Active filters */}
        <div className="flex items-center gap-2">
          {/* Active filter tags */}
          {activeFilters.map((f, i) => {
            const opLabel: Record<string, string> = {
              is_any_of: "is any of", is_not_any_of: "is not any of",
              is_equal_to: "=", is_not_equal_to: "≠",
              is_empty: "is empty", is_not_empty: "is not empty",
            };
            const valLabel = f.values.length > 0 ? f.values.join(", ") : "";
            return (
              <span key={i} className="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-100 text-sky-700 rounded-full px-3 py-1 text-[12px] max-w-[260px] overflow-hidden whitespace-nowrap">
                <span className="truncate">
                  {f.fieldId.replace(/([A-Z])/g, " $1").trim()} {opLabel[f.operator] ?? f.operator}
                  {valLabel ? `: ${valLabel}` : ""}
                </span>
                <button
                  onClick={() => setActiveFilters((a) => a.filter((_, idx) => idx !== i))}
                  className="shrink-0 text-sky-400 hover:text-sky-700 transition-colors"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </span>
            );
          })}

          {/* Clear all */}
          {hasFilters && (
            <button
              onClick={() => setActiveFilters([])}
              className="text-[12px] text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors whitespace-nowrap"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Charts grid */}
      {loading ? (
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))" }}>
          {Array.from({ length: 6 }).map((_, i) => <ChartSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Response count */}
      <div className="flex items-center gap-2 mt-4">
        <span className="font-medium text-sm text-[#6098AE]/70 whitespace-nowrap ml-auto">
          {loading ? "Loading…" : `${total} response${total !== 1 ? "s" : ""}`}
        </span>
      </div>
      
    </div>
  );
}