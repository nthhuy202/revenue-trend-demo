// Same height as the chart so the card does not jump when Recharts finishes loading.
export default function ChartSkeleton() {
  return <div aria-hidden className="h-[320px] animate-pulse rounded-xl bg-neutral-100" />;
}
