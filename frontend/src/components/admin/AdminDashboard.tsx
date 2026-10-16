"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatDayMonth } from "@/lib/format";
import type { AdminWeek } from "@/lib/types";
import { currentIsoWeek, shiftWeek } from "@/lib/week";
import EventsEditor from "./EventsEditor";
import WeekEditor from "./WeekEditor";

export default function AdminDashboard({ week: weekParam }: { week?: string }) {
  const router = useRouter();
  const week = weekParam ?? currentIsoWeek();
  const [email, setEmail] = useState<string | null>(null);
  const [data, setData] = useState<AdminWeek | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onAuthError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) router.replace("/admin/login");
      else setError((err as Error).message);
    },
    [router],
  );

  useEffect(() => {
    api<{ email: string }>("/api/auth/me").then((me) => setEmail(me.email), onAuthError);
  }, [onAuthError]);

  // Drop responses for a week the admin has already navigated away from (slow request + quick clicks).
  const viewedWeek = useRef(week);
  viewedWeek.current = week;
  const load = useCallback(() => {
    setError(null);
    api<AdminWeek>(`/api/admin/weeks/${week}`).then((res) => {
      if (res.week === viewedWeek.current) setData(res);
    }, onAuthError);
  }, [week, onAuthError]);

  useEffect(load, [load]);

  // Only show data that belongs to the week in the URL; editors copy it into local state on mount.
  const current = data?.week === week ? data : null;

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const goTo = (w: string) => {
    setData(null);
    router.push(`/admin?week=${w}`);
  };

  const range = current ? `${formatDayMonth(current.days[0].date)} – ${formatDayMonth(current.days[6].date)}` : "…";

  return (
    <main className="mx-auto max-w-[960px] space-y-5 px-4 py-6 sm:px-5 sm:py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium">Revenue data admin</h1>
          {email && <p className="text-sm text-neutral-500">Signed in as {email}</p>}
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
        >
          <LogOut className="size-4" /> Log out
        </button>
      </header>

      <nav className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous week"
            onClick={() => goTo(shiftWeek(week, -1))}
            className="rounded-lg border border-neutral-200 p-1.5 hover:bg-neutral-50"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="min-w-[180px] text-center text-sm">
            <span className="font-medium">{week}</span> <span className="text-neutral-500">({range})</span>
          </div>
          <button
            type="button"
            aria-label="Next week"
            onClick={() => goTo(shiftWeek(week, 1))}
            className="rounded-lg border border-neutral-200 p-1.5 hover:bg-neutral-50"
          >
            <ChevronRight className="size-4" />
          </button>
          {week !== currentIsoWeek() && (
            <button type="button" onClick={() => goTo(currentIsoWeek())} className="text-sm text-neutral-600 underline">
              This week
            </button>
          )}
        </div>
        <Link href={`/?week=${week}`} className="text-sm font-medium text-[#5b57f0] hover:underline">
          View chart for this week →
        </Link>
      </nav>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {current ? (
        <>
          <WeekEditor key={`days-${current.week}`} week={current.week} days={current.days} onSaved={setData} />
          <EventsEditor key={`events-${current.week}`} days={current.days} events={current.events} onChanged={load} />
        </>
      ) : (
        !error && <div className="h-64 animate-pulse rounded-2xl bg-neutral-100" aria-label="Loading" />
      )}
    </main>
  );
}
