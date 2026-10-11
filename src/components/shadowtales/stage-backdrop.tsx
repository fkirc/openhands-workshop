import type { BackdropId } from "@/lib/shadowtales/types";

/**
 * Parallax scenery for the shadow theatre. Every backdrop is a hand-built SVG
 * silhouette sitting in front of a warm, back-lit parchment glow, split into
 * far / mid / near layers so the stage gains depth.
 */

interface BackdropProps {
  id: BackdropId;
  light: string;
  glow: string;
}

const FAR = "#8a6b45";
const MID = "#6f5233";
const NEAR = "#4f3a22";

function Clouds() {
  return (
    <div className="st-layer st-clouds" aria-hidden>
      <svg viewBox="0 0 800 450" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <g fill={MID} opacity="0.45">
          <ellipse cx="150" cy="70" rx="90" ry="20" />
          <ellipse cx="220" cy="78" rx="60" ry="14" />
          <ellipse cx="600" cy="60" rx="110" ry="22" />
          <ellipse cx="680" cy="70" rx="70" ry="15" />
        </g>
      </svg>
    </div>
  );
}

function Fog() {
  return (
    <div className="st-layer st-fog" aria-hidden>
      <svg viewBox="0 0 800 450" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="st-fog-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="1" stopColor="#f7e6c4" stopOpacity="0.28" />
          </linearGradient>
        </defs>
        <rect x="0" y="230" width="800" height="220" fill="url(#st-fog-grad)" />
      </svg>
    </div>
  );
}

function Trees() {
  return (
    <g fill={MID}>
      <path d="M60 330 L80 250 L100 330 Z" />
      <path d="M110 340 L132 240 L154 340 Z" />
      <path d="M680 335 L702 245 L724 335 Z" />
      <path d="M730 345 L750 265 L770 345 Z" />
    </g>
  );
}

