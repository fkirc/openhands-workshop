/**
 * A ginger tabby that strolls across the bottom of the viewport.
 * Purely decorative: it never captures pointer events, so the page
 * underneath stays fully interactive.
 */
export function WalkingCat() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-[120px] overflow-hidden"
    >
      <div className="cat-sprite">
        <svg
          viewBox="0 0 220 150"
          className="cat-figure w-full"
          role="presentation"
          focusable="false"
        >
          <defs>
            <filter id="cat-soft-shadow" x="-30%" y="-30%" width="160%" height="180%">
              <feDropShadow
                dx="0"
                dy="4"
                stdDeviation="3"
                floodColor="#000000"
                floodOpacity="0.45"
              />
            </filter>
          </defs>

          {/* Contact shadow on the ground */}
          <ellipse className="cat-ground-shadow" cx="110" cy="138" rx="66" ry="7" />

          <g filter="url(#cat-soft-shadow)">
            {/* Tail */}
            <g className="cat-tail">
              <path
                d="M60 74 C30 72 20 44 34 24"
                fill="none"
                stroke="#e07b1a"
                strokeWidth="9"
                strokeLinecap="round"
              />
              <path
                d="M60 74 C30 72 20 44 34 24"
                fill="none"
                stroke="#7a3d08"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray="1 22"
                opacity="0.55"
              />
            </g>

            {/* Back legs */}
            <rect
              className="cat-leg cat-leg--a"
              x="58"
              y="92"
              width="11"
              height="42"
              rx="5"
              fill="#e07b1a"
              stroke="#7a3d08"
              strokeWidth="2"
            />
            <rect
              className="cat-leg cat-leg--b"
              x="78"
              y="92"
              width="11"
              height="42"
              rx="5"
              fill="#f6a53c"
              stroke="#7a3d08"
              strokeWidth="2"
            />

            {/* Body */}
            <g className="cat-body">
              <ellipse
                cx="104"
                cy="78"
                rx="50"
                ry="28"
                fill="#f6a53c"
                stroke="#7a3d08"
                strokeWidth="2.5"
              />
              <ellipse cx="104" cy="90" rx="40" ry="15" fill="#ffe9c9" opacity="0.9" />
              {/* Tabby stripes */}
              <path
                d="M74 58 q6 10 2 20 M90 55 q6 12 2 22 M108 54 q6 12 2 22 M126 55 q5 11 2 20"
                fill="none"
                stroke="#e07b1a"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>

            {/* Front legs */}
            <rect
              className="cat-leg cat-leg--b"
              x="118"
              y="92"
              width="11"
              height="42"
              rx="5"
              fill="#e07b1a"
              stroke="#7a3d08"
              strokeWidth="2"
            />
            <rect
              className="cat-leg cat-leg--a"
              x="136"
              y="92"
              width="11"
              height="42"
              rx="5"
              fill="#f6a53c"
              stroke="#7a3d08"
              strokeWidth="2"
            />

            {/* Head */}
            <g className="cat-head">
              {/* Ears */}
              <path d="M146 50 L150 24 L168 44 Z" fill="#f6a53c" stroke="#7a3d08" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M170 44 L186 26 L188 50 Z" fill="#f6a53c" stroke="#7a3d08" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M152 46 L154 31 L164 44 Z" fill="#ff8fa3" />
              <path d="M174 45 L183 33 L185 47 Z" fill="#ff8fa3" />

              <circle cx="166" cy="66" r="26" fill="#f6a53c" stroke="#7a3d08" strokeWidth="2.5" />
              <ellipse cx="170" cy="76" rx="14" ry="10" fill="#ffe9c9" />

              {/* Eyes */}
              <ellipse cx="158" cy="60" rx="3.4" ry="4.4" fill="#2b1a0a" />
              <ellipse cx="178" cy="60" rx="3.4" ry="4.4" fill="#2b1a0a" />
              <circle cx="159.2" cy="58.4" r="1.1" fill="#ffffff" />
              <circle cx="179.2" cy="58.4" r="1.1" fill="#ffffff" />

              {/* Nose + mouth */}
              <path d="M168 70 l4 3 l-4 3 l-4 -3 Z" fill="#ff8fa3" />
              <path d="M168 76 q-4 4 -7 1 M168 76 q4 4 7 1" fill="none" stroke="#7a3d08" strokeWidth="1.6" strokeLinecap="round" />

              {/* Whiskers */}
              <path
                d="M186 68 l14 -4 M186 72 l14 2 M148 68 l-14 -4 M148 72 l-14 2"
                fill="none"
                stroke="#7a3d08"
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity="0.75"
              />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
