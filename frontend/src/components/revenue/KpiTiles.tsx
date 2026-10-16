import { formatMoney, formatNumber, formatPct } from "@/lib/format";
import type { RevenueTrendResponse } from "@/lib/types";

type Props = { summary: RevenueTrendResponse["summary"]; compare: boolean };

const TILES = [
  { key: "totalRevenue", label: "Total Revenue", format: formatMoney },
  { key: "avgPerDay", label: "Average per Day", format: formatMoney },
  { key: "totalCovers", label: "Total Covers", format: formatNumber },
] as const;

function changeColor(pct: number | null) {
  if (pct === null || pct === 0) return "text-neutral-500";
  return pct > 0 ? "text-green-600" : "text-red-600";
}

export default function KpiTiles({ summary, compare }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {TILES.map(({ key, label, format }) => {
        const pct = summary.changePct[key];
        return (
          <div key={key} className="rounded-xl bg-[#f6f2ef] px-3 py-3">
            <div className="text-sm text-neutral-800">{label}</div>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
              <span className="text-xl font-semibold text-neutral-900">{format(summary.current[key])}</span>
              {compare && (
                <span className="text-[13px] text-neutral-600">
                  vs {format(summary.previous[key])}{" "}
                  <span className={`font-semibold ${changeColor(pct)}`}>({formatPct(pct)})</span>
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
