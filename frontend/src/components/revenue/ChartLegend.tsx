import { TrendingDown, TrendingUp } from "lucide-react";
import { COLORS, getSeriesLabel, type ColorKey, type Visible } from "./series";

// shouldShowPrev: compare mode AND the previous week has data (otherwise no previous bars are drawn).
type ChartLegendProps = { visible: Visible; isComparing: boolean; shouldShowPrev: boolean };

type LegendItem = { key: ColorKey; isShown: boolean };

function getLegendItems(visible: Visible, isComparing: boolean, shouldShowPrev: boolean): LegendItem[] {
  const current: LegendItem[] = [
    { key: "pos", isShown: visible.pos },
    { key: "eatclub", isShown: visible.eatclub },
    { key: "labour", isShown: visible.labour },
  ];
  if (!isComparing) return current;

  return [
    ...current,
    { key: "prevPos", isShown: shouldShowPrev && visible.pos },
    { key: "prevEatclub", isShown: shouldShowPrev && visible.eatclub },
    { key: "prevLabour", isShown: shouldShowPrev && visible.labour },
  ];
}

export default function ChartLegend({ visible, isComparing, shouldShowPrev }: ChartLegendProps) {
  const items = getLegendItems(visible, isComparing, shouldShowPrev).filter((item) => item.isShown);

  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-neutral-700">
      {items.map(({ key }) => (
        <li key={key} className="flex items-center gap-2">
          <span aria-hidden className="size-2.5 rounded-full" style={{ background: COLORS[key] }} />
          {getSeriesLabel(key, isComparing)}
        </li>
      ))}
      <li aria-hidden className="hidden h-5 w-px bg-neutral-200 sm:block" />
      <li className="flex items-center gap-2">
        <TrendingUp className="size-3.5 text-green-600" strokeWidth={2.5} />
        Positive Event Impact
      </li>
      <li className="flex items-center gap-2">
        <TrendingDown className="size-3.5 text-red-600" strokeWidth={2.5} />
        Negative Event Impact
      </li>
    </ul>
  );
}
