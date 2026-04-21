"use client";

import { useState, useRef, useEffect } from "react";

export type FilterOperator =
  | "is_any_of" | "is_not_any_of"
  | "is_equal_to" | "is_not_equal_to"
  | "is_empty" | "is_not_empty";

export interface ActiveFilter {
  fieldId: string;
  label: string;
  operator: FilterOperator;
  values: string[];
}

interface Question { fieldId: string; label: string; options: string[]; }

const QUESTIONS: Question[] = [
  { fieldId: "campaign",       label: "Which campaign inspires you the most?",                                       options: ["Children", "Animals", "Veterans"] },
  { fieldId: "willGive",       label: "After watching the video, will you GIVE to a campaign?",                      options: ["Yes", "Not Yet"] },
  { fieldId: "donationAmount", label: "If you chose to donate, what amount feels right?",                            options: ["$25", "$50", "$75", "$100", "$150", "$200"] },
  { fieldId: "willVote",       label: "Will you VOTE for a vetted nonprofit to receive the pooled funding?",         options: ["Yes", "No"] },
  { fieldId: "willShine",      label: "Will you SHINE by sharing your unique link to inspire your network?",         options: ["Yes", "No"] },
  { fieldId: "prefersEarning", label: "Is earning recognition through effort more appealing than relying on chance?",options: ["Yes, I prefer earning it", "No, I prefer chance"] },
];

const OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: "is_any_of",      label: "Is any of" },
  { value: "is_not_any_of", label: "Is not any of" },
  { value: "is_equal_to",   label: "Is equal to" },
  { value: "is_not_equal_to", label: "Is not equal to" },
  { value: "is_empty",      label: "Is empty" },
  { value: "is_not_empty",  label: "Is not empty" },
];

const needsValues = (op: FilterOperator) => !["is_empty", "is_not_empty"].includes(op);

interface PendingFilter { fieldId: string; operator: FilterOperator; values: string[]; }

interface Props {
  initial: ActiveFilter[];
  onApply: (filters: ActiveFilter[]) => void;
  onClose: () => void;
}

