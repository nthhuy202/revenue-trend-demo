"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatK } from "@/lib/format";
import type { RevenueTrendResponse } from "@/lib/types";
import ChartTooltip from "./ChartTooltip";
import EventBadge from "./EventBadge";
import { COLORS, type ColorKey, type Visible } from "./series";

type TrendChartProps = { data: RevenueTrendResponse; visible: Visible; isComparing: boolean };

type Radius = [number, number, number, number];

type ReferenceDotShapeProps = { cx?: number; cy?: number };

type StackId = "cur" | "labour" | "prev" | "prevLabour";

// The tooltip lists only the series of the column under the mouse, not every bar of the day.
const STACK_KEYS: Record<StackId, ColorKey[]> = {
  cur: ["pos", "eatclub"],
  labour: ["labour"],
  prev: ["prevPos", "prevEatclub"],
  prevLabour: ["prevLabour"],
};

const BAR_RADIUS = 4;
const FULL: Radius = [BAR_RADIUS, BAR_RADIUS, BAR_RADIUS, BAR_RADIUS];
const TOP: Radius = [BAR_RADIUS, BAR_RADIUS, 0, 0];
const BOTTOM: Radius = [0, 0, BAR_RADIUS, BAR_RADIUS];
const MAX_BAR_SIZE = 56;
const ANIMATION_MS = 400;
const TICK_COUNT = 4;
const TICK_STEP = 250;
// Badge sits above the tallest bar; extra events on the same day stack upwards.
const BADGE_LIFT = 26;
const BADGE_STACK_GAP = 30;
const AXIS_TICK = { fontSize: 13, fill: "#404040" };
const GRID_COLOR = "#e7e5e4";

// Ticks like the reference: 4 equal steps rounded up to a multiple of 250 (0, 0.75k … 3k).
function buildTicks(max: number) {
  const step = Math.max(TICK_STEP, Math.ceil(max / TICK_COUNT / TICK_STEP) * TICK_STEP);

  return [0, 1, 2, 3, 4].map((index) => index * step);
}

