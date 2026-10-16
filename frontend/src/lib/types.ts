export type Day = {
  date: string;
  weekday: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  posRevenue: number;
  eatclubRevenue: number;
  labourCosts: number;
  covers: number;
  hasData: boolean;
};

export type RevenueEvent = { id: number; date: string; impact: "positive" | "negative"; label: string };

export type Totals = { totalRevenue: number; avgPerDay: number; totalCovers: number };

export type RevenueTrendResponse = {
  week: string;
  current: { week: string; days: Day[] };
  previous: { week: string; days: Day[] };
  events: RevenueEvent[];
  summary: {
    current: Totals;
    previous: Totals;
    changePct: { [K in keyof Totals]: number | null };
  };
};

export type AdminWeek = { week: string; days: Day[]; events: RevenueEvent[] };
