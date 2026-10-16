"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { BarChart3, Download } from "lucide-react";
import { api } from "@/lib/api";
import { formatDayMonth } from "@/lib/format";
import type { RevenueTrendResponse } from "@/lib/types";
import { currentIsoWeek } from "@/lib/week";
import ChartLegend from "./ChartLegend";
import KpiTiles from "./KpiTiles";
import SeriesToggles from "./SeriesToggles";
import TrendChart from "./TrendChart";
import type { SeriesKey, Visible } from "./series";

type Props = { week?: string };

export default function RevenueTrendCard({ week }: Props) {
  const [data, setData] = useState<RevenueTrendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [compare, setCompare] = useState(false);
  const [visible, setVisible] = useState<Visible>({ pos: true, eatclub: true, labour: true });
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    setError(null);
    setData(null);
    api<RevenueTrendResponse>(`/api/revenue-trend${week ? `?week=${week}` : ""}`)
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, [week]);

  useEffect(load, [load]);

  const toggle = (key: SeriesKey) => setVisible((v) => ({ ...v, [key]: !v[key] }));

  async function exportPng() {
    if (!cardRef.current || !data) return;
    setExporting(true);
    try {
      const url = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        filter: (node) => !(node instanceof HTMLElement && node.dataset.exportIgnore !== undefined),
      });
      const a = document.createElement("a");
      a.href = url;
      a.download = `revenue-trend-${data.week}.png`;
      a.click();
    } finally {
      setExporting(false);
    }
  }

  const isCurrentWeek = !data || data.week === currentIsoWeek();
  const baseTitle = isCurrentWeek
    ? "This Week's Revenue Trend"
    : `Revenue Trend ${formatDayMonth(data.current.days[0].date)} – ${formatDayMonth(data.current.days[6].date)}`;

  return (
    <section ref={cardRef} className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <h1 className="max-w-[320px] text-xl leading-snug font-medium text-neutral-900">
          {baseTitle}
          {compare && " vs Previous Period"}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <SeriesToggles visible={visible} onToggle={toggle} />
          <div className="flex flex-wrap items-center gap-3" data-export-ignore>
            <button
              type="button"
              aria-pressed={compare}
              onClick={() => setCompare((c) => !c)}
              className={`flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors ${
                compare ? "bg-neutral-900 text-white hover:bg-neutral-700" : "bg-[#f7c948] text-neutral-900 hover:bg-[#f2bd2c]"
              }`}
            >
              <BarChart3 className="size-4" />
              Compare to Previous
            </button>
            <button
              type="button"
              onClick={exportPng}
              disabled={!data || exporting}
              className="flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm font-medium text-neutral-800 hover:bg-neutral-100 disabled:opacity-50"
            >
              <Download className="size-4" />
              {exporting ? "Exporting…" : "Export PNG"}
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl bg-red-50 px-4 py-10 text-center text-sm text-red-700">
          Could not load revenue data: {error}
          <button type="button" onClick={load} className="rounded-lg bg-white px-3 py-1.5 font-medium text-neutral-800 shadow-sm">
            Try again
          </button>
        </div>
      )}

      {!error && !data && (
        <div className="mt-8 animate-pulse space-y-6" aria-label="Loading">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[74px] rounded-xl bg-neutral-100" />
            ))}
          </div>
          <div className="h-[320px] rounded-xl bg-neutral-100" />
        </div>
      )}

      {data && (
        <>
          <div className="mt-8 sm:mt-12">
            <KpiTiles summary={data.summary} compare={compare} />
          </div>
          <div className="mt-2">
            <TrendChart data={data} visible={visible} compare={compare} />
          </div>
          <div className="mt-6">
            <ChartLegend
              visible={visible}
              compare={compare}
              showPrev={compare && data.previous.days.some((d) => d.hasData)}
            />
          </div>
        </>
      )}
    </section>
  );
}
