import { TrendingDown, TrendingUp } from "lucide-react";
import type { RevenueEvent } from "@/lib/types";

type EventBadgeProps = { cx: number; cy: number; impact: RevenueEvent["impact"]; label: string };

const BADGE_RADIUS = 13;
const ICON_SIZE = 14;

// Drawn inside the Recharts SVG, so this is an SVG group rather than HTML.
export default function EventBadge({ cx, cy, impact, label }: EventBadgeProps) {
  const isPositive = impact === "positive";
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <g transform={`translate(${cx}, ${cy})`} style={{ cursor: "default" }}>
      <title>{`${isPositive ? "Positive" : "Negative"} event: ${label}`}</title>
      <circle
        r={BADGE_RADIUS}
        fill={isPositive ? "#ecfdf3" : "#fef2f2"}
        stroke={isPositive ? "#bbf7d0" : "#fecaca"}
        strokeWidth={1.5}
      />
      <Icon
        x={-ICON_SIZE / 2}
        y={-ICON_SIZE / 2}
        width={ICON_SIZE}
        height={ICON_SIZE}
        color={isPositive ? "#16a34a" : "#dc2626"}
        strokeWidth={2.5}
      />
    </g>
  );
}
