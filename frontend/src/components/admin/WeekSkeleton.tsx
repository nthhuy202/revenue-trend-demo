// Shaped like WeekEditor + EventsEditor, on white cards so it stands out from the page background.
const DAY_ROWS: number[] = [0, 1, 2, 3, 4, 5, 6];
const EVENT_ROWS: number[] = [0, 1];

export default function WeekSkeleton() {
  return (
    <div role="status" aria-label="Loading week" className="animate-pulse space-y-5">
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
        <div className="mb-4 h-5 w-28 rounded bg-neutral-200" />
        <div className="space-y-2.5">
          {DAY_ROWS.map((row) => (
            <div key={row} className="h-9 rounded-lg bg-neutral-100" />
          ))}
        </div>
        <div className="mt-4 h-9 w-28 rounded-lg bg-neutral-200" />
      </div>
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
        <div className="mb-4 h-5 w-16 rounded bg-neutral-200" />
        <div className="space-y-2.5">
          {EVENT_ROWS.map((row) => (
            <div key={row} className="h-7 rounded-lg bg-neutral-100" />
          ))}
        </div>
        <div className="mt-4 h-9 rounded-lg bg-neutral-100" />
      </div>
    </div>
  );
}
