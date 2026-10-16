export const COLORS = {
  pos: "#2b2b2b",
  eatclub: "#5b57f0",
  labour: "#ec6430",
  prevPos: "#bdbdbd",
  prevEatclub: "#c9c8f5",
  prevLabour: "#f6cdbb",
} as const;

export type SeriesKey = "pos" | "eatclub" | "labour";

export type Visible = Record<SeriesKey, boolean>;

export const SERIES: { key: SeriesKey; label: string }[] = [
  { key: "pos", label: "POS Revenue" },
  { key: "eatclub", label: "Eatclub Revenue" },
  { key: "labour", label: "Labour Costs" },
];
