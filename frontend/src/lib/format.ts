const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const formatMoney = (n: number) => money.format(n);

export const formatNumber = (n: number) => n.toLocaleString("en-US");

// 0 → "0k", 750 → "0.75k", 3000 → "3k"
export const formatK = (n: number) => `${Number((n / 1000).toFixed(2))}k`;

export const formatPct = (n: number | null) => (n === null ? "—" : `${n > 0 ? "+" : ""}${n.toFixed(1)}%`);

const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export const formatDayMonth = (date: string) => dayMonth.format(new Date(date));
