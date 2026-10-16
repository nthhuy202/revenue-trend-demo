"use client";

import { Bar, BarChart, CartesianGrid, ReferenceDot, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatK } from "@/lib/format";
import type { RevenueTrendResponse } from "@/lib/types";
import { COLORS, type Visible } from "./series";

type Props = { data: RevenueTrendResponse; visible: Visible; compare: boolean };

const R = 4;
type Radius = [number, number, number, number];
const FULL: Radius = [R, R, R, R];
const TOP: Radius = [R, R, 0, 0];
const BOTTOM: Radius = [0, 0, R, R];

// Ticks like the reference: 4 equal steps rounded up to a multiple of 250 (0, 0.75k … 3k).
function niceTicks(max: number) {
  const step = Math.max(250, Math.ceil(max / 4 / 250) * 250);
  return [0, 1, 2, 3, 4].map((i) => i * step);
}

export default function TrendChart({ data, visible, compare }: Props) {
  const showPrev = compare && data.previous.days.some((d) => d.hasData);

  const rows = data.current.days.map((d, i) => {
    const p = data.previous.days[i];
    return {
      day: d.weekday,
      pos: d.posRevenue,
      eatclub: d.eatclubRevenue,
      labour: d.labourCosts,
      prevPos: p.posRevenue,
      prevEatclub: p.eatclubRevenue,
      prevLabour: p.labourCosts,
    };
  });

  // Every bar gets a stackId so Recharts keeps declaration order: current, labour, previous, previous labour.
  // Height of the tallest visible bar per day — used for the axis and for placing event badges.
  const dayMax = rows.map((r) =>
    Math.max(
      (visible.pos ? r.pos : 0) + (visible.eatclub ? r.eatclub : 0),
      visible.labour ? r.labour : 0,
      showPrev ? (visible.pos ? r.prevPos : 0) + (visible.eatclub ? r.prevEatclub : 0) : 0,
      showPrev && visible.labour ? r.prevLabour : 0,
    ),
  );
  const ticks = niceTicks(Math.max(...dayMax, 1));

  const posRadius = visible.eatclub ? BOTTOM : FULL;
  const eatclubRadius = visible.pos ? TOP : FULL;

  // Several events on one day stack upwards.
  const badges = data.events.map((e) => {
    const index = data.current.days.findIndex((d) => d.date === e.date);
    const sameDayBefore = data.events.filter((o) => o.date === e.date && o.id < e.id).length;
    return { ...e, index, offset: sameDayBefore };
  });

  return (
    <>
    <p className="mb-1 text-right text-xs text-neutral-400 sm:hidden">Swipe to see all days →</p>
    <div className="-mx-1 overflow-x-auto px-1">
      <div className="h-[320px] min-w-[640px]">
        <ResponsiveContainer width="100%" height="100%">
          {/* Remount when the set of bars changes: Recharts stacks in registration order, so a re-added
              series would otherwise land on top of its stack. */}
          <BarChart
            key={`${visible.pos}-${visible.eatclub}-${visible.labour}-${showPrev}`}
            data={rows} margin={{ top: 48, right: 8, bottom: 0, left: -8 }} barCategoryGap="20%" barGap={4}>
            <CartesianGrid stroke="#e7e5e4" strokeDasharray="4 4" />
            <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: "#e7e5e4" }} tick={{ fontSize: 13, fill: "#404040" }} />
            <YAxis
              ticks={ticks}
              domain={[0, ticks[4]]}
              tickFormatter={formatK}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 13, fill: "#404040" }}
            />

            {visible.pos && <Bar dataKey="pos" stackId="cur" fill={COLORS.pos} radius={posRadius} maxBarSize={56} animationDuration={400} />}
            {visible.eatclub && <Bar dataKey="eatclub" stackId="cur" fill={COLORS.eatclub} radius={eatclubRadius} maxBarSize={56} animationDuration={400} />}
            {visible.labour && <Bar dataKey="labour" stackId="labour" fill={COLORS.labour} radius={FULL} maxBarSize={56} animationDuration={400} />}

            {showPrev && visible.pos && <Bar dataKey="prevPos" stackId="prev" fill={COLORS.prevPos} radius={posRadius} maxBarSize={56} animationDuration={400} />}
            {showPrev && visible.eatclub && (
              <Bar dataKey="prevEatclub" stackId="prev" fill={COLORS.prevEatclub} radius={eatclubRadius} maxBarSize={56} animationDuration={400} />
            )}
            {showPrev && visible.labour && <Bar dataKey="prevLabour" stackId="prevLabour" fill={COLORS.prevLabour} radius={FULL} maxBarSize={56} animationDuration={400} />}

            {badges
              .filter((b) => b.index >= 0)
              .map((b) => (
                <ReferenceDot
                  key={b.id}
                  x={rows[b.index].day}
                  y={dayMax[b.index]}
                  ifOverflow="visible"
                  shape={({ cx, cy }: { cx?: number; cy?: number }) => (
                    <EventBadge cx={cx ?? 0} cy={(cy ?? 0) - 26 - b.offset * 30} impact={b.impact} label={b.label} />
                  )}
                />
              ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    </>
  );
}

function EventBadge({ cx, cy, impact, label }: { cx: number; cy: number; impact: "positive" | "negative"; label: string }) {
  const positive = impact === "positive";
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <g transform={`translate(${cx}, ${cy})`} style={{ cursor: "default" }}>
      <title>{`${positive ? "Positive" : "Negative"} event: ${label}`}</title>
      <circle r={13} fill={positive ? "#ecfdf3" : "#fef2f2"} stroke={positive ? "#bbf7d0" : "#fecaca"} strokeWidth={1.5} />
      <Icon x={-7} y={-7} width={14} height={14} color={positive ? "#16a34a" : "#dc2626"} strokeWidth={2.5} />
    </g>
  );
}