export default function TrendChart({ data, visible, isComparing }: TrendChartProps) {
  const [hoveredStack, setHoveredStack] = useState<StackId | null>(null);
  const shouldShowPrev = isComparing && data.previous.days.some((day) => day.hasData);
  const hasData = data.current.days.some((day) => day.hasData);

  const rows = data.current.days.map((day, index) => {
    const previousDay = data.previous.days[index];

    return {
      day: day.weekday,
      pos: day.posRevenue,
      eatclub: day.eatclubRevenue,
      labour: day.labourCosts,
      prevPos: previousDay.posRevenue,
      prevEatclub: previousDay.eatclubRevenue,
      prevLabour: previousDay.labourCosts,
    };
  });

  // Every bar gets a stackId so Recharts keeps declaration order: current, labour, previous, previous labour.
  // Height of the tallest visible bar per day — used for the axis and for placing event badges.
  const dayMax = rows.map((row) =>
    Math.max(
      (visible.pos ? row.pos : 0) + (visible.eatclub ? row.eatclub : 0),
      visible.labour ? row.labour : 0,
      shouldShowPrev ? (visible.pos ? row.prevPos : 0) + (visible.eatclub ? row.prevEatclub : 0) : 0,
      shouldShowPrev && visible.labour ? row.prevLabour : 0,
    ),
  );
  const ticks = buildTicks(Math.max(...dayMax, 1));

  const posRadius = visible.eatclub ? BOTTOM : FULL;
  const eatclubRadius = visible.pos ? TOP : FULL;

  const badges = data.events
    .map((event) => {
      const index = data.current.days.findIndex((day) => day.date === event.date);
      const sameDayBefore = data.events.filter((other) => other.date === event.date && other.id < event.id).length;

      return { ...event, index, offset: sameDayBefore };
    })
    .filter((badge) => badge.index >= 0);

  const getHoverHandlers = (stack: StackId) => ({
    onMouseEnter: () => setHoveredStack(stack),
    onMouseLeave: () => setHoveredStack(null),
  });

  return (
    <>
      <p className="mb-1 text-right text-xs text-neutral-400 sm:hidden">Swipe to see all days →</p>
      <div className="-mx-1 overflow-x-auto px-1">
        <div className="relative h-[320px] min-w-[640px]">
          {!hasData && (
            <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-neutral-500">
              No data for this week yet
            </p>
          )}
          <ResponsiveContainer width="100%" height="100%">
            {/* Remount when the set of bars changes: Recharts stacks in registration order, so a re-added
                series would otherwise land on top of its stack. */}
            <BarChart
              key={`${visible.pos}-${visible.eatclub}-${visible.labour}-${shouldShowPrev}`}
              data={rows}
              margin={{ top: 48, right: 8, bottom: 0, left: -8 }}
              barCategoryGap="20%"
              barGap={4}
            >
              <CartesianGrid stroke={GRID_COLOR} strokeDasharray="4 4" />
              <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: GRID_COLOR }} tick={AXIS_TICK} />
              <YAxis
                ticks={ticks}
                domain={[0, ticks[TICK_COUNT]]}
                tickFormatter={formatK}
                tickLine={false}
                axisLine={false}
                tick={AXIS_TICK}
              />
              <Tooltip
                cursor={false}
                isAnimationActive={false}
                content={(props) => (
                  <ChartTooltip {...props} keys={hoveredStack ? STACK_KEYS[hoveredStack] : []} isComparing={isComparing} />
                )}
              />

              {visible.pos && (
                <Bar dataKey="pos" stackId="cur" fill={COLORS.pos} radius={posRadius} maxBarSize={MAX_BAR_SIZE} animationDuration={ANIMATION_MS} {...getHoverHandlers("cur")} />
              )}
              {visible.eatclub && (
                <Bar dataKey="eatclub" stackId="cur" fill={COLORS.eatclub} radius={eatclubRadius} maxBarSize={MAX_BAR_SIZE} animationDuration={ANIMATION_MS} {...getHoverHandlers("cur")} />
              )}
              {visible.labour && (
                <Bar dataKey="labour" stackId="labour" fill={COLORS.labour} radius={FULL} maxBarSize={MAX_BAR_SIZE} animationDuration={ANIMATION_MS} {...getHoverHandlers("labour")} />
              )}

              {shouldShowPrev && visible.pos && (
                <Bar dataKey="prevPos" stackId="prev" fill={COLORS.prevPos} radius={posRadius} maxBarSize={MAX_BAR_SIZE} animationDuration={ANIMATION_MS} {...getHoverHandlers("prev")} />
              )}
              {shouldShowPrev && visible.eatclub && (
                <Bar dataKey="prevEatclub" stackId="prev" fill={COLORS.prevEatclub} radius={eatclubRadius} maxBarSize={MAX_BAR_SIZE} animationDuration={ANIMATION_MS} {...getHoverHandlers("prev")} />
              )}
              {shouldShowPrev && visible.labour && (
                <Bar dataKey="prevLabour" stackId="prevLabour" fill={COLORS.prevLabour} radius={FULL} maxBarSize={MAX_BAR_SIZE} animationDuration={ANIMATION_MS} {...getHoverHandlers("prevLabour")} />
              )}

              {badges.map((badge) => (
                <ReferenceDot
                  key={badge.id}
                  x={rows[badge.index].day}
                  y={dayMax[badge.index]}
                  ifOverflow="visible"
                  shape={({ cx, cy }: ReferenceDotShapeProps) => (
                    <EventBadge
                      cx={cx ?? 0}
                      cy={(cy ?? 0) - BADGE_LIFT - badge.offset * BADGE_STACK_GAP}
                      impact={badge.impact}
                      label={badge.label}
                    />
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
