"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import DateFilter, { type DateRange } from "./DateFilter";
import FiltersModal, { type ActiveFilter } from "./FiltersModal";

interface Response {
  id: string; email: string; campaign: string; willGive: string;
  donationAmount: string; willVote: string; willShine: string;
  prefersEarning: string; surveyScore: number; referralScore: number;
  referralCount: number; totalScore: number; submittedAt: string;
  device: string;
}

const ALL_TIME: DateRange = { from: "", to: "", label: "All time" };
const PER_PAGE = 20;

const CAMPAIGN_COLORS: Record<string, string> = {
  Children: "#f0e6ff", Animals: "#e6f7ff", Veterans: "#fff3e6",
};

export default function ResponsesTab() {
  const [allResponses, setAllResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>(ALL_TIME);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx">("csv");

  // Fetch responses (date-filtered at API level)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.from) params.set("from", dateRange.from);
      if (dateRange.to)   params.set("to", dateRange.to);
      const res = await fetch(`/api/admin/stats?${params}`);
      const data = await res.json();
      setAllResponses(data.responses ?? []);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => { fetchData(); setPage(1); }, [fetchData]);

  // Apply question filters + search client-side
  const filtered = useMemo(() => {
    return allResponses.filter((r) => {
      const matchSearch = !search ||
        r.email.toLowerCase().includes(search.toLowerCase()) ||
        r.campaign.toLowerCase().includes(search.toLowerCase());
      const matchFilters = activeFilters.every((f) => {
        const val = ((r as unknown as Record<string, string>)[f.fieldId] ?? "");
        switch (f.operator) {
          case "is_any_of":      return f.values.includes(val);
          case "is_not_any_of": return !f.values.includes(val);
          case "is_equal_to":   return val === f.values[0];
          case "is_not_equal_to": return val !== f.values[0];
          case "is_empty":      return !val;
          case "is_not_empty":  return !!val;
          default:              return true;
        }
      });
      return matchSearch && matchFilters;
    });
  }, [allResponses, search, activeFilters]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function buildRows() {
    return filtered.map((r, i) => ({
      "#": i + 1,
      Email: r.email,
      Date: new Date(r.submittedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      Campaign: r.campaign,
      "Will Give?": r.willGive,
      "Donation Amount": r.donationAmount || "—",
      "Will Vote?": r.willVote,
      "Will Shine?": r.willShine,
      "Prefers Earning": r.prefersEarning,
      Device: r.device,
      "Survey Score": r.surveyScore,
      "Referral Bonus": r.referralScore,
      "Friends Referred": r.referralCount,
      "Total Score": r.totalScore,
    }));
  }

  function downloadXlsx() {
    const rows = buildRows();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 4 }, { wch: 32 }, { wch: 14 }, { wch: 12 }, { wch: 11 }, { wch: 16 }, { wch: 11 }, { wch: 11 }, { wch: 20 }, { wch: 10 }, { wch: 13 }, { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 40 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "OHRYA Responses");
    XLSX.writeFile(wb, `ohrya-responses-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  function downloadCsv() {
    const rows = buildRows();
    const headers = Object.keys(rows[0] ?? {});
    const escape = (v: unknown) => {
      const s = String(v ?? "");
      return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers.map(escape).join(","), ...rows.map((r) => headers.map((h) => escape((r as Record<string, unknown>)[h])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ohrya-responses-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function runExport() {
    if (exportFormat === "xlsx") downloadXlsx(); else downloadCsv();
    setShowExportModal(false);
  }

  const inputStyle: React.CSSProperties = {
    border: "1px solid #e0e8ec", borderRadius: 6, padding: "7px 12px",
    fontFamily: "Georgia, serif", fontSize: "0.85rem", color: "#2d2d2d",
    background: "white", outline: "none",
  };

  const hasFilters = activeFilters.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 w-[200px]">
          <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="#aaa" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text" placeholder="Search responses…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full p-3 pl-10 border border-[#e0e8ec] rounded-lg text-[12px] text-[#2d2d2d] bg-white outline-none"
          />
        </div>

        {/* Date filter */}
        <DateFilter value={dateRange} onChange={(r) => { setDateRange(r); setPage(1); }} />

        {/* Filters button */}
        <button
          onClick={() => setShowFiltersModal(true)}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            background: hasFilters ? "#5a9aaa" : "white",
            color: hasFilters ? "white" : "#444",
            border: "1px solid #e0e8ec", borderRadius: 7, padding: "7px 14px",
            fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M7 12h10M10 18h4" stroke={hasFilters ? "white" : "#888"} strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Filters {hasFilters ? `(${activeFilters.length})` : ""}
        </button>

        {/* Export button */}
        <button
          className="bg-[#6098AE] text-[#ffffff] hover:bg-[#4a8798] flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          onClick={() => { if (filtered.length > 0) setShowExportModal(true); }}
          disabled={filtered.length === 0}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export
        </button>
      </div>

      {/* Active filter tags */}
      <div className="flex items-center gap-2">
        {/* Active filter tags */}
        {activeFilters.map((f, i) => {
          const opLabel = { is_any_of: "is any of", is_not_any_of: "is not any of", is_equal_to: "=", is_not_equal_to: "≠", is_empty: "is empty", is_not_empty: "is not empty" }[f.operator] ?? f.operator;
          const valLabel = f.values.length > 0 ? f.values.join(", ") : "";
          return (
            <span key={i} className="flex items-center gap-5 bg-[#e8f5f8] rounded-2xl p-3 text-[12px] text-[#5a9aaa] max-w-[260px] overflow-hidden text-ellipsis whitespace-nowrap">
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{f.fieldId.replace(/([A-Z])/g, " $1").trim()} {opLabel}{valLabel ? `: ${valLabel}` : ""}</span>
              <button onClick={() => setActiveFilters((a) => a.filter((_, idx) => idx !== i))}
                className="bg-none border-none cursor-pointer text-[14px] leading-none p-0 flex-shrink-0 text-[#5a9aaa]">✕</button>
            </span>
          );
        })}

        {/* Clear all */}
        {hasFilters && (
          <button onClick={() => setActiveFilters([])}
            className="bg-none border-none text-[#aaa] text-[12px] cursor-pointer text-decoration-underline">
            Clear all
          </button>
        )}
      </div>

      {/* Results */}
      <div
        className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-opacity duration-200"
        style={{ opacity: loading ? 0.6 : 1 }}
      >
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto shadow-sm border-t border-slate-200">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50/95 backdrop-blur text-slate-500">
                {[
                  "Email",
                  "Date",
                  "Campaign",
                  "Give?",
                  "Donation",
                  "Vote?",
                  "Shine?",
                  "Recognition",
                  "Device",
                  "Survey",
                  "Referral",
                  "Total",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 whitespace-nowrap border-b border-slate-200"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-slate-400 text-sm">
                    Loading…
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-slate-300 text-sm">
                    No responses match your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`border-b border-slate-100 transition-colors duration-150 hover:bg-slate-50 ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    }`}
                  >
                    <td className="px-4 py-3.5 text-slate-700 max-w-[220px] truncate text-[13px] font-medium">
                      {r.email}
                    </td>

                    <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap text-[13px]">
                      {new Date(r.submittedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset"
                        style={{
                          background: CAMPAIGN_COLORS[r.campaign] || "#f8fafc",
                          color: "#475569",
                          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.35)",
                        }}
                      >
                        {r.campaign}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-[13px]">
                      <span
                        className={`inline-flex min-w-[44px] justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          r.willGive === "Yes"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                            : "bg-slate-100 text-slate-400 ring-1 ring-slate-200"
                        }`}
                      >
                        {r.willGive}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-500 text-[13px]">
                      {r.donationAmount ? (
                        <span className="font-medium text-slate-600">{r.donationAmount}</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-[13px]">
                      <span
                        className={`inline-flex min-w-[44px] justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          r.willVote === "Yes"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                            : "bg-slate-100 text-slate-400 ring-1 ring-slate-200"
                        }`}
                      >
                        {r.willVote}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-[13px]">
                      <span
                        className={`inline-flex min-w-[44px] justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          r.willShine === "Yes"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                            : "bg-slate-100 text-slate-400 ring-1 ring-slate-200"
                        }`}
                      >
                        {r.willShine}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-500 text-[12px] max-w-[160px] truncate">
                      {r.prefersEarning || <span className="text-slate-300">—</span>}
                    </td>

                    <td className="px-4 py-3.5 text-slate-500 text-[12px] whitespace-nowrap">
                      {r.device || <span className="text-slate-300">—</span>}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex min-w-[36px] justify-center rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-100 px-2.5 py-1 text-[11px] font-semibold">
                        {r.surveyScore}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex min-w-[36px] justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
                          r.referralScore > 0
                            ? "bg-amber-50 text-amber-700 ring-amber-100"
                            : "bg-slate-100 text-slate-400 ring-slate-200"
                        }`}
                      >
                        +{r.referralScore}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex min-w-[40px] justify-center rounded-full bg-slate-900 text-white px-3 py-1 text-[11px] font-semibold shadow-sm">
                        {r.totalScore}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          {loading ? (
            <div className="px-4 py-12 text-center text-slate-400 text-sm">Loading…</div>
          ) : paginated.length === 0 ? (
            <div className="px-4 py-12 text-center text-slate-300 text-sm">
              No responses match your filters.
            </div>
          ) : (
            <div className="p-3 space-y-3 bg-slate-50/40">
              {paginated.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-slate-800 truncate">
                        {r.email}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {new Date(r.submittedAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <span
                      className="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-medium ring-1 ring-inset"
                      style={{
                        background: CAMPAIGN_COLORS[r.campaign] || "#f8fafc",
                        color: "#475569",
                        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.35)",
                      }}
                    >
                      {r.campaign}
                    </span>
                  </div>

                  {/* Yes/No pills */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        r.willGive === "Yes"
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                          : "bg-slate-100 text-slate-400 ring-1 ring-slate-200"
                      }`}
                    >
                      Give: {r.willGive}
                    </span>

                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        r.willVote === "Yes"
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                          : "bg-slate-100 text-slate-400 ring-1 ring-slate-200"
                      }`}
                    >
                      Vote: {r.willVote}
                    </span>

                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        r.willShine === "Yes"
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                          : "bg-slate-100 text-slate-400 ring-1 ring-slate-200"
                      }`}
                    >
                      Shine: {r.willShine}
                    </span>
                  </div>

                  {/* Detail grid */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-3 text-[12px]">
                    <div>
                      <p className="text-slate-400 mb-1">Donation</p>
                      <p className="text-slate-700 font-medium">
                        {r.donationAmount || <span className="text-slate-300">—</span>}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400 mb-1">Recognition</p>
                      <p className="text-slate-700 truncate">
                        {r.prefersEarning || <span className="text-slate-300">—</span>}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400 mb-1">Device</p>
                      <p className="text-slate-700">
                        {r.device || <span className="text-slate-300">—</span>}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400 mb-1">Survey</p>
                      <span className="inline-flex min-w-[36px] justify-center rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-100 px-2.5 py-1 text-[11px] font-semibold">
                        {r.surveyScore}
                      </span>
                    </div>

                    <div>
                      <p className="text-slate-400 mb-1">Referral</p>
                      <span
                        className={`inline-flex min-w-[36px] justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
                          r.referralScore > 0
                            ? "bg-amber-50 text-amber-700 ring-amber-100"
                            : "bg-slate-100 text-slate-400 ring-slate-200"
                        }`}
                      >
                        +{r.referralScore}
                      </span>
                    </div>

                    <div>
                      <p className="text-slate-400 mb-1">Total</p>
                      <span className="inline-flex min-w-[40px] justify-center rounded-full bg-slate-900 text-white px-3 py-1 text-[11px] font-semibold shadow-sm">
                        {r.totalScore}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-4 py-3.5 border-t border-slate-100 bg-slate-50/60">
            <p className="text-[12px] text-slate-400">
              Page <span className="font-medium text-slate-600">{page}</span> of{" "}
              <span className="font-medium text-slate-600">{totalPages}</span>
            </p>

            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3.5 py-2 text-[12px] rounded-xl bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-[34px] h-[34px] text-[12px] rounded-xl border transition-colors ${
                    p === page
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3.5 py-2 text-[12px] rounded-xl bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Response count */}
      <span className="font-medium text-sm text-[#6098AE] whitespace-nowrap ml-auto">
          {filtered.length} response{filtered.length !== 1 ? "s" : ""}
        </span>

      {/* Filters modal */}
      {showFiltersModal && (
        <FiltersModal
          initial={activeFilters}
          onApply={(f) => { setActiveFilters(f); setPage(1); }}
          onClose={() => setShowFiltersModal(false)}
        />
      )}

      {/* Export modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/35 z-50 flex items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setShowExportModal(false); }}
        >
          <div className="bg-white rounded-xl shadow-lg w-140 max-w-95vw p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#2d2d2d] m-0">
                Export {filtered.length} response{filtered.length !== 1 ? "s" : ""}
              </h2>
              <button onClick={() => setShowExportModal(false)}
                className="bg-none border-none cursor-pointer text-xl text-[#aaa] p-2">✕</button>
            </div>

            {/* Format picker */}
            <p className="text-sm text-[#555] mb-4">Choose your format:</p>

            {(["csv", "xlsx"] as const).map((fmt) => (
              <label key={fmt}
                onClick={() => setExportFormat(fmt)}
                className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg mb-4 cursor-pointer bg-white hover:border-slate-300 transition-colors">
                {/* Radio circle */}
                <span className="w-5 h-5 rounded-full border-2 border-[#ccc] bg-white inline-flex items-center justify-center flex-shrink-0 mt-1">
                  {exportFormat === fmt && <span className="w-3 h-3 rounded-full bg-[#5a9aaa] block" />}
                </span>
                <span>
                  <span className="text-sm text-[#2d2d2d] block font-semibold">
                    .{fmt}
                  </span>
                  <span className="text-xs text-[#999]">
                    {fmt === "csv" ? "Plain text data for databases or advanced analysis." : "Works with Excel."}
                  </span>
                </span>
              </label>
            ))}

            {/* Footer buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setShowExportModal(false)}
                className="px-6 py-2 border border-slate-200 rounded-lg text-sm text-[#666] bg-white cursor-pointer">
                Cancel
              </button>
              <button onClick={runExport}
                className="px-6 py-2 border-none rounded-lg bg-[#5a9aaa] text-sm text-white cursor-pointer">
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