function Scenery({ id }: { id: BackdropId }) {
  switch (id) {
    case "party":
      return (
        <>
          <g fill={FAR}>
            <rect x="40" y="150" width="120" height="200" rx="6" />
            <rect x="180" y="180" width="90" height="170" rx="6" />
            <rect x="560" y="170" width="100" height="180" rx="6" />
            <rect x="680" y="150" width="110" height="200" rx="6" />
            <rect x="90" y="180" width="20" height="20" fill={MID} />
            <rect x="610" y="200" width="20" height="20" fill={MID} />
          </g>
          <g fill={MID}>
            <path d="M0 350 Q200 300 400 340 T800 330 L800 450 L0 450 Z" />
            <circle cx="200" cy="120" r="4" />
            <circle cx="400" cy="90" r="4" />
            <circle cx="600" cy="110" r="4" />
          </g>
          <g fill={NEAR}>
            <rect x="0" y="380" width="800" height="70" />
          </g>
        </>
      );
    case "castle":
      return (
        <>
          <g fill={FAR}>
            <path d="M120 330 L120 170 L170 140 L220 170 L220 330 Z" />
            <path d="M560 330 L560 160 L610 130 L660 160 L660 330 Z" />
            <path d="M300 330 L300 200 L400 160 L500 200 L500 330 Z" />
          </g>
          <g fill={MID}>
            <rect x="150" y="200" width="20" height="30" />
            <rect x="600" y="190" width="20" height="30" />
            <path d="M380 330 L380 240 A40 40 0 0 1 440 240 L440 330 Z" />
          </g>
          <g fill={NEAR}>
            <path d="M0 340 Q400 300 800 340 L800 450 L0 450 Z" />
          </g>
        </>
      );
    case "forest":
      return (
        <>
          <g fill={FAR}><Trees /></g>
          <g fill={MID}>
            <path d="M150 350 L180 220 L210 350 Z" />
            <path d="M250 360 L285 200 L320 360 Z" />
            <path d="M480 355 L515 210 L550 355 Z" />
            <path d="M590 360 L620 230 L650 360 Z" />
          </g>
          <g fill={NEAR}>
            <path d="M0 360 Q400 320 800 355 L800 450 L0 450 Z" />
            <path d="M330 360 L350 250 L370 360 Z" />
            <path d="M430 365 L450 265 L470 365 Z" />
          </g>
        </>
      );
    case "mountain":
      return (
        <>
          <g fill={FAR}>
            <path d="M0 330 L150 140 L300 330 Z" />
            <path d="M240 330 L420 110 L600 330 Z" />
            <path d="M540 330 L700 160 L800 330 Z" />
          </g>
          <g fill={MID}>
            <path d="M0 360 L120 240 L240 360 Z" />
            <path d="M560 360 L680 250 L800 360 Z" />
          </g>
          <g fill={NEAR}>
            <path d="M0 360 Q400 330 800 360 L800 450 L0 450 Z" />
          </g>
        </>
      );
    case "dragon-peak":
      return (
        <>
          <g fill={FAR}>
            <path d="M0 340 L180 90 L360 340 Z" />
            <path d="M300 340 L500 60 L700 340 Z" />
            <path d="M620 340 L760 150 L800 340 Z" />
          </g>
          <g fill={MID}>
            <path d="M0 370 L140 230 L280 370 Z" />
            <path d="M600 370 L720 250 L800 370 Z" />
          </g>
          <g fill={NEAR}>
            <path d="M0 375 Q400 340 800 375 L800 450 L0 450 Z" />
          </g>
        </>
      );
    case "sky":
      return (
        <>
          <g fill={FAR}>
            <ellipse cx="200" cy="120" rx="120" ry="34" />
            <ellipse cx="620" cy="90" rx="140" ry="30" />
          </g>
          <g fill={MID}>
            <ellipse cx="400" cy="170" rx="160" ry="28" opacity="0.7" />
          </g>
          <g fill={NEAR}>
            <path d="M0 360 Q400 330 800 360 L800 450 L0 450 Z" />
          </g>
        </>
      );
    case "stars":
      return (
        <>
          <g fill={FAR}>
            <circle cx="120" cy="70" r="3" />
            <circle cx="250" cy="110" r="2" />
            <circle cx="380" cy="60" r="3" />
            <circle cx="520" cy="100" r="2" />
            <circle cx="660" cy="70" r="3" />
            <circle cx="740" cy="140" r="2" />
            <circle cx="80" cy="160" r="2" />
          </g>
          <g fill={MID}>
            <circle cx="650" cy="90" r="34" />
            <circle cx="638" cy="82" r="34" />
          </g>
          <g fill={NEAR}>
            <path d="M0 350 L80 300 L160 350 Z" />
            <path d="M620 350 L700 300 L780 350 Z" />
            <path d="M0 370 Q400 340 800 370 L800 450 L0 450 Z" />
          </g>
        </>
      );
    case "home":
      return (
        <>
          <g fill={FAR}>
            <rect x="240" y="150" width="320" height="210" rx="8" />
            <path d="M220 150 L400 60 L580 150 Z" />
          </g>
          <g fill={MID}>
            <rect x="300" y="220" width="50" height="60" />
            <rect x="450" y="220" width="50" height="60" />
            <rect x="375" y="270" width="50" height="90" />
          </g>
          <g fill={NEAR}>
            <path d="M0 360 Q400 335 800 360 L800 450 L0 450 Z" />
          </g>
        </>
      );
    case "street":
      return (
        <>
          <g fill={FAR}>
            <rect x="60" y="170" width="130" height="190" />
            <rect x="240" y="200" width="100" height="160" />
            <rect x="470" y="180" width="120" height="180" />
            <rect x="640" y="160" width="120" height="200" />
          </g>
          <g fill={MID}>
            <rect x="100" y="200" width="24" height="26" />
            <rect x="150" y="200" width="24" height="26" />
            <rect x="680" y="200" width="24" height="26" />
            <path d="M360 360 L380 250 L400 360 Z" />
          </g>
          <g fill={NEAR}>
            <rect x="0" y="360" width="800" height="90" />
            <rect x="380" y="360" width="6" height="30" />
          </g>
        </>
      );
    case "beach":
      return (
        <>
          <g fill={FAR}>
            <path d="M0 300 Q200 260 400 300 T800 300 L800 340 L0 340 Z" />
          </g>
          <g fill={MID}>
            <circle cx="660" cy="120" r="30" />
            <path d="M120 330 L140 250 L160 330 Z" />
          </g>
          <g fill={NEAR}>
            <path d="M0 330 Q400 300 800 340 L800 450 L0 450 Z" />
          </g>
        </>
      );
    case "ballroom":
      return (
        <>
          <g fill={FAR}>
            <rect x="0" y="120" width="90" height="240" />
            <rect x="710" y="120" width="90" height="240" />
            <path d="M90 120 Q400 20 710 120 Z" />
          </g>
          <g fill={MID}>
            <rect x="150" y="180" width="40" height="180" />
            <rect x="610" y="180" width="40" height="180" />
            <circle cx="400" cy="90" r="26" />
          </g>
          <g fill={NEAR}>
            <path d="M0 370 Q400 340 800 370 L800 450 L0 450 Z" />
          </g>
        </>
      );
    case "proposal":
      return (
        <>
          <g fill={FAR}>
            <path d="M0 330 L120 180 L240 330 Z" />
            <path d="M560 330 L680 180 L800 330 Z" />
          </g>
          <g fill={MID}>
            <circle cx="400" cy="90" r="40" />
            <circle cx="386" cy="80" r="40" />
          </g>
          <g fill={NEAR}>
            <path d="M0 350 Q400 320 800 350 L800 450 L0 450 Z" />
            <path d="M160 360 L180 280 L200 360 Z" />
            <path d="M600 360 L620 280 L640 360 Z" />
          </g>
        </>
      );
  }
}

export function StageBackdrop({ id, light, glow }: BackdropProps) {
  return (
    <>
      <div
        className="st-layer"
        aria-hidden
        style={{
          background: `radial-gradient(120% 90% at 50% 42%, ${light} 0%, ${glow} 62%, #150c05 100%)`,
        }}
      />
      <Clouds />
      <div className="st-layer" aria-hidden>
        <svg viewBox="0 0 800 450" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <Scenery id={id} />
        </svg>
      </div>
      <Fog />
      <div className="st-vignette" />
    </>
  );
}
