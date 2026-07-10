"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import DateFilter, { type DateRange } from "./DateFilter";
import DeviceFilter from "./DeviceFilter";
import useCountUp from "@/hooks/useCountUp";
import CardWidget from "../ui/CardWidget";

interface StatsData {
  total: number;
  avgScore: number;
  avgTimeToComplete: string;
  trends: { date: string; count: number }[];
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
          <p className="text-[18px] font-medium leading-[26px] lg:leading-[36px] tracking-[-0.25px] lg:tracking-[-0.5px] text-balance text-[#000000]">Big Picture</p>
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

        <div className="flex items-center justify-between mb-6">
          <p className="text-[18px] font-medium leading-[26px] lg:leading-[36px] tracking-[-0.25px] lg:tracking-[-0.5px] text-balance text-[#000000]">Trends</p>
        </div>
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
              <Tooltip contentStyle={{ fontSize: 12, color: "#000000", borderRadius: 8, border: "1px solid #e8f0f2", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }} />
              <Area
                type="monotone"
                dataKey="count"
                name="Submissions"
                color="#000000"
                stroke="#FFC62B"
                strokeWidth={1}
                fill="url(#tealGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#FFC62B" }}
                isAnimationActive
                animationBegin={0}
                animationDuration={900}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
}