// ---------- Operator dropdown ----------
function OperatorDropdown({ value, onChange }: { value: FilterOperator; onChange: (v: FilterOperator) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  const label = OPERATORS.find((o) => o.value === value)?.label ?? "Is any of";
  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #e0e8ec", borderRadius: 7, padding: "8px 12px", fontFamily: "Georgia, serif", fontSize: "0.82rem", color: "#444", background: "white", cursor: "pointer", whiteSpace: "nowrap" }}>
        {label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 30, background: "white", border: "1px solid #e8f0f2", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 160, overflow: "hidden" }}>
          {OPERATORS.map((op) => (
            <button key={op.value} onClick={() => { onChange(op.value); setOpen(false); }}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "0.83rem", background: value === op.value ? "#f0f8fa" : "white", color: value === op.value ? "#5a9aaa" : "#333" }}>
              {op.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Value (Select options) dropdown ----------
function ValuesDropdown({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const filtered = options.filter((o) => !search || o.toLowerCase().includes(search.toLowerCase()));

  function toggle(opt: string) {
    onChange(selected.includes(opt) ? selected.filter((v) => v !== opt) : [...selected, opt]);
  }

  const label = selected.length === 0 ? "Select options" : selected.length === 1 ? selected[0] : `${selected.length} selected`;

  return (
    <div ref={ref} style={{ position: "relative", flex: 1 }}>
      <button onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", border: "1px solid #e0e8ec", borderRadius: 7, padding: "8px 12px", fontFamily: "Georgia, serif", fontSize: "0.82rem", color: selected.length ? "#2d2d2d" : "#bbb", background: "white", cursor: "pointer" }}>
        {label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 30, background: "white", border: "1px solid #e8f0f2", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden" }}>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: "1px solid #f0f0f0" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#bbb" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="#bbb" strokeWidth="2" strokeLinecap="round"/></svg>
            <input autoFocus placeholder="Search options" value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", fontFamily: "Georgia, serif", fontSize: "0.83rem", color: "#2d2d2d", flex: 1, background: "transparent" }} />
          </div>
          {/* Count header */}
          <div style={{ padding: "8px 14px 4px", fontFamily: "Georgia, serif", fontSize: "0.75rem", color: "#999", fontWeight: "bold" }}>
            {filtered.length} option{filtered.length !== 1 ? "s" : ""}
          </div>
          {/* Options list */}
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {filtered.map((opt) => (
              <button key={opt} onClick={() => toggle(opt)}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "9px 14px", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "0.83rem", color: "#333", background: "white" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5fbfc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              >
                {/* Checkbox */}
                <span style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${selected.includes(opt) ? "#5a9aaa" : "#ccc"}`, background: selected.includes(opt) ? "#5a9aaa" : "white", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                  {selected.includes(opt) && <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Question selector dropdown ----------
function QuestionDropdown({ value, onChange }: { value: string; onChange: (fieldId: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const question = QUESTIONS.find((q) => q.fieldId === value);
  const filtered = QUESTIONS.filter((q) => !search || q.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", border: "1px solid #e0e8ec", borderRadius: 7, padding: "9px 14px", fontFamily: "Georgia, serif", fontSize: "0.83rem", color: value ? "#2d2d2d" : "#bbb", background: "white", cursor: "pointer", textAlign: "left" }}>
        {value && (
          <span style={{ width: 22, height: 22, borderRadius: 4, background: "#e8f5f8", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4" stroke="#5a9aaa" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </span>
        )}
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {question ? question.label : "Filter by question or data"}
        </span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d="M6 9l6 6 6-6" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 30, background: "white", border: "1px solid #e8f0f2", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: "1px solid #f0f0f0" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#bbb" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="#bbb" strokeWidth="2" strokeLinecap="round"/></svg>
            <input autoFocus placeholder="Type something" value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", fontFamily: "Georgia, serif", fontSize: "0.83rem", flex: 1, background: "transparent" }} />
          </div>
          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {filtered.map((q) => (
              <button key={q.fieldId} onClick={() => { onChange(q.fieldId); setOpen(false); setSearch(""); }}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "11px 14px", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "0.83rem", color: "#333", background: value === q.fieldId ? "#f0f8fa" : "white" }}>
                <span style={{ width: 22, height: 22, borderRadius: 4, background: "#e8f5f8", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4" stroke="#5a9aaa" strokeWidth="2.5" strokeLinecap="round"/></svg>
                </span>
                {q.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Main modal ----------
export default function FiltersModal({ initial, onApply, onClose }: Props) {
  const [pending, setPending] = useState<PendingFilter[]>(
    initial.length > 0
      ? initial.map((f) => ({ fieldId: f.fieldId, operator: f.operator, values: f.values }))
      : [{ fieldId: "", operator: "is_any_of", values: [] }]
  );

  function update(i: number, patch: Partial<PendingFilter>) {
    setPending((p) => p.map((f, idx) => idx === i ? { ...f, ...patch } : f));
  }

  function addFilter() { setPending((p) => [...p, { fieldId: "", operator: "is_any_of", values: [] }]); }
  function removeFilter(i: number) { setPending((p) => p.filter((_, idx) => idx !== i)); }

  function apply() {
    const valid: ActiveFilter[] = pending
      .filter((f) => f.fieldId && (["is_empty", "is_not_empty"].includes(f.operator) || f.values.length > 0))
      .map((f) => ({
        fieldId: f.fieldId,
        label: QUESTIONS.find((q) => q.fieldId === f.fieldId)?.label ?? f.fieldId,
        operator: f.operator,
        values: f.values,
      }));
    onApply(valid);
    onClose();
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.18)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "white", borderRadius: 14, boxShadow: "0 16px 48px rgba(0,0,0,0.16)", width: 560, maxWidth: "95vw", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M7 12h10M10 18h4" stroke="#5a9aaa" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontFamily: "Georgia, serif", fontSize: "1rem", color: "#2d2d2d", fontWeight: "bold" }}>Filter responses</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: "1.1rem" }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {pending.map((filter, i) => {
            const question = QUESTIONS.find((q) => q.fieldId === filter.fieldId);
            const showValues = needsValues(filter.operator);
            return (
              <div key={i} style={{ background: "#fafcfd", border: "1px solid #e8f0f2", borderRadius: 10, padding: "14px" }}>
                {/* Row 1: Question + delete */}
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <QuestionDropdown value={filter.fieldId} onChange={(id) => update(i, { fieldId: id, values: [] })} />
                  </div>
                  {/* Trash */}
                  <button onClick={() => removeFilter(i)}
                    style={{ background: "none", border: "1px solid #e0e8ec", borderRadius: 7, padding: "8px 10px", cursor: "pointer", color: "#ccc", display: "flex", alignItems: "center" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#e74c3c"; e.currentTarget.style.borderColor = "#e74c3c"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#ccc"; e.currentTarget.style.borderColor = "#e0e8ec"; }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                {/* Row 2: Operator + Values (shown only when question selected) */}
                {filter.fieldId && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "flex-start" }}>
                    <OperatorDropdown value={filter.operator} onChange={(op) => update(i, { operator: op, values: [] })} />
                    {showValues && question && (
                      <ValuesDropdown
                        options={question.options}
                        selected={filter.values}
                        onChange={(vals) => update(i, { values: vals })}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add filter */}
          <button onClick={addFilter}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "0.85rem", color: "#5a9aaa", padding: "2px 0" }}>
            <span style={{ fontSize: "1.1rem" }}>+</span> Add filter
          </button>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "14px 24px", borderTop: "1px solid #f0f0f0" }}>
          <button onClick={onClose}
            style={{ padding: "9px 22px", border: "1px solid #e0e8ec", borderRadius: 7, background: "white", fontFamily: "Georgia, serif", fontSize: "0.85rem", color: "#666", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={apply}
            style={{ padding: "9px 22px", border: "none", borderRadius: 7, background: "#2d2d2d", fontFamily: "Georgia, serif", fontSize: "0.85rem", color: "white", cursor: "pointer" }}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
