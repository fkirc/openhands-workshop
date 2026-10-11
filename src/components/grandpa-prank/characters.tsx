import type { ReactNode } from "react";

type OldManProp = "none" | "spray" | "cloth";

// Point-and-click adventure look: flat vivid fills, bold dark outlines,
// oversized expressive heads. Palette deliberately limited, like a 90s
// VGA adventure (Simon the Sorcerer vibes).

const OUTLINE = "#241a2e";

/** Comic grandpa: bald, big white moustache, round specs, walking stick. */
export function OldMan({
  mask = false,
  prop = "none",
}: {
  mask?: boolean;
  prop?: OldManProp;
}) {
  return (
    <svg
      viewBox="0 0 200 300"
      className="h-full w-full"
      role="img"
      aria-label={mask ? "Old man in a black robbery mask" : "Old man"}
    >
      <ellipse cx="100" cy="290" rx="54" ry="8" fill="rgba(0,0,0,0.35)" />

      {/* walking stick */}
      <path d="M44 104 q-18 6 -18 26 v150" stroke="#7a4a22" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M44 104 q-18 6 -18 26 v150" stroke={OUTLINE} strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.25" />

      {/* legs + big shoes */}
      <path d="M88 226 v40" stroke="#3b3f52" strokeWidth="20" strokeLinecap="round" />
      <path d="M112 226 v40" stroke="#3b3f52" strokeWidth="20" strokeLinecap="round" />
      <rect x="62" y="256" width="40" height="20" rx="9" fill="#1f2230" stroke={OUTLINE} strokeWidth="3" />
      <rect x="98" y="256" width="40" height="20" rx="9" fill="#1f2230" stroke={OUTLINE} strokeWidth="3" />

      {/* coat */}
      <path d="M62 130 q38 -24 76 0 l10 100 q-48 20 -96 0 Z" fill="#8a5a3b" stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" />
      <path d="M100 130 v100" stroke="#5c3a24" strokeWidth="4" />
      <path d="M89 130 h22 l-11 24 Z" fill="#f3ead6" stroke={OUTLINE} strokeWidth="2" />
      <circle cx="100" cy="182" r="4" fill="#e6d9bf" stroke={OUTLINE} strokeWidth="2" />
      <circle cx="100" cy="208" r="4" fill="#e6d9bf" stroke={OUTLINE} strokeWidth="2" />

      {/* arms */}
      <path d="M70 142 q-24 10 -36 26" stroke="#8a5a3b" strokeWidth="20" fill="none" strokeLinecap="round" />
      <path d="M130 142 q24 22 30 52" stroke="#8a5a3b" strokeWidth="20" fill="none" strokeLinecap="round" />
      <circle cx="34" cy="170" r="13" fill="#f0c9a6" stroke={OUTLINE} strokeWidth="3" />
      <circle cx="160" cy="196" r="13" fill="#f0c9a6" stroke={OUTLINE} strokeWidth="3" />

      {/* head */}
      <circle cx="100" cy="82" r="48" fill="#f0c9a6" stroke={OUTLINE} strokeWidth="4" />
      <circle cx="54" cy="84" r="9" fill="#e3b892" stroke={OUTLINE} strokeWidth="3" />
      <circle cx="146" cy="84" r="9" fill="#e3b892" stroke={OUTLINE} strokeWidth="3" />
      <path d="M54 68 q10 -40 46 -40 q36 0 46 40 q-22 -16 -46 -16 q-24 0 -46 16 Z" fill="#efece2" stroke={OUTLINE} strokeWidth="3" />

      {mask ? (
        <>
          <rect x="50" y="62" width="100" height="30" rx="11" fill="#181822" stroke={OUTLINE} strokeWidth="3" />
          <path d="M50 74 q-14 -6 -18 6 q13 2 18 5 Z" fill="#181822" stroke={OUTLINE} strokeWidth="3" />
          <ellipse cx="84" cy="77" rx="8" ry="5" fill="#f6efe0" />
          <ellipse cx="116" cy="77" rx="8" ry="5" fill="#f6efe0" />
          <circle cx="84.5" cy="77.6" r="2.6" fill="#111" />
          <circle cx="115.5" cy="77.6" r="2.6" fill="#111" />
        </>
      ) : (
        <>
          <circle cx="84" cy="80" r="6" fill="#fff" />
          <circle cx="116" cy="80" r="6" fill="#fff" />
          <circle cx="84.5" cy="81" r="3" fill="#2b2b2b" />
          <circle cx="115.5" cy="81" r="3" fill="#2b2b2b" />
          <g fill="none" stroke={OUTLINE} strokeWidth="3.5">
            <circle cx="84" cy="80" r="13" />
            <circle cx="116" cy="80" r="13" />
            <path d="M97 80 h6" />
            <path d="M71 77 l-14 -5" strokeLinecap="round" />
            <path d="M129 77 l14 -5" strokeLinecap="round" />
          </g>
          <path d="M74 60 q10 -8 20 -4" stroke="#d8d3c6" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M106 56 q10 -4 20 4" stroke="#d8d3c6" strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* nose, big moustache, mouth */}
      <path d="M100 84 q10 16 -4 22" stroke="#d8a97f" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M74 106 q26 -12 52 0 q-26 16 -52 0 Z" fill="#efece2" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
      <path d="M88 120 q12 10 24 0" stroke="#8a4a3f" strokeWidth="3.5" fill="none" strokeLinecap="round" />

      {prop === "spray" && (
        <g transform="translate(150 152) rotate(-18)">
          <rect x="0" y="0" width="28" height="50" rx="7" fill="#d7dbe2" stroke={OUTLINE} strokeWidth="3" />
          <rect x="0" y="0" width="28" height="14" rx="7" fill="#8f97a3" stroke={OUTLINE} strokeWidth="3" />
          <rect x="10" y="-13" width="8" height="14" fill="#5f6672" stroke={OUTLINE} strokeWidth="2" />
          <path d="M18 -13 h13 l8 5 -21 4 Z" fill="#f6efe0" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
        </g>
      )}
      {prop === "cloth" && (
        <g transform="translate(146 178)">
          <rect x="0" y="0" width="34" height="26" rx="8" fill="#8fd3ff" stroke={OUTLINE} strokeWidth="3" />
        </g>
      )}
    </svg>
  );
}

/** Comic police officer: tall bobby helmet, blue uniform, whistle. */
export function Cop({ mode = "chase" }: { mode?: "chase" | "jail" }) {
  return (
    <svg viewBox="0 0 200 300" className="h-full w-full" role="img" aria-label="Police officer">
      <ellipse cx="100" cy="290" rx="52" ry="8" fill="rgba(0,0,0,0.35)" />

      <path d="M88 226 v40" stroke="#1e3a8a" strokeWidth="20" strokeLinecap="round" />
      <path d="M112 226 v40" stroke="#1e3a8a" strokeWidth="20" strokeLinecap="round" />
      <rect x="64" y="256" width="40" height="20" rx="9" fill="#101826" stroke={OUTLINE} strokeWidth="3" />
      <rect x="96" y="256" width="40" height="20" rx="9" fill="#101826" stroke={OUTLINE} strokeWidth="3" />

      <path d="M64 130 q36 -22 72 0 l8 98 q-44 18 -88 0 Z" fill="#1e3a8a" stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" />
      <path d="M100 130 v98" stroke="#152a63" strokeWidth="4" />
      <rect x="68" y="196" width="64" height="16" rx="5" fill="#0f172a" stroke={OUTLINE} strokeWidth="3" />
      <circle cx="100" cy="152" r="5" fill="#fbbf24" stroke={OUTLINE} strokeWidth="2" />
      <circle cx="82" cy="160" r="7" fill="#fbbf24" stroke={OUTLINE} strokeWidth="2" />

      <path d="M72 142 q-20 26 -24 58" stroke="#1e3a8a" strokeWidth="20" fill="none" strokeLinecap="round" />
      <path d="M128 142 q20 24 24 54" stroke="#1e3a8a" strokeWidth="20" fill="none" strokeLinecap="round" />
      <circle cx="48" cy="200" r="13" fill="#f0c9a6" stroke={OUTLINE} strokeWidth="3" />
      <circle cx="152" cy="196" r="13" fill="#f0c9a6" stroke={OUTLINE} strokeWidth="3" />

      <circle cx="100" cy="82" r="48" fill="#f0c9a6" stroke={OUTLINE} strokeWidth="4" />
      <circle cx="54" cy="84" r="9" fill="#e3b892" stroke={OUTLINE} strokeWidth="3" />
      <circle cx="146" cy="84" r="9" fill="#e3b892" stroke={OUTLINE} strokeWidth="3" />
      <circle cx="84" cy="82" r="6" fill="#fff" />
      <circle cx="116" cy="82" r="6" fill="#fff" />
      <circle cx="84.5" cy="83" r="3" fill="#2b2b2b" />
      <circle cx="115.5" cy="83" r="3" fill="#2b2b2b" />
      <path d="M74 62 q10 -8 20 -4" stroke="#5c4a34" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M106 58 q10 -4 20 4" stroke="#5c4a34" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M80 106 q20 -10 40 0 q-20 12 -40 0 Z" fill="#5c4a34" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
      <path d="M90 120 h20" stroke="#8a4a3f" strokeWidth="3.5" strokeLinecap="round" />

      {/* tall bobby helmet */}
      <path d="M52 60 q48 -54 96 0 v8 H52 Z" fill="#1e3a8a" stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" />
      <rect x="44" y="64" width="112" height="14" rx="7" fill="#152a63" stroke={OUTLINE} strokeWidth="4" />
      <path d="M92 20 q8 -10 16 0 v6 h-16 Z" fill="#fbbf24" stroke={OUTLINE} strokeWidth="3" />
      <circle cx="100" cy="44" r="7" fill="#fbbf24" stroke={OUTLINE} strokeWidth="3" />

      {mode === "jail" && (
        <g transform="translate(142 176)">
          <circle cx="14" cy="4" r="12" fill="none" stroke="#d4af37" strokeWidth="5" />
          <path d="M14 15 v18" stroke="#d4af37" strokeWidth="5" strokeLinecap="round" />
          <circle cx="14" cy="37" r="7" fill="#d4af37" stroke={OUTLINE} strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}

/** Concrete cell with steel bars drawn over its children. */
export function JailCell({ children }: { children: ReactNode }) {
  const bars = [56, 90, 124, 158, 192, 226, 260, 294];
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#4a5163] shadow-2xl">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0 34px, #2b313d 34px 37px), repeating-linear-gradient(90deg, transparent 0 68px, #2b313d 68px 71px)",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-8 bg-[#333a48]" />
      {children}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 340 300" preserveAspectRatio="none" aria-hidden="true">
        <g fill="#aeb6c6" stroke="#5f6672" strokeWidth="1">
          {bars.map((x) => (
            <rect key={x} x={x} y="24" width="9" height="276" rx="3" />
          ))}
        </g>
        <rect x="0" y="24" width="340" height="8" fill="#8b94a5" stroke="#5f6672" strokeWidth="1" />
        <rect x="0" y="150" width="340" height="5" fill="#8b94a5" opacity="0.7" />
      </svg>
    </div>
  );
}
