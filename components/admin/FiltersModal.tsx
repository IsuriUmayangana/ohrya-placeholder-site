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
    <div ref={ref} className="relative flex-shrink-0">
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-6 border border-slate-200 rounded-lg p-3 text-sm text-[#444] bg-white cursor-pointer whitespace-nowrap">
        {label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 z-30 bg-white border border-slate-200 rounded-lg shadow-lg min-w-40 overflow-hidden">
          {OPERATORS.map((op) => (
            <button key={op.value} onClick={() => { onChange(op.value); setOpen(false); }}
              className="block w-full text-left p-3 border-none cursor-pointer text-sm bg-white hover:bg-[#f0f8fa] text-[#333]">
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
    <div ref={ref} className="relative flex-1">
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full border border-slate-200 rounded-lg p-3 text-sm text-[#bbb] bg-white cursor-pointer">
        {label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-30 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-8 p-3 border-b border-slate-200">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#bbb" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="#bbb" strokeWidth="2" strokeLinecap="round"/></svg>
            <input autoFocus placeholder="Search options" value={search} onChange={(e) => setSearch(e.target.value)}
              className="border-none outline-none text-sm flex-1 bg-transparent text-[#2d2d2d]" />
          </div>
          {/* Count header */}
          <div className="p-2 text-sm text-[#999] font-bold">
            {filtered.length} option{filtered.length !== 1 ? "s" : ""}
          </div>
          {/* Options list */}
          <div className="max-h-50 overflow-y-auto">
            {filtered.map((opt) => (
              <button key={opt} onClick={() => toggle(opt)}
                className="flex items-center gap-10 w-full text-left p-3 border-none cursor-pointer text-sm text-[#333] bg-white hover:bg-[#f5fbfc]"
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5fbfc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              >
                {/* Checkbox */}
                <span className="w-4 h-4 rounded-md border-2 border-[#ccc] bg-white inline-flex items-center justify-center flex-shrink-0 transition-all duration-150">
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
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full border border-slate-200 rounded-lg p-3 text-sm text-[#bbb] bg-white cursor-pointer text-left">
        {value && (
          <span className="w-6 h-6 rounded-md bg-[#e8f5f8] inline-flex items-center justify-center flex-shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4" stroke="#5a9aaa" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </span>
        )}
        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
          {question ? question.label : "Filter by question or data"}
        </span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d="M6 9l6 6 6-6" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-30 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center gap-8 p-3 border-b border-slate-200">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#bbb" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="#bbb" strokeWidth="2" strokeLinecap="round"/></svg>
            <input autoFocus placeholder="Type something" value={search} onChange={(e) => setSearch(e.target.value)}
              className="border-none outline-none text-sm flex-1 bg-transparent" />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.map((q) => (
              <button key={q.fieldId} onClick={() => { onChange(q.fieldId); setOpen(false); setSearch(""); }}
                className="flex items-center gap-5 w-full text-left p-3 border-none cursor-pointer text-sm text-[#333] bg-white hover:bg-[#f0f8fa]">
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
      className="fixed inset-0 bg-black/18 z-50 flex items-center justify-center p-2 lg:p-0"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-lg w-140 max-w-95vw min-h-[500px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-10">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M7 12h10M10 18h4" stroke="#5a9aaa" strokeWidth="2" strokeLinecap="round"/></svg>
            <span className="text-lg font-bold text-[#2d2d2d]">Filter responses</span>
          </div>
          <button onClick={onClose} className="bg-none border-none cursor-pointer text-lg text-[#aaa]">✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col gap-6">
          {pending.map((filter, i) => {
            const question = QUESTIONS.find((q) => q.fieldId === filter.fieldId);
            const showValues = needsValues(filter.operator);
            return (
              <div key={i} className="bg-[#fafcfd] border border-slate-200 rounded-lg p-4">
                {/* Row 1: Question + delete */}
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <QuestionDropdown value={filter.fieldId} onChange={(id) => update(i, { fieldId: id, values: [] })} />
                  </div>
                  {/* Trash */}
                  <button onClick={() => removeFilter(i)}
                    className="bg-none border border-slate-200 rounded-lg p-2 cursor-pointer text-slate-400 flex items-center"
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
                  <div className="flex gap-8 mt-4 items-start">
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
            className="flex items-center gap-6 bg-none border-none cursor-pointer text-sm text-[#5a9aaa] py-2">
            <span className="text-lg">+</span> Add filter
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-8 p-4 border-t border-slate-200">
          <button onClick={onClose} className="px-6 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white cursor-pointer">Cancel</button>
          <button onClick={apply} className="px-6 py-2 border-none rounded-lg bg-[#5a9aaa] text-sm text-white cursor-pointer">Apply</button>
        </div>
      </div>
    </div>
  );
}
