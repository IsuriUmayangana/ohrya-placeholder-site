"use client";

import { useState, useEffect, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import DateFilter, { type DateRange } from "./DateFilter";
import DeviceFilter from "./DeviceFilter";
import useCountUp from "@/hooks/useCountUp";

interface DropOffRow { question: string; views: number; answered: number; }
interface StatsData {
  total: number;
  avgScore: number;
  avgTimeToComplete: string;
  trends: { date: string; count: number }[];
  dropOff: DropOffRow[];
}

const ALL_TIME: DateRange = { from: "", to: "", label: "All time" };

function AnimatedStat({ value }: { value: string | number }) {
  const raw = String(value);
  const match = raw.match(/^([^\d]*)(\d[\d,.]*)(.*)$/);
  
  const numeric = match ? parseFloat(match[2].replace(/,/g, "")) : NaN;
  const isInteger = Number.isInteger(numeric);

  // Hook always called unconditionally at top level
  const animated = useCountUp(!isNaN(numeric) ? numeric : 0, 1200);

  if (!match || isNaN(numeric)) return <>{raw}</>;

  const [, prefix, , suffix] = match;
  const formatted = isInteger ? animated.toLocaleString() : animated.toFixed(1);

  return <>{prefix}{formatted}{suffix}</>;
}

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
  const completionRate = "—";

  const bigPicture = [
    {
      label: "Submissions",
      value: total > 0 ? total : "—",
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5a9aaa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <path d="M9 12h6M9 16h4"/>
        </svg>
      ),
    },
    {
      label: "Avg Score",
      value: total > 0 ? (data?.avgScore ?? "—") : "—",
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5a9aaa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
    },
  ];
  
  const bigPictureSideCard = [
    {
      label: "Completion rate",
      value: completionRate,
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
    },
    {
      label: "Time to complete",
      value: total > 0 ? (data?.avgTimeToComplete ?? "—") : "—",
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 7v5l3 3"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-7">

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
        <DateFilter value={dateRange} onChange={setDateRange} />
        <DeviceFilter value={device} onChange={setDevice} />
        {(dateRange.label !== "All time" || device !== "All devices") && (
          <button
            onClick={() => { setDateRange(ALL_TIME); setDevice("All devices"); }}
            className="bg-none border-none text-[#aaa] text-[12px] cursor-pointer text-decoration-underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Big picture */}
      <div className={`bg-white h-auto border border-slate-200 rounded-2xl p-6 shadow-sm transition-opacity ${loading ? "opacity-60" : "opacity-100"}`}>

        <div className="flex items-center justify-between mb-6">
          <p className="text-[18px] font-medium leading-[26px] lg:leading-[36px] tracking-[-0.25px] lg:tracking-[-0.5px] text-balance text-[#2d2d2d]">Big picture</p>
        </div>

        {/* Big picture cards */}
        <div className="grid lg:grid-cols-2 md:grid-cols-2  gap-4">
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-2 gap-4">

            {bigPicture.map((stat, index) => {
              const isFilled = index === 0;
              return (
                <div
                  key={stat.label}
                  className={`relative rounded-[18px] p-5 pb-4 overflow-hidden transition-all duration-200 hover:-translate-y-[3px] ${
                    isFilled
                      ? "bg-[#5a9aaa] border-0"
                      : "bg-white border border-[#5a9aaa]/20 hover:border-[#5a9aaa]/40"
                  }`}
                >
                  {/* Decorative circle in top-right corner */}
                  <div className={`absolute -bottom-5 -right-5 w-20 h-20 rounded-full pointer-events-none ${
                    isFilled ? "bg-white/10" : "bg-[#5a9aaa]/07"
                  }`} />

                  <div className="flex items-center justify-between">
                    {/* Label */}
                    <p className={`text-[12px] font-bold uppercase tracking-[0.04em] mb-1.5 ${
                      isFilled ? "text-white/65" : "text-[#5a9aaa]"
                    }`}>
                      {stat.label}
                    </p>
                    {/* Icon pill */}
                    <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center mb-4 ${
                      isFilled ? "bg-white/20" : "bg-[#5a9aaa]/12"
                    }`}>
                      {stat.icon}
                    </div>
                  </div>

                  {/* Value */}
                  <p className={`text-[34px] font-light leading-none tracking-[-0.03em] mb-3.5 ${
                    isFilled ? "text-white" : "text-[#2d2d2d]"
                  }`}>
                    <AnimatedStat value={stat.value} />
                  </p>

                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Side cards — amber accent */}
            {bigPictureSideCard.map((stat) => (
              <div
                key={stat.label}
                className="relative rounded-[18px] p-5 pb-4 overflow-hidden bg-white border border-[#c9a84c]/25 hover:-translate-y-[3px] transition-all duration-200"
              >
                {/* Decorative circle */}
                <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-[#c9a84c]/08 pointer-events-none" />

                <div className="flex items-center justify-between">
                  {/* Label */}
                  <p className="text-[12px] font-bold uppercase tracking-[0.04em] mb-1.5 text-[#c9a84c]">
                    {stat.label}
                  </p>
                  {/* Icon pill */}
                  <div className="w-9 h-9 rounded-[12px] flex items-center justify-center mb-4 bg-[#c9a84c]/15">
                    {stat.icon}
                  </div>
                </div>

                {/* Value */}
                <p className="text-[34px] font-light leading-none tracking-[-0.03em] mb-3.5 text-[#2d2d2d]">
                  <AnimatedStat value={stat.value} />
                </p>

              </div>
            ))}
          </div>
        </div>

        {/* No submissions message */}
        {total === 0 && !loading && (
          <p className="text-[#5a9aaa]/50 text-sm mt-4">
            No submissions match the selected filters.
          </p>
        )}
      </div>

      {/* Trends */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 mb-6">
        <p className="text-[18px] font-medium leading-[26px] lg:leading-[36px] tracking-[-0.25px] lg:tracking-[-0.5px] text-balance text-[#2d2d2d]">Trends</p>
        {loading ? (
          <div className="h-52 flex items-center justify-center">
            <p className="text-[#ccc]">Loading…</p>
          </div>
        ) : (data?.trends ?? []).length === 0 ? (
          <div className="h-52 flex items-center justify-center">
            <p className="text-[#ccc]">No data for selected period.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data!.trends} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#c9a84c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f4" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#bbb" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#bbb" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e8f0f2", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }} />
              <Area
                type="monotone"
                dataKey="count"
                name="Submissions"
                stroke="#c9a84c"
                strokeWidth={2}
                fill="url(#tealGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#c9a84c" }}
                isAnimationActive
                animationBegin={0}
                animationDuration={900}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Question by question table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
  
      {/* Table Header */}
      <div className="p-6 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
        <p className="text-[18px] font-medium leading-[26px] lg:leading-[36px] tracking-[-0.25px] lg:tracking-[-0.5px] text-balance text-[#2d2d2d]">
          Question by question
        </p>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block shadow-sm border-t border-slate-200 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          
          <thead className="bg-[#f4f9fb]">
            <tr>
              {["Questions", "Views"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-left font-medium text-[#4a8798] border-b border-slate-200"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            
            {(data?.dropOff ?? []).map((row, i) => { 
                
              const isScore = /score|brilliant|almost|well done/i.test(
                row.question
              );

              return (
                <tr
                  key={i}
                  className="border-b border-[#f1f5f7] hover:bg-[#f9fcfd] transition"
                >
                  <td className="px-6 py-4 flex items-center gap-3 text-[#2d2d2d]">
                    
                    {/* Icon */}
                    <span
                      className={`w-5 h-5 flex items-center justify-center rounded-md ${
                        isScore
                          ? "bg-[#fff6db]"
                          : "bg-[#eaf4f7]"
                      }`}
                    >
                      {isScore ? (
                        <span className="text-sm">🏅</span>
                      ) : (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M9 11l3 3L22 4"
                            stroke="#5a9aaa"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
                            stroke="#5a9aaa"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>

                    {row.question}
                  </td>

                  <td className="px-6 py-4 text-[#4a8798] font-medium">
                    {row.views}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden p-3 space-y-3 bg-[#f7fbfc]">
      {(data?.dropOff ?? []).map((row, i) => {
        const isScore = /score|brilliant|almost|well done/i.test(
          row.question
        );

        return (
          <div
            key={i}
            className="rounded-2xl bg-white border border-[#e6eef1] p-4"
          >
            <div className="flex items-start gap-3">
              
              {/* Icon */}
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                  isScore ? "bg-[#fff6db]" : "bg-[#eaf4f7]"
                }`}
              >
                {isScore ? (
                  <span>🏅</span>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 11l3 3L22 4"
                      stroke="#5a9aaa"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
                      stroke="#5a9aaa"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>

              <div className="flex-1">
                <p className="text-[#2d2d2d] text-sm leading-relaxed">
                  {row.question}
                </p>

                <div className="mt-4 flex flex-col gap-2 w-full">
                  <div className="flex-1 rounded-xl bg-[#f4f9fb] border border-[#e6eef1] p-3 inline-block">
                    <p className="text-[#4a8798] text-xs mb-1">Views</p>
                    <p className="text-[#2d2d2d] font-medium">{row.views}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </div>

    </div>
  );
}
