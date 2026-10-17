const moneyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const formatMoney = (value: number) => moneyFormatter.format(value);

export const formatNumber = (value: number) => value.toLocaleString("en-US");

// 0 → "0k", 750 → "0.75k", 3000 → "3k"
export const formatK = (value: number) => `${Number((value / 1000).toFixed(2))}k`;

export const formatPct = (value: number | null) => (value === null ? "—" : `${value > 0 ? "+" : ""}${value.toFixed(1)}%`);

const dayMonthFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export const formatDayMonth = (date: string) => dayMonthFormatter.format(new Date(date));
