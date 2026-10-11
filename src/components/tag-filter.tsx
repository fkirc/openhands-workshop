"use client";

import { useEffect, useRef, useState } from "react";
import { TAGS } from "@/data/tags";
import { TagChip } from "./tag-chip";

interface TagFilterProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export function TagFilter({ selected, onChange }: TagFilterProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  function toggleTag(name: string) {
    onChange(
      selected.includes(name)
        ? selected.filter((tag) => tag !== name)
        : [...selected, name],
    );
  }

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-md">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/15 bg-zinc-900/70 px-4 py-2.5 text-left text-sm text-white shadow-lg ring-1 ring-white/5 backdrop-blur-md transition-colors hover:border-white/30"
      >
        <span className={selected.length ? "text-white" : "text-zinc-400"}>
          {selected.length
            ? `${selected.length} tag${selected.length > 1 ? "s" : ""} selected`
            : "Filter by tags"}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-white/15 bg-zinc-900/95 p-1.5 shadow-2xl shadow-black/50 ring-1 ring-white/5 backdrop-blur-md"
        >
          {TAGS.map((tag) => {
            const active = selected.includes(tag.name);
            return (
              <li key={tag.name}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => toggleTag(tag.name)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-200 transition-colors hover:bg-white/10"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full border ${tag.chip}`}
                      aria-hidden="true"
                    />
                    {tag.name}
                  </span>
                  {active && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selected.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {selected.map((name) => (
            <TagChip key={name} label={name} onRemove={() => toggleTag(name)} />
          ))}
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-zinc-400 underline-offset-2 transition-colors hover:text-zinc-200 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
