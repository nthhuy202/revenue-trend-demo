import { formatMoney, formatNumber, formatPct } from "@/lib/format";
import type { RevenueTrendResponse, Totals } from "@/lib/types";

type KpiTilesProps = { summary: RevenueTrendResponse["summary"]; isComparing: boolean };

type KpiTile = { key: keyof Totals; label: string; format: (value: number) => string };

const KPI_TILES: KpiTile[] = [
  { key: "totalRevenue", label: "Total Revenue", format: formatMoney },
  { key: "avgPerDay", label: "Average per Day", format: formatMoney },
  { key: "totalCovers", label: "Total Covers", format: formatNumber },
];

function getChangeColor(pct: number | null) {
  if (pct === null || pct === 0) return "text-neutral-500";

  return pct > 0 ? "text-green-600" : "text-red-600";
}

export default function KpiTiles({ summary, isComparing }: KpiTilesProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {KPI_TILES.map(({ key, label, format }) => {
        const pct = summary.changePct[key];

        return (
          <div key={key} className="rounded-xl bg-[#f6f2ef] px-3 py-3">
            <div className="text-sm text-neutral-800">{label}</div>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
              <span className="text-xl font-semibold text-neutral-900">{format(summary.current[key])}</span>
              {isComparing && (
                <span className="text-[13px] text-neutral-600">
                  vs {format(summary.previous[key])}{" "}
                  <span className={`font-semibold ${getChangeColor(pct)}`}>({formatPct(pct)})</span>
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
