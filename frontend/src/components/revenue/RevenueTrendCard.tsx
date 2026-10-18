"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { BarChart3, Download } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { formatDayMonth } from "@/lib/format";
import type { RevenueTrendResponse } from "@/lib/types";
import { getCurrentIsoWeek } from "@/lib/week";
import ChartLegend from "./ChartLegend";
import ChartSkeleton from "./ChartSkeleton";
import KpiTiles from "./KpiTiles";
import SeriesToggles from "./SeriesToggles";
import type { SeriesKey, Visible } from "./series";

// Recharts is the heaviest dependency; keep it out of the initial bundle.
const loadTrendChart = () => import("./TrendChart");
const TrendChart = dynamic(loadTrendChart, { ssr: false, loading: ChartSkeleton });

type RevenueTrendCardProps = { week?: string };

const EXPORT_PIXEL_RATIO = 2;
const SKELETON_TILES = [0, 1, 2];

function getCompareButtonClass(isComparing: boolean) {
  const base = "flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors";

  if (isComparing) return `${base} bg-neutral-900 text-white hover:bg-neutral-700`;

  return `${base} bg-[#f7c948] text-neutral-900 hover:bg-[#f2bd2c]`;
}

export default function RevenueTrendCard({ week }: RevenueTrendCardProps) {
  const [data, setData] = useState<RevenueTrendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [visible, setVisible] = useState<Visible>({ pos: true, eatclub: true, labour: true });
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const loadTrend = useCallback(() => {
    setError(null);
    setData(null);
    api<RevenueTrendResponse>(`/api/revenue-trend${week ? `?week=${week}` : ""}`)
      .then(setData)
      .catch((loadError: unknown) => setError(getErrorMessage(loadError)));
  }, [week]);

  useEffect(loadTrend, [loadTrend]);

  // Start downloading the chart chunk alongside the data request instead of after it arrives.
  useEffect(() => {
    loadTrendChart();
  }, []);

  const toggleSeries = (key: SeriesKey) => setVisible((current) => ({ ...current, [key]: !current[key] }));

  async function handleExportPng() {
    if (!cardRef.current || !data) return;

    setIsExporting(true);
    setExportError(null);

    try {
      // Only needed on click, so it is not part of the page bundle.
      const { toPng } = await import("html-to-image");
      const imageUrl = await toPng(cardRef.current, {
        pixelRatio: EXPORT_PIXEL_RATIO,
        backgroundColor: "#ffffff",
        filter: (node) => !(node instanceof HTMLElement && node.dataset.exportIgnore !== undefined),
      });
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `revenue-trend-${data.week}.png`;
      link.click();
    } catch (pngError) {
      setExportError(`Could not export PNG: ${getErrorMessage(pngError)}`);
    } finally {
      setIsExporting(false);
    }
  }

  const isCurrentWeek = !data || data.week === getCurrentIsoWeek();
  const baseTitle = isCurrentWeek
    ? "This Week's Revenue Trend"
    : `Revenue Trend ${formatDayMonth(data.current.days[0].date)} – ${formatDayMonth(data.current.days[6].date)}`;
  const shouldShowPrev = isComparing && !!data?.previous.days.some((day) => day.hasData);

  return (
    <section ref={cardRef} className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <h1 className="max-w-[320px] text-xl leading-snug font-medium text-neutral-900">
          {baseTitle}
          {isComparing && " vs Previous Period"}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <SeriesToggles visible={visible} onToggle={toggleSeries} />
          <div className="flex flex-wrap items-center gap-3" data-export-ignore>
            <button
              type="button"
              aria-pressed={isComparing}
              onClick={() => setIsComparing((wasComparing) => !wasComparing)}
              className={getCompareButtonClass(isComparing)}
            >
              <BarChart3 className="size-4" />
              Compare to Previous
            </button>
            <button
              type="button"
              onClick={handleExportPng}
              disabled={!data || isExporting}
              className="flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm font-medium text-neutral-800 hover:bg-neutral-100 disabled:opacity-50"
            >
              <Download className="size-4" />
              {isExporting ? "Exporting…" : "Export PNG"}
            </button>
          </div>
        </div>
      </header>

      {exportError && (
        <p role="alert" className="mt-3 text-sm text-red-700" data-export-ignore>
          {exportError}
        </p>
      )}

      {error && (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl bg-red-50 px-4 py-10 text-center text-sm text-red-700">
          Could not load revenue data: {error}
          <button type="button" onClick={loadTrend} className="rounded-lg bg-white px-3 py-1.5 font-medium text-neutral-800 shadow-sm">
            Try again
          </button>
        </div>
      )}

      {!error && !data && (
        <div role="status" aria-label="Loading revenue data" className="mt-8 space-y-6">
          <div className="grid animate-pulse grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {SKELETON_TILES.map((tile) => (
              <div key={tile} className="h-[74px] rounded-xl bg-neutral-100" />
            ))}
          </div>
          <ChartSkeleton />
        </div>
      )}

      {data && (
        <>
          <div className="mt-8 sm:mt-12">
            <KpiTiles summary={data.summary} isComparing={isComparing} />
          </div>
          <div className="mt-2">
            <TrendChart data={data} visible={visible} isComparing={isComparing} />
          </div>
          <div className="mt-6">
            <ChartLegend visible={visible} isComparing={isComparing} shouldShowPrev={shouldShowPrev} />
          </div>
        </>
      )}
    </section>
  );
}
