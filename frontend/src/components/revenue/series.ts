export type SeriesKey = "pos" | "eatclub" | "labour";

export type ColorKey = SeriesKey | "prevPos" | "prevEatclub" | "prevLabour";

export type Visible = Record<SeriesKey, boolean>;

export type SeriesOption = { key: SeriesKey; label: string };

export const COLORS: Record<ColorKey, string> = {
  pos: "#2b2b2b",
  eatclub: "#5b57f0",
  labour: "#ec6430",
  prevPos: "#bdbdbd",
  prevEatclub: "#c9c8f5",
  prevLabour: "#f6cdbb",
};

const LABELS: Record<ColorKey, string> = {
  pos: "POS Revenue",
  eatclub: "Eatclub Revenue",
  labour: "Labour Costs",
  prevPos: "Direct Revenue (Previous)",
  prevEatclub: "Total Revenue (Previous)",
  prevLabour: "Labour Costs (Previous)",
};

export const SERIES: SeriesOption[] = [
  { key: "pos", label: LABELS.pos },
  { key: "eatclub", label: LABELS.eatclub },
  { key: "labour", label: LABELS.labour },
];

const isSeriesKey = (key: ColorKey): key is SeriesKey => SERIES.some((series) => series.key === key);

// In compare mode current-week series get a "(Current)" suffix to tell them apart from the previous week.
export const getSeriesLabel = (key: ColorKey, isComparing: boolean) =>
  isComparing && isSeriesKey(key) ? `${LABELS[key]} (Current)` : LABELS[key];
