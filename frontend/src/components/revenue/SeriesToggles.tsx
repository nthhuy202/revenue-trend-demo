import { COLORS, SERIES, type SeriesKey, type Visible } from "./series";

type SeriesTogglesProps = { visible: Visible; onToggle: (key: SeriesKey) => void };

export default function SeriesToggles({ visible, onToggle }: SeriesTogglesProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {SERIES.map(({ key, label }) => (
        <label key={key} className="flex cursor-pointer select-none items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={visible[key]}
            onChange={() => onToggle(key)}
            className="size-4 cursor-pointer rounded accent-neutral-900"
          />
          <span aria-hidden className="h-0.5 w-3 rounded-full" style={{ background: COLORS[key] }} />
          {label}
        </label>
      ))}
    </div>
  );
}
