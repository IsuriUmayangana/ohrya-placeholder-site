"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import DateFilter, { type DateRange } from "./DateFilter";
import DeviceFilter from "./DeviceFilter";
import useCountUp from "@/hooks/useCountUp";
import CardWidget from "../ui/CardWidget";

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
  const avgTimeToComplete = data?.avgTimeToComplete ?? "—";

  const [activeSlide, setActiveSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const totalSlides = 3;
  
  const scrollToSlide = (index: number) => {
    if (!sliderRef.current) return;
    const slideWidth = sliderRef.current.offsetWidth;
    sliderRef.current.scrollTo({ left: slideWidth * index, behavior: "smooth" });
    setActiveSlide(index);
  };

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const slideWidth = sliderRef.current.offsetWidth;
    const scrollLeft = sliderRef.current.scrollLeft;
    const newIndex = Math.round(scrollLeft / slideWidth);
    setActiveSlide(newIndex);
  };

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

        {/* Mobile slider Cards */}
        <div className="md:hidden">
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-1 pb-2 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex-shrink-0 w-full snap-center">
              <CardWidget title="Submissions" value={total} theme="blue" variant="solid" subtitle="Total submissions" icons="submissions" />
            </div>
            <div className="flex-shrink-0 w-full snap-center">
              <CardWidget title="Avg Score" value={data?.avgScore ?? 0} theme="teal" variant="outline" icons="score" subtitle="Score" />
            </div>
            <div className="flex-shrink-0 w-full snap-center">
              <CardWidget title="Time to complete" value={avgTimeToComplete} theme="teal" variant="outline" icons="time" subtitle="Average time to complete" />
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-3">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeSlide === i
                    ? "w-6 bg-[#4a8798]"
                    : "w-2 bg-[#a9d0da]"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop cards */}
        <div className="md:grid lg:grid-cols-3 md:grid-cols-3 md:gap-5 lg:gap-10 hidden">
          <CardWidget title="Submissions" value={total} theme="blue" variant="solid" subtitle="Total submissions" icons="submissions" />
          <CardWidget title="Avg Score" value={data?.avgScore ?? 0} theme="teal" variant="outline" icons="score" subtitle="Score" />
          <CardWidget title="Time to complete" value={avgTimeToComplete} theme="teal" variant="outline" icons="time" subtitle="Average time to complete" />

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
  
      {/* Question by question table header */}
      <div className="p-6 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
        <p className="text-[18px] font-medium leading-[26px] lg:leading-[36px] tracking-[-0.25px] lg:tracking-[-0.5px] text-balance text-[#2d2d2d]">
          Question by question
        </p>
      </div>

      {/* Question by question table - Desktop view */}
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

                  <td className="px-10 py-4 text-[#4a8798] font-medium">
                    {row.views}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Question by question table - Mobile view */}
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
