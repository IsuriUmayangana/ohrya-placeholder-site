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
  device: string; dashboardUrl: string;
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
      "Dashboard URL": typeof window !== "undefined" ? `${window.location.origin}${r.dashboardUrl}` : r.dashboardUrl,
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
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="#aaa" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text" placeholder="Search responses…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ ...inputStyle, width: "100%", paddingLeft: 32 }}
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
            fontFamily: "Georgia, serif", fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M7 12h10M10 18h4" stroke={hasFilters ? "white" : "#888"} strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Filters {hasFilters ? `(${activeFilters.length})` : ""}
        </button>

        {/* Active filter tags */}
        {activeFilters.map((f, i) => {
          const opLabel = { is_any_of: "is any of", is_not_any_of: "is not any of", is_equal_to: "=", is_not_equal_to: "≠", is_empty: "is empty", is_not_empty: "is not empty" }[f.operator] ?? f.operator;
          const valLabel = f.values.length > 0 ? f.values.join(", ") : "";
          return (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 5, background: "#e8f5f8", borderRadius: 20, padding: "4px 12px", fontFamily: "Georgia, serif", fontSize: "0.78rem", color: "#5a9aaa", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{f.fieldId.replace(/([A-Z])/g, " $1").trim()} {opLabel}{valLabel ? `: ${valLabel}` : ""}</span>
              <button onClick={() => setActiveFilters((a) => a.filter((_, idx) => idx !== i))}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#5a9aaa", fontSize: "0.9rem", lineHeight: 1, padding: 0, flexShrink: 0 }}>✕</button>
            </span>
          );
        })}

        {/* Clear all */}
        {hasFilters && (
          <button onClick={() => setActiveFilters([])}
            style={{ background: "none", border: "none", color: "#aaa", fontFamily: "Georgia, serif", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline" }}>
            Clear all
          </button>
        )}

        <span style={{ fontFamily: "Georgia, serif", fontSize: "0.82rem", color: "#aaa", whiteSpace: "nowrap", marginLeft: "auto" }}>
          {filtered.length} response{filtered.length !== 1 ? "s" : ""}
        </span>

        {/* Export button */}
        <button
          onClick={() => { if (filtered.length > 0) setShowExportModal(true); }}
          disabled={filtered.length === 0}
          style={{ display: "flex", alignItems: "center", gap: 7, background: filtered.length > 0 ? "#2d2d2d" : "#e0e8ec", color: filtered.length > 0 ? "white" : "#bbb", border: "none", borderRadius: 7, padding: "8px 16px", fontFamily: "Georgia, serif", fontSize: "0.85rem", cursor: filtered.length > 0 ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}
          onMouseEnter={(e) => { if (filtered.length > 0) e.currentTarget.style.background = "#444"; }}
          onMouseLeave={(e) => { if (filtered.length > 0) e.currentTarget.style.background = "#2d2d2d"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "white", border: "1px solid #e8f0f2", borderRadius: 10, overflow: "hidden", opacity: loading ? 0.6 : 1, transition: "opacity 0.2s" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid #e8f0f2" }}>
                {["Email", "Date", "Campaign", "Give?", "Donation", "Vote?", "Shine?", "Recognition", "Device", "Survey", "Referral", "Total", "Dashboard"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "Georgia, serif", fontWeight: "normal", color: "#999", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={13} style={{ padding: "40px", textAlign: "center", fontFamily: "Georgia, serif", color: "#ccc" }}>Loading…</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={13} style={{ padding: "40px", textAlign: "center", fontFamily: "Georgia, serif", color: "#ccc" }}>No responses match your filters.</td></tr>
              ) : paginated.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f5f5f5", background: i % 2 === 0 ? "#fff" : "#fafcfd" }}>
                  <td style={{ padding: "11px 16px", fontFamily: "Georgia, serif", color: "#2d2d2d", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.email}</td>
                  <td style={{ padding: "11px 16px", fontFamily: "Georgia, serif", color: "#aaa", whiteSpace: "nowrap" }}>
                    {new Date(r.submittedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ background: CAMPAIGN_COLORS[r.campaign] || "#f5f5f5", borderRadius: 20, padding: "3px 10px", fontFamily: "Georgia, serif", color: "#555", fontSize: "0.78rem" }}>{r.campaign}</span>
                  </td>
                  <td style={{ padding: "11px 16px", fontFamily: "Georgia, serif", color: r.willGive === "Yes" ? "#5a9aaa" : "#aaa" }}>{r.willGive}</td>
                  <td style={{ padding: "11px 16px", fontFamily: "Georgia, serif", color: "#555" }}>{r.donationAmount || "—"}</td>
                  <td style={{ padding: "11px 16px", fontFamily: "Georgia, serif", color: r.willVote === "Yes" ? "#5a9aaa" : "#aaa" }}>{r.willVote}</td>
                  <td style={{ padding: "11px 16px", fontFamily: "Georgia, serif", color: r.willShine === "Yes" ? "#5a9aaa" : "#aaa" }}>{r.willShine}</td>
                  <td style={{ padding: "11px 16px", fontFamily: "Georgia, serif", color: "#777", fontSize: "0.78rem" }}>{r.prefersEarning}</td>
                  <td style={{ padding: "11px 16px", fontFamily: "Georgia, serif", color: "#999", fontSize: "0.78rem" }}>{r.device}</td>
                  <td style={{ padding: "11px 16px", textAlign: "center" }}>
                    <span style={{ background: "#e8f5f8", color: "#5a9aaa", borderRadius: 20, padding: "3px 10px", fontFamily: "Georgia, serif", fontWeight: "bold" }}>{r.surveyScore}</span>
                  </td>
                  <td style={{ padding: "11px 16px", textAlign: "center" }}>
                    <span style={{ background: r.referralScore > 0 ? "#fff8e6" : "#f5f5f5", color: r.referralScore > 0 ? "#c9a84c" : "#ccc", borderRadius: 20, padding: "3px 10px", fontFamily: "Georgia, serif", fontWeight: "bold" }}>+{r.referralScore}</span>
                  </td>
                  <td style={{ padding: "11px 16px", textAlign: "center" }}>
                    <span style={{ background: "#5a9aaa", color: "white", borderRadius: 20, padding: "3px 12px", fontFamily: "Georgia, serif", fontWeight: "bold" }}>{r.totalScore}</span>
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <a href={r.dashboardUrl} target="_blank" rel="noopener noreferrer"
                      style={{ color: "#5a9aaa", fontFamily: "Georgia, serif", fontSize: "0.78rem", textDecoration: "none", borderBottom: "1px solid #5a9aaa" }}>
                      View ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "16px", borderTop: "1px solid #f0f0f0" }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: "6px 14px", border: "1px solid #e0e8ec", borderRadius: 6, background: "white", fontFamily: "Georgia, serif", fontSize: "0.82rem", cursor: page === 1 ? "not-allowed" : "pointer", color: page === 1 ? "#ccc" : "#5a9aaa" }}>
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                style={{ padding: "6px 12px", border: "1px solid #e0e8ec", borderRadius: 6, background: p === page ? "#5a9aaa" : "white", color: p === page ? "white" : "#555", fontFamily: "Georgia, serif", fontSize: "0.82rem", cursor: "pointer" }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: "6px 14px", border: "1px solid #e0e8ec", borderRadius: 6, background: "white", fontFamily: "Georgia, serif", fontSize: "0.82rem", cursor: page === totalPages ? "not-allowed" : "pointer", color: page === totalPages ? "#ccc" : "#5a9aaa" }}>
              Next →
            </button>
          </div>
        )}
      </div>

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
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowExportModal(false); }}
        >
          <div style={{ background: "white", borderRadius: 14, boxShadow: "0 16px 48px rgba(0,0,0,0.18)", width: 440, maxWidth: "95vw", padding: "32px 32px 28px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.15rem", color: "#2d2d2d", margin: 0 }}>
                Export {filtered.length} response{filtered.length !== 1 ? "s" : ""}
              </h2>
              <button onClick={() => setShowExportModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: "1.2rem", lineHeight: 1, padding: 2 }}>✕</button>
            </div>

            {/* Format picker */}
            <p style={{ fontFamily: "Georgia, serif", fontSize: "0.88rem", color: "#555", marginBottom: 18 }}>Choose your format:</p>

            {(["csv", "xlsx"] as const).map((fmt) => (
              <label key={fmt}
                onClick={() => setExportFormat(fmt)}
                style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px", border: `1.5px solid ${exportFormat === fmt ? "#2d2d2d" : "#e0e8ec"}`, borderRadius: 10, marginBottom: 10, cursor: "pointer", background: exportFormat === fmt ? "#fafafa" : "white", transition: "border-color 0.15s" }}>
                {/* Radio circle */}
                <span style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${exportFormat === fmt ? "#2d2d2d" : "#ccc"}`, background: exportFormat === fmt ? "#2d2d2d" : "white", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  {exportFormat === fmt && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "white", display: "block" }} />}
                </span>
                <span>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: "0.9rem", color: "#2d2d2d", display: "block", fontWeight: exportFormat === fmt ? "bold" : "normal" }}>
                    .{fmt}
                  </span>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: "0.8rem", color: "#999" }}>
                    {fmt === "csv" ? "Plain text data for databases or advanced analysis." : "Works with Excel."}
                  </span>
                </span>
              </label>
            ))}

            {/* Footer buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
              <button onClick={() => setShowExportModal(false)}
                style={{ padding: "9px 22px", border: "1px solid #e0e8ec", borderRadius: 8, background: "white", fontFamily: "Georgia, serif", fontSize: "0.88rem", color: "#666", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={runExport}
                style={{ padding: "9px 24px", border: "none", borderRadius: 8, background: "#2d2d2d", fontFamily: "Georgia, serif", fontSize: "0.88rem", color: "white", cursor: "pointer" }}>
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
