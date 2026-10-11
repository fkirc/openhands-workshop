import type { CSSProperties } from "react";

/**
 * Bubbles with deterministic per-bubble CSS variables (position, size,
 * bounce path, hue). Fixed values keep server and client markup identical.
 */
const BUBBLES: { style: CSSProperties; delay: string; duration: string }[] = [
  {
    style: { top: "8%", left: "6%", width: 190, height: 190, "--h": 36, "--bx": "120px", "--by": "90px", "--bx2": "-60px", "--by2": "140px" } as CSSProperties,
    delay: "-1s",
    duration: "13s",
  },
  {
    style: { top: "22%", left: "74%", width: 260, height: 260, "--h": 40, "--bx": "-160px", "--by": "70px", "--bx2": "90px", "--by2": "-120px" } as CSSProperties,
    delay: "-4s",
    duration: "17s",
  },
  {
    style: { top: "62%", left: "12%", width: 150, height: 150, "--h": 43, "--bx": "140px", "--by": "-90px", "--bx2": "-80px", "--by2": "-40px" } as CSSProperties,
    delay: "-7s",
    duration: "11s",
  },
  {
    style: { top: "70%", left: "62%", width: 230, height: 230, "--h": 46, "--bx": "-120px", "--by": "-140px", "--bx2": "150px", "--by2": "60px" } as CSSProperties,
    delay: "-2.5s",
    duration: "19s",
  },
  {
    style: { top: "42%", left: "40%", width: 110, height: 110, "--h": 34, "--bx": "90px", "--by": "150px", "--bx2": "-120px", "--by2": "70px" } as CSSProperties,
    delay: "-9s",
    duration: "10s",
  },
  {
    style: { top: "12%", left: "44%", width: 80, height: 80, "--h": 48, "--bx": "-70px", "--by": "110px", "--bx2": "60px", "--by2": "-80px" } as CSSProperties,
    delay: "-5.5s",
    duration: "9s",
  },
  {
    style: { top: "84%", left: "34%", width: 170, height: 170, "--h": 38, "--bx": "110px", "--by": "-70px", "--bx2": "-90px", "--by2": "-130px" } as CSSProperties,
    delay: "-3s",
    duration: "15s",
  },
  {
    style: { top: "34%", left: "88%", width: 130, height: 130, "--h": 42, "--bx": "-100px", "--by": "80px", "--bx2": "70px", "--by2": "120px" } as CSSProperties,
    delay: "-6s",
    duration: "12s",
  },
  {
    style: { top: "52%", left: "82%", width: 90, height: 90, "--h": 44, "--bx": "-90px", "--by": "-110px", "--bx2": "100px", "--by2": "50px" } as CSSProperties,
    delay: "-8s",
    duration: "14s",
  },
  {
    style: { top: "76%", left: "4%", width: 120, height: 120, "--h": 39, "--bx": "130px", "--by": "90px", "--bx2": "-70px", "--by2": "-90px" } as CSSProperties,
    delay: "-0.5s",
    duration: "16s",
  },
];

const LORE =
  "THE BUBBLES KNOW YOUR NAME • BREATHE THE SPIRAL • EVERY BOUNCE OPENS A DOOR • LOOK CLOSER • LOOK CLOSER • ";

/**
 * Full-viewport decorative background: a slowly rotating conic swirl, an
 * expanding tunnel of rings, a rotating ring of hypnotic lore text and a
 * field of colorful bouncy bubbles. Purely decorative, never interactive.
 */
export function PsychedelicBackground() {
  return (
    <div
      aria-hidden="true"
      className="psy-stage pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="psy-swirl" />
      <div className="psy-swirl psy-swirl--reverse" />
      <div className="psy-tunnel" />

      <svg
        className="psy-lore"
        viewBox="0 0 400 400"
        role="presentation"
        focusable="false"
      >
        <defs>
          <path
            id="psy-lore-circle"
            d="M200,200 m-165,0 a165,165 0 1,1 330,0 a165,165 0 1,1 -330,0"
            fill="none"
          />
        </defs>
        <text>
          <textPath href="#psy-lore-circle" startOffset="0%">
            {LORE}
          </textPath>
        </text>
      </svg>

      {BUBBLES.map((bubble, index) => (
        <div
          key={index}
          className="psy-bubble"
          style={{
            ...bubble.style,
            animationDelay: bubble.delay,
            animationDuration: bubble.duration,
          }}
        >
          <span className="psy-bubble-core" />
        </div>
      ))}
    </div>
  );
}
