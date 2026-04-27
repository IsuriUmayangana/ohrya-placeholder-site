"use client";

import { useState, useRef, useEffect } from "react";

export interface DateRange { from: string; to: string; label: string; }

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const PRESETS: { label: string; getRange: () => { from: string; to: string } }[] = [
  { label: "All time",   getRange: () => ({ from: "", to: "" }) },
  { label: "Today",      getRange: () => { const d = toISO(new Date()); return { from: d, to: d }; } },
  { label: "Last week",  getRange: () => { const t = new Date(); const f = new Date(t); f.setDate(t.getDate() - 7); return { from: toISO(f), to: toISO(t) }; } },
  { label: "Last month", getRange: () => { const t = new Date(); const f = new Date(t); f.setMonth(t.getMonth() - 1); return { from: toISO(f), to: toISO(t) }; } },
  { label: "Last year",  getRange: () => { const t = new Date(); const f = new Date(t); f.setFullYear(t.getFullYear() - 1); return { from: toISO(f), to: toISO(t) }; } },
];

function toISO(d: Date) { return d.toISOString().slice(0, 10); }

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }

function firstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay(); }

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function DateFilter({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activePreset, setActivePreset] = useState(value.label);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [selecting, setSelecting] = useState<{ from: string; to: string }>({ from: value.from, to: value.to });
  const [clickCount, setClickCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    function syncViewport() {
      setIsMobile(window.innerWidth < 640);
    }
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  function selectPreset(preset: typeof PRESETS[0]) {
    setActivePreset(preset.label);
    const range = preset.getRange();
    setSelecting(range);
    setClickCount(0);
  }

  function handleDayClick(dateStr: string) {
    if (clickCount === 0) {
      setSelecting({ from: dateStr, to: dateStr });
      setClickCount(1);
      setActivePreset("Custom");
    } else {
      const sorted = [selecting.from, dateStr].sort();
      setSelecting({ from: sorted[0], to: sorted[1] });
      setClickCount(0);
      setActivePreset("Custom");
    }
  }

  function apply() {
    onChange({ ...selecting, label: activePreset });
    setOpen(false);
  }

  function cancel() {
    setSelecting({ from: value.from, to: value.to });
    setActivePreset(value.label);
    setClickCount(0);
    setOpen(false);
  }

  function inRange(dateStr: string) {
    if (!selecting.from || !selecting.to) return false;
    return dateStr >= selecting.from && dateStr <= selecting.to;
  }

  function isStart(d: string) { return d === selecting.from; }
  function isEnd(d: string) { return d === selecting.to; }

  const totalDays = daysInMonth(calYear, calMonth);
  const firstDay = firstDayOfMonth(calYear, calMonth);
  const today = toISO(new Date());

  const btnStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 6,
    background: "white", border: "1px solid #e0e8ec",
    borderRadius: 7, padding: "7px 14px",
    fontFamily: "Georgia, serif", fontSize: "0.85rem", color: "#444",
    cursor: "pointer", whiteSpace: "nowrap",
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button style={btnStyle} onClick={() => setOpen((o) => !o)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#888" strokeWidth="1.8"/>
          <path d="M16 2v4M8 2v4M3 10h18" stroke="#888" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        {value.label}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 100,
          background: "white", borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.14)", border: "1px solid #e8f0f2",
          display: "flex", flexDirection: "column",
          minWidth: isMobile ? "min(92vw, 330px)" : 540,
          maxWidth: isMobile ? "92vw" : "none",
        }}>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}>
            {/* Presets */}
            <div style={{
              width: isMobile ? "100%" : 140,
              borderRight: isMobile ? "none" : "1px solid #f0f0f0",
              borderBottom: isMobile ? "1px solid #f0f0f0" : "none",
              padding: "12px 0",
              display: isMobile ? "grid" : "block",
              gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : undefined,
              gap: isMobile ? 4 : undefined,
            }}>
              {PRESETS.map((p) => (
                <button key={p.label} onClick={() => selectPreset(p)}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: isMobile ? "8px 12px" : "10px 20px", border: "none", cursor: "pointer",
                    fontFamily: "Georgia, serif", fontSize: "0.85rem",
                    background: activePreset === p.label ? "#f0f8fa" : "transparent",
                    color: activePreset === p.label ? "#5a9aaa" : "#444",
                    fontWeight: activePreset === p.label ? "bold" : "normal",
                    borderRadius: isMobile ? 8 : 0,
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Calendar */}
            <div style={{ flex: 1, padding: isMobile ? "12px" : "16px 20px" }}>
              {/* Month nav */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "#888", padding: "4px 8px" }}>‹</button>
                <span style={{ fontFamily: "Georgia, serif", fontSize: "0.9rem", color: "#2d2d2d" }}>
                  {MONTHS[calMonth]} {calYear}
                </span>
                <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "#888", padding: "4px 8px" }}>›</button>
              </div>

              {/* Day headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
                {DAYS.map((d) => (
                  <div key={d} style={{ textAlign: "center", fontFamily: "Georgia, serif", fontSize: "0.72rem", color: "#bbb", padding: "2px 0" }}>{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: totalDays }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isSel = isStart(dateStr) || isEnd(dateStr);
                  const isIn = inRange(dateStr);
                  const isToday = dateStr === today;
                  return (
                    <button key={day} onClick={() => handleDayClick(dateStr)}
                      style={{
                        textAlign: "center", padding: isMobile ? "8px 2px" : "6px 2px",
                        border: "none", borderRadius: isSel ? 6 : 4,
                        cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "0.82rem",
                        background: isSel ? "#5a9aaa" : isIn ? "#e8f5f8" : "transparent",
                        color: isSel ? "white" : isIn ? "#5a9aaa" : isToday ? "#5a9aaa" : "#333",
                        fontWeight: isSel || isToday ? "bold" : "normal",
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Selected range display */}
              {selecting.from && (
                <p style={{ fontFamily: "Georgia, serif", fontSize: "0.75rem", color: "#aaa", marginTop: 12, textAlign: "center" }}>
                  {selecting.from}{selecting.to && selecting.to !== selecting.from ? ` → ${selecting.to}` : ""}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className={`flex border-t border-slate-200 ${isMobile ? "justify-stretch gap-2 p-3" : "justify-end gap-4 p-4"}`}>
            <button onClick={cancel}
              className={`border border-slate-200 rounded-lg text-sm text-[#666] bg-white cursor-pointer ${isMobile ? "flex-1 px-3 py-2" : "px-6 py-2"}`}>
              Cancel
            </button>
            <button onClick={apply}
              className={`border-none rounded-lg bg-[#5a9aaa] text-sm text-white cursor-pointer ${isMobile ? "flex-1 px-3 py-2" : "px-6 py-2"}`}>
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
