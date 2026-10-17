import { TrendingDown, TrendingUp } from "lucide-react";
import { COLORS, type Visible } from "./series";

// shouldShowPrev: compare mode AND the previous week has data (otherwise no previous bars are drawn).
type ChartLegendProps = { visible: Visible; isComparing: boolean; shouldShowPrev: boolean };

type LegendItem = { color: string; label: string; isShown: boolean };

function getLegendItems(visible: Visible, isComparing: boolean, shouldShowPrev: boolean): LegendItem[] {
  if (!isComparing) {
    return [
      { color: COLORS.pos, label: "POS Revenue", isShown: visible.pos },
      { color: COLORS.eatclub, label: "Eatclub Revenue", isShown: visible.eatclub },
      { color: COLORS.labour, label: "Labour Costs", isShown: visible.labour },
    ];
  }

  return [
    { color: COLORS.pos, label: "POS Revenue (Current)", isShown: visible.pos },
    { color: COLORS.eatclub, label: "Eatclub Revenue (Current)", isShown: visible.eatclub },
    { color: COLORS.labour, label: "Labour Costs (Current)", isShown: visible.labour },
    { color: COLORS.prevPos, label: "Direct Revenue (Previous)", isShown: shouldShowPrev && visible.pos },
    { color: COLORS.prevEatclub, label: "Total Revenue (Previous)", isShown: shouldShowPrev && visible.eatclub },
    { color: COLORS.prevLabour, label: "Labour Costs (Previous)", isShown: shouldShowPrev && visible.labour },
  ];
}

export default function ChartLegend({ visible, isComparing, shouldShowPrev }: ChartLegendProps) {
  const items = getLegendItems(visible, isComparing, shouldShowPrev).filter((item) => item.isShown);

  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-neutral-700">
      {items.map(({ color, label }) => (
        <li key={label} className="flex items-center gap-2">
          <span aria-hidden className="size-2.5 rounded-full" style={{ background: color }} />
          {label}
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
