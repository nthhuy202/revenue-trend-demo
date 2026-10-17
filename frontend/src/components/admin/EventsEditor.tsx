"use client";

import { useId, useState } from "react";
import { Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { formatDayMonth } from "@/lib/format";
import type { Day, RevenueEvent } from "@/lib/types";

type EventsEditorProps = { days: Day[]; events: RevenueEvent[]; onChanged: () => void };

type EventFields = { date: string; impact: RevenueEvent["impact"]; label: string };

const INPUT_CLASS = "rounded-lg border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900";

const getImpactIconClass = (impact: RevenueEvent["impact"]) =>
  impact === "positive" ? "size-4 text-green-600" : "size-4 text-red-600";

const isImpact = (value: string): value is RevenueEvent["impact"] => value === "positive" || value === "negative";

export default function EventsEditor({ days, events, onChanged }: EventsEditorProps) {
  const [fields, setFields] = useState<EventFields>({ date: days[0].date, impact: "positive", label: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formId = useId();

  async function handleAdd(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api("/api/admin/events", { method: "POST", body: JSON.stringify(fields) });
      setFields({ ...fields, label: "" });
      onChanged();
    } catch (addError) {
      setError(getErrorMessage(addError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(eventId: number) {
    setError(null);

    try {
      await api(`/api/admin/events/${eventId}`, { method: "DELETE" });
      onChanged();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
      <h2 className="mb-3 font-medium">Events</h2>
      {events.length === 0 ? (
        <p className="text-sm text-neutral-500">No events this week.</p>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {events.map((revenueEvent) => {
            const Icon = revenueEvent.impact === "positive" ? TrendingUp : TrendingDown;
            const day = days.find((weekDay) => weekDay.date === revenueEvent.date);

            return (
              <li key={revenueEvent.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="flex items-center gap-2">
                  <Icon className={getImpactIconClass(revenueEvent.impact)} />
                  <span className="text-neutral-500">
                    {day?.weekday} {formatDayMonth(revenueEvent.date)}
                  </span>
                  {revenueEvent.label}
                </span>
                <button
                  type="button"
                  aria-label={`Delete event ${revenueEvent.label}`}
                  onClick={() => handleDelete(revenueEvent.id)}
                  className="rounded-lg p-1.5 text-neutral-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={handleAdd} className="mt-4 flex flex-wrap items-end gap-2 border-t border-neutral-100 pt-4">
        <div className="flex flex-col gap-1 text-xs text-neutral-500">
          <label htmlFor={`${formId}-day`}>Day</label>
          <select
            id={`${formId}-day`}
            value={fields.date}
            onChange={(event) => setFields({ ...fields, date: event.target.value })}
            className={INPUT_CLASS}
          >
            {days.map((day) => (
              <option key={day.date} value={day.date}>
                {day.weekday} {formatDayMonth(day.date)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 text-xs text-neutral-500">
          <label htmlFor={`${formId}-impact`}>Impact</label>
          <select
            id={`${formId}-impact`}
            value={fields.impact}
            onChange={(event) => {
              if (isImpact(event.target.value)) setFields({ ...fields, impact: event.target.value });
            }}
            className={INPUT_CLASS}
          >
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
          </select>
        </div>
        <div className="flex min-w-[180px] flex-1 flex-col gap-1 text-xs text-neutral-500">
          <label htmlFor={`${formId}-label`}>Label</label>
          <input
            id={`${formId}-label`}
            required
            maxLength={80}
            placeholder="e.g. Local festival"
            value={fields.label}
            onChange={(event) => setFields({ ...fields, label: event.target.value })}
            className={INPUT_CLASS}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
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
