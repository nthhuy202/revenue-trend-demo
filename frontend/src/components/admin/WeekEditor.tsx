"use client";

import { useState } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { formatDayMonth } from "@/lib/format";
import type { AdminWeek, Day } from "@/lib/types";

type WeekEditorProps = { week: string; days: Day[]; onSaved: (data: AdminWeek) => void };

type FieldKey = "posRevenue" | "eatclubRevenue" | "labourCosts" | "covers";

type DayField = { key: FieldKey; label: string; step: string };

// Inputs keep the text as typed; the server validates and rejects blanks/negatives.
type Row = { date: string; weekday: string } & Record<FieldKey, string>;

type SaveStatus = { kind: "error" | "ok"; text: string };

const DAY_FIELDS: DayField[] = [
  { key: "posRevenue", label: "POS Revenue ($)", step: "0.01" },
  { key: "eatclubRevenue", label: "Eatclub Revenue ($)", step: "0.01" },
  { key: "labourCosts", label: "Labour Costs ($)", step: "0.01" },
  { key: "covers", label: "Covers", step: "1" },
];

const mapDaysToRows = (days: Day[]): Row[] =>
  days.map((day) => ({
    date: day.date,
    weekday: day.weekday,
    posRevenue: String(day.posRevenue),
    eatclubRevenue: String(day.eatclubRevenue),
    labourCosts: String(day.labourCosts),
    covers: String(day.covers),
  }));

const getStatusClass = (status: SaveStatus) => (status.kind === "ok" ? "text-sm text-green-700" : "text-sm text-red-700");

export default function WeekEditor({ week, days, onSaved }: WeekEditorProps) {
  const [rows, setRows] = useState(() => mapDaysToRows(days));
  const [status, setStatus] = useState<SaveStatus | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (rowIndex: number, key: FieldKey, value: string) => {
    setStatus(null);
    setRows((currentRows) => currentRows.map((row, index) => (index === rowIndex ? { ...row, [key]: value } : row)));
  };

  async function handleSave(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    try {
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
      setRows(mapDaysToRows(saved.days));
      setStatus({ kind: "ok", text: "Saved — the chart now shows these numbers." });
    } catch (saveError) {
      setStatus({ kind: "error", text: getErrorMessage(saveError) });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-medium">Daily figures</h2>
        <p className="text-xs text-neutral-500">Total revenue = POS + Eatclub</p>
      </div>
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-neutral-500">
              <th className="py-2 pr-3 font-normal">Day</th>
              {DAY_FIELDS.map((field) => (
                <th key={field.key} className="px-1 py-2 font-normal">
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.date} className="border-t border-neutral-100">
                <td className="py-2 pr-3 whitespace-nowrap">
                  <span className="font-medium">{row.weekday}</span>{" "}
                  <span className="text-neutral-500">{formatDayMonth(row.date)}</span>
                </td>
                {DAY_FIELDS.map((field) => (
                  <td key={field.key} className="px-1 py-1.5">
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step={field.step}
                      required
                      aria-label={`${field.label} ${row.weekday}`}
                      value={row[field.key]}
                      onChange={(event) => updateField(rowIndex, field.key, event.target.value)}
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
          disabled={isSaving}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save week"}
        </button>
        {status && (
          <p role="status" className={getStatusClass(status)}>
            {status.text}
          </p>
        )}
      </div>
    </form>
  );
}
