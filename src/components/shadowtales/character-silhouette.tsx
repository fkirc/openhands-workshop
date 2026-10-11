import type { Character } from "@/lib/shadowtales/types";

/**
 * A shadow puppet drawn as a single SVG silhouette. The look is deliberately
 * simple — hair, hat, glasses, height and clothing are the features that make
 * a figure recognisable, exactly like the requirements ask for.
 *
 * All geometry is drawn facing right; the caller mirrors it for the other side.
 */

interface CharacterSilhouetteProps {
  character: Character;
  className?: string;
  /** Fill colour; defaults to a warm near-black. */
  color?: string;
}

const DARK = "#0d0805";

export function CharacterSilhouette({
  character,
  className,
  color = DARK,
}: CharacterSilhouetteProps) {
  const { hair, hat, glasses, outfit, accessory, type } = character;

  return (
    <svg
      viewBox="0 0 120 300"
      className={className}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* legs */}
      <path d="M52 250 L46 292 L58 292 L62 250 Z" />
      <path d="M66 250 L70 292 L82 292 L74 250 Z" />

      {/* torso / clothing */}
      {outfit === "elegant" ? (
        <path d="M40 120 Q60 106 80 120 L88 250 Q60 260 32 250 Z" />
      ) : outfit === "fantasy" ? (
        <path d="M38 122 Q60 104 82 122 L92 250 Q60 262 28 250 Z" />
      ) : (
        <path d="M44 124 Q60 112 76 124 L82 250 Q60 258 38 250 Z" />
      )}

      {/* arms */}
      <path d="M40 132 Q28 176 32 214 L40 214 Q38 176 48 138 Z" />
      <path d="M80 132 Q92 176 88 214 L80 214 Q82 176 72 138 Z" />

      {/* neck + head */}
      <rect x="53" y="96" width="14" height="18" rx="4" />
      <circle cx="60" cy="80" r="22" />

      {/* hair */}
      {hair === "long" && (
        <path d="M34 80 Q34 44 60 44 Q86 44 86 80 Q86 104 78 118 L70 108 Q74 88 60 86 Q46 88 50 108 L42 118 Q34 104 34 80 Z" />
      )}
      {hair === "short" && (
        <path d="M36 78 Q36 46 60 46 Q84 46 84 78 Q78 62 60 62 Q42 62 36 78 Z" />
      )}
      {hair === "curly" && (
        <g>
          <circle cx="42" cy="60" r="10" />
          <circle cx="60" cy="50" r="12" />
          <circle cx="78" cy="60" r="10" />
          <circle cx="36" cy="76" r="9" />
          <circle cx="84" cy="76" r="9" />
        </g>
      )}

      {/* hat (wizard / fantasy) */}
      {hat && <path d="M30 60 L60 4 L90 60 Z" />}

      {/* glasses — drawn as light strokes so they read on the dark face */}
      {glasses && (
        <g stroke={color} strokeWidth="3" fill="none" opacity="0.9">
          <circle cx="51" cy="80" r="7" />
          <circle cx="69" cy="80" r="7" />
          <line x1="58" y1="80" x2="62" y2="80" />
        </g>
      )}

      {/* wizard collar / cape hint */}
      {type === "wizard" && <path d="M34 120 L60 150 L86 120 L80 128 L60 158 L40 128 Z" />}

      {/* accessory held in front of the body */}
      {accessory === "sword" && (
        <g>
          <rect x="86" y="150" width="5" height="90" rx="2" />
          <rect x="80" y="238" width="17" height="6" rx="2" />
        </g>
      )}
      {accessory === "flower" && (
        <g>
          <circle cx="90" cy="150" r="8" />
          <circle cx="90" cy="150" r="3" fill="#f6d38a" />
        </g>
      )}
      {accessory === "cup" && (
        <path d="M84 150 L96 150 L94 172 L86 172 Z" />
      )}
      {accessory === "book" && <rect x="80" y="150" width="18" height="24" rx="2" />}
      {accessory === "wand" && <rect x="88" y="140" width="4" height="70" rx="2" transform="rotate(8 90 175)" />}
      {accessory === "crown" && <path d="M42 46 L50 30 L60 44 L70 30 L78 46 Z" />}
    </svg>
  );
}
