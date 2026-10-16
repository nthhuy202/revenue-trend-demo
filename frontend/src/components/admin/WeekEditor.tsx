"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { formatDayMonth } from "@/lib/format";
import type { AdminWeek, Day } from "@/lib/types";

const FIELDS = [
  { key: "posRevenue", label: "POS Revenue ($)", step: "0.01" },
  { key: "eatclubRevenue", label: "Eatclub Revenue ($)", step: "0.01" },
  { key: "labourCosts", label: "Labour Costs ($)", step: "0.01" },
  { key: "covers", label: "Covers", step: "1" },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];
type Row = { date: string; weekday: string } & Record<FieldKey, string>;

const toRows = (days: Day[]): Row[] =>
  days.map((d) => ({
    date: d.date,
    weekday: d.weekday,
    posRevenue: String(d.posRevenue),
    eatclubRevenue: String(d.eatclubRevenue),
    labourCosts: String(d.labourCosts),
    covers: String(d.covers),
  }));

type Props = { week: string; days: Day[]; onSaved: (data: AdminWeek) => void };

export default function WeekEditor({ week, days, onSaved }: Props) {
  const [rows, setRows] = useState(() => toRows(days));
  const [status, setStatus] = useState<{ kind: "error" | "ok"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const update = (i: number, key: FieldKey, value: string) => {
    setStatus(null);
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [key]: value } : r)));
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // Strings go to the API as typed; the server validates and rejects blanks/negatives.
      const payload = rows.map(({ date, posRevenue, eatclubRevenue, labourCosts, covers }) => ({
        date,
        posRevenue,
        eatclubRevenue,
        labourCosts,
        covers,
      }));
      const saved = await api<AdminWeek>(`/api/admin/weeks/${week}/days`, {
        method: "PUT",
        body: JSON.stringify({ days: payload }),
      });
      onSaved(saved);
      setRows(toRows(saved.days));
      setStatus({ kind: "ok", text: "Saved — the chart now shows these numbers." });
    } catch (err) {
      setStatus({ kind: "error", text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-medium">Daily figures</h2>
        <p className="text-xs text-neutral-500">Total revenue = POS + Eatclub</p>
      </div>
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-neutral-500">
              <th className="py-2 pr-3 font-normal">Day</th>
              {FIELDS.map((f) => (
                <th key={f.key} className="px-1 py-2 font-normal">
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.date} className="border-t border-neutral-100">
                <td className="py-2 pr-3 whitespace-nowrap">
                  <span className="font-medium">{r.weekday}</span>{" "}
                  <span className="text-neutral-500">{formatDayMonth(r.date)}</span>
                </td>
                {FIELDS.map((f) => (
                  <td key={f.key} className="px-1 py-1.5">
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step={f.step}
                      required
                      aria-label={`${f.label} ${r.weekday}`}
                      value={r[f.key]}
                      onChange={(e) => update(i, f.key, e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 tabular-nums outline-none focus:border-neutral-900"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save week"}
        </button>
        {status && (
          <p role="status" className={`text-sm ${status.kind === "ok" ? "text-green-700" : "text-red-700"}`}>
            {status.text}
          </p>
        )}
      </div>
    </form>
  );
}
