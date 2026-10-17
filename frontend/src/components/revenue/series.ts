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

export const SERIES: SeriesOption[] = [
  { key: "pos", label: "POS Revenue" },
  { key: "eatclub", label: "Eatclub Revenue" },
  { key: "labour", label: "Labour Costs" },
];
