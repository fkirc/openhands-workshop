import type { ReactNode } from "react";

type OldManProp = "none" | "spray" | "cloth";

/** Comic grandpa: bald, bushy white moustache, brown coat, walking stick. */
export function OldMan({
  mask = false,
  prop = "none",
}: {
  mask?: boolean;
  prop?: OldManProp;
}) {
  return (
    <svg
      viewBox="0 0 200 280"
      className="h-full w-full"
      role="img"
      aria-label={mask ? "Old man in a black robbery mask" : "Old man"}
    >
      <ellipse cx="100" cy="270" rx="54" ry="9" fill="rgba(0,0,0,0.35)" />

      {/* walking stick */}
      <path d="M50 104 q-16 6 -16 24 v122" stroke="#8a5a2b" strokeWidth="8" strokeLinecap="round" fill="none" />

      {/* legs + shoes */}
      <g stroke="#3a3f4b" strokeWidth="17" strokeLinecap="round">
        <path d="M87 212 v36" />
        <path d="M113 212 v36" />
      </g>
      <g fill="#1f2229">
        <rect x="66" y="244" width="36" height="15" rx="7" />
        <rect x="98" y="244" width="36" height="15" rx="7" />
      </g>

      {/* coat */}
      <path d="M64 122 q36 -22 72 0 l9 94 q-45 18 -90 0 Z" fill="#6d4c41" />
      <path d="M100 122 v94" stroke="#4e342e" strokeWidth="3" />
      <path d="M90 122 h20 l-10 20 Z" fill="#f5f0e6" />

      {/* arms */}
      <path d="M72 134 q-22 10 -34 24" stroke="#6d4c41" strokeWidth="18" fill="none" strokeLinecap="round" />
      <path d="M128 134 q22 22 28 50" stroke="#6d4c41" strokeWidth="18" fill="none" strokeLinecap="round" />
      <circle cx="36" cy="160" r="11" fill="#f0c9a6" />
      <circle cx="158" cy="186" r="11" fill="#f0c9a6" />

      {/* head */}
      <circle cx="100" cy="80" r="42" fill="#f0c9a6" />
      <circle cx="58" cy="82" r="8" fill="#e3b892" />
      <circle cx="142" cy="82" r="8" fill="#e3b892" />
      <path d="M59 68 q8 -34 41 -34 q33 0 41 34 q-20 -13 -41 -13 q-21 0 -41 13 Z" fill="#e8e6df" />

      {/* eyes / mask */}
      {mask ? (
        <>
          <rect x="54" y="64" width="92" height="26" rx="9" fill="#141418" />
          <path d="M54 74 q-12 -5 -16 5 q11 2 16 4 Z" fill="#141418" />
          <ellipse cx="86" cy="77" rx="7" ry="4.4" fill="#f6efe0" />
          <ellipse cx="114" cy="77" rx="7" ry="4.4" fill="#f6efe0" />
          <circle cx="86.5" cy="77.6" r="2.2" fill="#111" />
          <circle cx="113.5" cy="77.6" r="2.2" fill="#111" />
        </>
      ) : (
        <>
          <circle cx="86" cy="78" r="5.5" fill="#fff" />
          <circle cx="114" cy="78" r="5.5" fill="#fff" />
          <circle cx="86.5" cy="79" r="2.6" fill="#2b2b2b" />
          <circle cx="113.5" cy="79" r="2.6" fill="#2b2b2b" />
          {/* small round glasses */}
          <g fill="none" stroke="#3a3226" strokeWidth="3">
            <circle cx="86" cy="78" r="12" />
            <circle cx="114" cy="78" r="12" />
            <path d="M98 78 h4" />
            <path d="M74 76 l-12 -4" strokeLinecap="round" />
            <path d="M126 76 l12 -4" strokeLinecap="round" />
          </g>
          <path d="M77 60 q9 -7 18 -3" stroke="#cfc9bd" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M105 57 q9 -4 18 3" stroke="#cfc9bd" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* nose, moustache, mouth */}
      <path d="M100 82 q9 14 -3 18" stroke="#d8a97f" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M80 100 q20 -9 40 0 q-20 12 -40 0 Z" fill="#e8e6df" />
      <path d="M88 112 q12 9 24 0" stroke="#8a4a3f" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* held prop */}
      {prop === "spray" && (
        <g transform="translate(150 150) rotate(-18)">
          <rect x="0" y="0" width="26" height="46" rx="6" fill="#cfd3da" />
          <rect x="0" y="0" width="26" height="13" rx="6" fill="#8f97a3" />
          <rect x="9" y="-12" width="8" height="13" fill="#5f6672" />
          <path d="M17 -12 h12 l7 4 -19 4 Z" fill="#f6efe0" opacity="0.9" />
        </g>
      )}
      {prop === "cloth" && (
        <g transform="translate(146 176)">
          <rect x="0" y="0" width="32" height="24" rx="7" fill="#8fd3ff" stroke="#3aa0d8" strokeWidth="3" />
        </g>
      )}
    </svg>
  );
}

/** Comic police officer in a blue uniform with a peaked cap. */
export function Cop({ mode = "chase" }: { mode?: "chase" | "jail" }) {
  return (
    <svg viewBox="0 0 200 280" className="h-full w-full" role="img" aria-label="Police officer">
      <ellipse cx="100" cy="270" rx="52" ry="9" fill="rgba(0,0,0,0.35)" />

      <g stroke="#1e3a8a" strokeWidth="17" strokeLinecap="round">
        <path d="M88 212 v36" />
        <path d="M112 212 v36" />
      </g>
      <g fill="#101826">
        <rect x="68" y="244" width="36" height="15" rx="7" />
        <rect x="96" y="244" width="36" height="15" rx="7" />
      </g>

      <path d="M66 122 q34 -20 68 0 l8 92 q-42 16 -84 0 Z" fill="#1e3a8a" />
      <path d="M100 122 v92" stroke="#152a63" strokeWidth="3" />
      <rect x="70" y="186" width="60" height="14" rx="4" fill="#0f172a" />
      <circle cx="100" cy="142" r="4" fill="#fbbf24" />
      <circle cx="82" cy="150" r="6" fill="#fbbf24" />

      <path d="M74 134 q-16 26 -20 56" stroke="#1e3a8a" strokeWidth="18" fill="none" strokeLinecap="round" />
      <path d="M126 134 q18 24 22 52" stroke="#1e3a8a" strokeWidth="18" fill="none" strokeLinecap="round" />
      <circle cx="52" cy="194" r="11" fill="#f0c9a6" />
      <circle cx="150" cy="190" r="11" fill="#f0c9a6" />

      <circle cx="100" cy="80" r="42" fill="#f0c9a6" />
      <circle cx="58" cy="82" r="8" fill="#e3b892" />
      <circle cx="142" cy="82" r="8" fill="#e3b892" />
      <circle cx="86" cy="80" r="5.5" fill="#fff" />
      <circle cx="114" cy="80" r="5.5" fill="#fff" />
      <circle cx="86.5" cy="81" r="2.6" fill="#2b2b2b" />
      <circle cx="113.5" cy="81" r="2.6" fill="#2b2b2b" />
      <path d="M77 70 q9 -7 18 -3" stroke="#3f2d1e" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M105 67 q9 -4 18 3" stroke="#3f2d1e" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M82 100 q18 -8 36 0 q-18 10 -36 0 Z" fill="#3f2d1e" />
      <path d="M90 112 h20" stroke="#8a4a3f" strokeWidth="3" strokeLinecap="round" />

      {/* peaked cap */}
      <path d="M56 62 q44 -28 88 0 v6 H56 Z" fill="#1e3a8a" />
      <rect x="50" y="64" width="100" height="12" rx="6" fill="#152a63" />
      <circle cx="100" cy="50" r="6" fill="#fbbf24" />

      {mode === "jail" && (
        <g transform="translate(140 176)">
          <circle cx="14" cy="4" r="11" fill="none" stroke="#d4af37" strokeWidth="4" />
          <path d="M14 14 v16" stroke="#d4af37" strokeWidth="4" strokeLinecap="round" />
          <circle cx="14" cy="34" r="6" fill="#d4af37" />
        </g>
      )}
    </svg>
  );
}

/** Concrete cell with steel bars drawn over its children. */
export function JailCell({ children }: { children: ReactNode }) {
  const bars = [56, 90, 124, 158, 192, 226, 260, 294];
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#39404f] shadow-2xl">
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0 34px, #1b1f27 34px 37px), repeating-linear-gradient(90deg, transparent 0 68px, #1b1f27 68px 71px)",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-8 bg-[#2b313d]" />
      {children}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 340 300" preserveAspectRatio="none" aria-hidden="true">
        <g fill="#9aa3b2">
          {bars.map((x) => (
            <rect key={x} x={x} y="24" width="8" height="276" rx="3" />
          ))}
        </g>
        <rect x="0" y="24" width="340" height="7" fill="#7d8697" />
        <rect x="0" y="150" width="340" height="5" fill="#7d8697" opacity="0.7" />
      </svg>
    </div>
  );
}
