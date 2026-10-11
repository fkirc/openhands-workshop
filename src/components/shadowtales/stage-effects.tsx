import type { AnimationType } from "@/lib/shadowtales/types";

/** Small stage effects driven by the scene's animation type. */

function Hearts({ color }: { color: string }) {
  const hearts = [
    { left: "22%", delay: "0s", size: 22 },
    { left: "38%", delay: "0.8s", size: 16 },
    { left: "52%", delay: "1.6s", size: 26 },
    { left: "68%", delay: "0.4s", size: 18 },
    { left: "80%", delay: "2.2s", size: 20 },
  ];
  return (
    <div className="st-layer" aria-hidden>
      {hearts.map((h, i) => (
        <svg
          key={i}
          className="st-heart absolute bottom-[24%]"
          style={{ left: h.left, animationDelay: h.delay, width: h.size, height: h.size }}
          viewBox="0 0 24 24"
          fill={color}
        >
          <path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11z" />
        </svg>
      ))}
    </div>
  );
}

function FallingObject() {
  return (
    <div className="st-layer" aria-hidden>
      <svg
        className="st-falling-object absolute"
        style={{ left: "46%", top: "34%", width: 34, height: 44 }}
        viewBox="0 0 34 44"
        fill="#0d0805"
      >
        <path d="M4 6 L30 6 L27 38 L7 38 Z" />
        <rect x="2" y="2" width="30" height="6" rx="2" />
        <path d="M10 38 Q17 50 24 38" fill="none" stroke="#0d0805" strokeWidth="3" />
      </svg>
    </div>
  );
}

function Dragon() {
  return (
    <div className="st-layer" aria-hidden>
      <svg
        className="st-dragon absolute"
        style={{ left: "18%", top: "6%", width: 260, height: 150 }}
        viewBox="0 0 260 150"
        fill="#0d0805"
      >
        {/* wings */}
        <path d="M120 60 L40 10 L70 70 Z" />
        <path d="M140 60 L220 10 L190 70 Z" />
        {/* body */}
        <path d="M100 70 Q130 40 160 70 Q180 90 150 105 Q120 118 100 95 Z" />
        {/* head + neck */}
        <path d="M160 66 Q190 50 200 70 Q206 84 190 90 L168 82 Z" />
        {/* tail */}
        <path d="M100 90 Q60 110 30 96 Q50 120 96 108 Z" />
        <circle cx="188" cy="70" r="3" fill="#f6d38a" />
      </svg>
    </div>
  );
}

function MagicFlash({ color }: { color: string }) {
  return (
    <div
      className="st-flash st-layer"
      aria-hidden
      style={{ background: `radial-gradient(circle at 50% 45%, ${color} 0%, transparent 60%)` }}
    />
  );
}

export function StageEffects({
  animation,
  accent,
}: {
  animation: AnimationType;
  accent: string;
}) {
  return (
    <>
      {(animation === "hearts" || animation === "celebrate") && <Hearts color={accent} />}
      {animation === "fall-object" && <FallingObject />}
      {animation === "dragon" && (
        <>
          <Dragon />
          <MagicFlash color={accent} />
        </>
      )}
      {animation === "zoom" && <MagicFlash color={accent} />}
    </>
  );
}
