"use client";

import { useState } from "react";

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 p-8 font-sans dark:bg-black">
      <main className="w-full max-w-2xl rounded-2xl border border-black/[.08] bg-white p-10 dark:border-white/[.145] dark:bg-zinc-950">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          OpenHands Workshop
        </h1>
        <p className="mt-3 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Client-rendered Next.js / React scaffold with TypeScript and Tailwind
          CSS.
        </p>

        <div className="mt-8 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setCount((value) => value + 1)}
            className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Count is {count}
          </button>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Interactive client component
          </span>
        </div>
      </main>
    </div>
  );
}
