import { getTagChipClasses } from "@/data/tags";

interface TagChipProps {
  label: string;
  /** Renders a removable "x" button when provided. */
  onRemove?: () => void;
}

export function TagChip({ label, onRemove }: TagChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getTagChipClasses(
        label,
      )}`}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label} filter`}
          className="-mr-0.5 ml-0.5 flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-white/20"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" className="h-2.5 w-2.5" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
    </span>
  );
}
