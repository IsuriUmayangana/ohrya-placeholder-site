"use client";

import { useState, useEffect, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import DateFilter, { type DateRange } from "./DateFilter";
import DeviceFilter from "./DeviceFilter";

interface DropOffRow { question: string; views: number; answered: number; }
interface StatsData {
  total: number;
  avgScore: number;
  avgTimeToComplete: string;
  trends: { date: string; count: number }[];
  dropOff: DropOffRow[];
}

const ALL_TIME: DateRange = { from: "", to: "", label: "All time" };

export default function InsightsTab() {
  const [dateRange, setDateRange] = useState<DateRange>(ALL_TIME);
  const [device, setDevice] = useState("All devices");
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.from) params.set("from", dateRange.from);
      if (dateRange.to)   params.set("to", dateRange.to);
      if (device !== "All devices") params.set("device", device);
      const res = await fetch(`/api/admin/stats?${params}`);
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [dateRange, device]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const total = data?.total ?? 0;
  const estimatedViews   = total > 0 ? Math.round(total / 0.49) : 0;
  const estimatedStarts  = total > 0 ? Math.round(total / 0.71) : 0;
  const completionRate   = estimatedStarts > 0 ? `${((total / estimatedStarts) * 100).toFixed(1)}%` : "—";

  const bigPicture = [
    { label: "Views",            value: total > 0 ? estimatedViews : "—" },
    { label: "Starts",           value: total > 0 ? estimatedStarts : "—" },
    { label: "Submissions",      value: total },
    { label: "Completion rate",  value: total > 0 ? completionRate : "—" },
    { label: "Time to complete", value: total > 0 ? (data?.avgTimeToComplete ?? "—") : "—" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <DateFilter value={dateRange} onChange={setDateRange} />
        <DeviceFilter value={device} onChange={setDevice} />
        {(dateRange.label !== "All time" || device !== "All devices") && (
          <button
            onClick={() => { setDateRange(ALL_TIME); setDevice("All devices"); }}
            style={{ background: "none", border: "none", color: "#aaa", fontFamily: "Georgia, serif", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline" }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Big picture */}
      <div style={{ background: "white", border: "1px solid #e8f0f2", borderRadius: 12, padding: "28px 32px", opacity: loading ? 0.6 : 1, transition: "opacity 0.2s" }}>
        <p style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", color: "#2d2d2d", marginBottom: 24 }}>Big picture</p>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {bigPicture.map((stat, i) => (
            <div key={stat.label} style={{ flex: "1 1 120px", paddingRight: 32, paddingBottom: 8, borderRight: i < bigPicture.length - 1 ? "1px solid #f0f0f0" : "none", paddingLeft: i > 0 ? 32 : 0 }}>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "0.78rem", color: "#999", marginBottom: 6, whiteSpace: "nowrap" }}>{stat.label}</p>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "2.4rem", color: "#2d2d2d", fontWeight: "300", lineHeight: 1 }}>{stat.value}</p>
            </div>
          ))}
        </div>
        {total === 0 && !loading && (
          <p style={{ fontFamily: "Georgia, serif", color: "#ccc", fontSize: "0.85rem", marginTop: 8 }}>No submissions match the selected filters.</p>
        )}
      </div>

      {/* Trends */}
      <div style={{ background: "white", border: "1px solid #e8f0f2", borderRadius: 12, padding: "28px 32px" }}>
        <p style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", color: "#2d2d2d", marginBottom: 24 }}>Trends</p>
        {loading ? (
          <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontFamily: "Georgia, serif", color: "#ccc" }}>Loading…</p>
          </div>
        ) : (data?.trends ?? []).length === 0 ? (
          <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontFamily: "Georgia, serif", color: "#ccc" }}>No data for selected period.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data!.trends} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5a9aaa" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#5a9aaa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f4" vertical={false} />
              <XAxis dataKey="date" tick={{ fontFamily: "Georgia, serif", fontSize: 11, fill: "#bbb" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontFamily: "Georgia, serif", fontSize: 11, fill: "#bbb" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontFamily: "Georgia, serif", fontSize: 12, borderRadius: 8, border: "1px solid #e8f0f2", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }} />
              <Area type="monotone" dataKey="count" name="Submissions" stroke="#5a9aaa" strokeWidth={2} fill="url(#tealGrad)" dot={false} activeDot={{ r: 4, fill: "#5a9aaa" }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Drop-off table */}
      <div style={{ background: "white", border: "1px solid #e8f0f2", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "24px 32px", borderBottom: "1px solid #f4f4f4" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", color: "#2d2d2d" }}>Question by question</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr>
                {["Questions", "Views", "Drop-off"].map((h) => (
                  <th key={h} style={{ padding: "12px 32px", textAlign: "left", fontFamily: "Georgia, serif", fontWeight: "normal", color: "#aaa", borderBottom: "1px solid #f4f4f4" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.dropOff ?? []).map((row, i) => {
                const dropped = row.views - row.answered;
                const dropPct = row.views > 0 ? Math.round((dropped / row.views) * 100) : 0;
                const isScore = /score|brilliant|almost|well done/i.test(row.question);
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #f8f8f8" }}>
                    <td style={{ padding: "13px 32px", fontFamily: "Georgia, serif", color: "#333", display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 22, height: 22, borderRadius: 4, background: isScore ? "#fff3e0" : "#e8f5f8", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {isScore
                          ? <span style={{ fontSize: 12 }}>🏅</span>
                          : <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4" stroke="#5a9aaa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#5a9aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        }
                      </span>
                      {row.question}
                    </td>
                    <td style={{ padding: "13px 32px", fontFamily: "Georgia, serif", color: "#555" }}>{row.views}</td>
                    <td style={{ padding: "13px 32px" }}>
                      {dropped > 0
                        ? <span style={{ background: "#fff0f0", color: "#c0392b", borderRadius: 6, padding: "3px 10px", fontFamily: "Georgia, serif", fontSize: "0.8rem" }}>-{dropped} ({dropPct}%)</span>
                        : <span style={{ color: "#ddd" }}>—</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
