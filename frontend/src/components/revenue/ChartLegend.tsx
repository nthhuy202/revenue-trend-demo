import { TrendingDown, TrendingUp } from "lucide-react";
import { COLORS, type Visible } from "./series";

// showPrev: compare mode AND the previous week has data (otherwise no previous bars are drawn).
type Props = { visible: Visible; compare: boolean; showPrev: boolean };

export default function ChartLegend({ visible, compare, showPrev }: Props) {
  const items = compare
    ? [
        visible.pos && { color: COLORS.pos, label: "POS Revenue (Current)" },
        visible.eatclub && { color: COLORS.eatclub, label: "Eatclub Revenue (Current)" },
        visible.labour && { color: COLORS.labour, label: "Labour Costs (Current)" },
        showPrev && visible.pos && { color: COLORS.prevPos, label: "Direct Revenue (Previous)" },
        showPrev && visible.eatclub && { color: COLORS.prevEatclub, label: "Total Revenue (Previous)" },
        showPrev && visible.labour && { color: COLORS.prevLabour, label: "Labour Costs (Previous)" },
      ]
    : [
        visible.pos && { color: COLORS.pos, label: "POS Revenue" },
        visible.eatclub && { color: COLORS.eatclub, label: "Eatclub Revenue" },
        visible.labour && { color: COLORS.labour, label: "Labour Costs" },
      ];

  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-neutral-700">
      {items.filter(Boolean).map((item) => {
        const { color, label } = item as { color: string; label: string };
        return (
          <li key={label} className="flex items-center gap-2">
            <span aria-hidden className="size-2.5 rounded-full" style={{ background: color }} />
            {label}
          </li>
        );
      })}
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
