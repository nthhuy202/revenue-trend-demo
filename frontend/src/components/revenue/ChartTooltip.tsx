import type { TooltipContentProps } from "recharts";
import { formatK } from "@/lib/format";
import { COLORS, getSeriesLabel, type ColorKey } from "./series";

// keys: the series of the hovered column (both segments for a stacked revenue column); empty when no bar is hovered.
type ChartTooltipProps = Pick<TooltipContentProps<number, string>, "active" | "payload" | "label"> & {
  keys: ColorKey[];
  isComparing: boolean;
};

type TooltipRow = { key: ColorKey; value: number };

function getTooltipRows(payload: ChartTooltipProps["payload"], keys: ColorKey[]): TooltipRow[] {
  return keys.flatMap((key) => {
    const entry = payload.find((item) => item.dataKey === key);

    return typeof entry?.value === "number" ? [{ key, value: entry.value }] : [];
  });
}

export default function ChartTooltip({ active, payload, label, keys, isComparing }: ChartTooltipProps) {
  const rows = getTooltipRows(payload, keys);
  if (!active || rows.length === 0) return null;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm shadow-md">
      <p className="mb-1 text-xs text-neutral-500">{label}</p>
      <ul className="space-y-0.5">
        {rows.map(({ key, value }) => (
          <li key={key} className="flex items-center gap-2 whitespace-nowrap">
            <span aria-hidden className="size-2.5 rounded-full" style={{ background: COLORS[key] }} />
            {getSeriesLabel(key, isComparing)}: <span className="font-medium tabular-nums">{formatK(value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
