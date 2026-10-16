"use client";

import { useId, useState } from "react";
import { Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import { formatDayMonth } from "@/lib/format";
import type { Day, RevenueEvent } from "@/lib/types";

type Props = { days: Day[]; events: RevenueEvent[]; onChanged: () => void };

export default function EventsEditor({ days, events, onChanged }: Props) {
  const [date, setDate] = useState(days[0].date);
  const [impact, setImpact] = useState<RevenueEvent["impact"]>("positive");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const id = useId();

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/admin/events", { method: "POST", body: JSON.stringify({ date, impact, label }) });
      setLabel("");
      onChanged();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    setError(null);
    try {
      await api(`/api/admin/events/${id}`, { method: "DELETE" });
      onChanged();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const inputClass = "rounded-lg border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900";

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
      <h2 className="mb-3 font-medium">Events</h2>
      {events.length === 0 ? (
        <p className="text-sm text-neutral-500">No events this week.</p>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {events.map((ev) => {
            const Icon = ev.impact === "positive" ? TrendingUp : TrendingDown;
            const day = days.find((d) => d.date === ev.date);
            return (
              <li key={ev.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="flex items-center gap-2">
                  <Icon className={`size-4 ${ev.impact === "positive" ? "text-green-600" : "text-red-600"}`} />
                  <span className="text-neutral-500">
                    {day?.weekday} {formatDayMonth(ev.date)}
                  </span>
                  {ev.label}
                </span>
                <button
                  type="button"
                  aria-label={`Delete event ${ev.label}`}
                  onClick={() => remove(ev.id)}
                  className="rounded-lg p-1.5 text-neutral-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={add} className="mt-4 flex flex-wrap items-end gap-2 border-t border-neutral-100 pt-4">
        <div className="flex flex-col gap-1 text-xs text-neutral-500">
          <label htmlFor={`${id}-day`}>Day</label>
          <select id={`${id}-day`} value={date} onChange={(e) => setDate(e.target.value)} className={inputClass}>
            {days.map((d) => (
              <option key={d.date} value={d.date}>
                {d.weekday} {formatDayMonth(d.date)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 text-xs text-neutral-500">
          <label htmlFor={`${id}-impact`}>Impact</label>
          <select id={`${id}-impact`} value={impact} onChange={(e) => setImpact(e.target.value as RevenueEvent["impact"])} className={inputClass}>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
          </select>
        </div>
        <div className="flex min-w-[180px] flex-1 flex-col gap-1 text-xs text-neutral-500">
          <label htmlFor={`${id}-label`}>Label</label>
          <input
            id={`${id}-label`}
            required
            maxLength={80}
            placeholder="e.g. Local festival"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          Add event
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
