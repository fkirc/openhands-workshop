import type { Character, Scene, StoryStyle } from "@/lib/shadowtales/types";
import { STYLE_PRESETS } from "@/lib/shadowtales/styles";
import { StageBackdrop } from "./stage-backdrop";
import { StageEffects } from "./stage-effects";
import { CharacterSilhouette } from "./character-silhouette";

/**
 * Renders one scene of the shadow theatre: warm backdrop, parallax scenery,
 * animated silhouettes, stage effects and the caption box.
 *
 * The component is purely presentational — the player owns timing, so the same
 * renderer is used for the animated playback and for the static studio preview.
 */

export interface SceneRendererProps {
  scene: Scene;
  characters: Character[];
  style: StoryStyle;
  /** Whether the running CSS animations are allowed to play. */
  playing: boolean;
  /** Elapsed playback time of the current scene, in seconds (drives dialogue). */
  elapsed?: number;
  /** Renders the narration/dialogue captions (disabled in tiny previews). */
  showCaptions?: boolean;
  /** Optional click handler for interactive choices. */
  onChoose?: (nextSceneId: string) => void;
  className?: string;
}

function activeDialogue(scene: Scene, elapsed: number) {
  if (scene.dialogue.length === 0) return undefined;
  const per = scene.duration / (scene.dialogue.length + 0.4);
  const i = Math.min(scene.dialogue.length - 1, Math.floor(elapsed / per));
  return scene.dialogue[i];
}

export function SceneRenderer({
  scene,
  characters,
  style,
  playing,
  elapsed = 0,
  showCaptions = true,
  onChoose,
  className,
}: SceneRendererProps) {
  const preset = STYLE_PRESETS[style];
  const cameraClass = scene.camera === "none" ? "" : `st-cam-${scene.camera}`;
  const dialogue = activeDialogue(scene, elapsed);

  return (
    <div
      className={`st-stage ${className ?? ""}`}
      data-paused={playing ? "false" : "true"}
      style={{ ["--scene-duration" as string]: `${scene.duration}s` }}
    >
      <div className={`st-stage-inner ${cameraClass}`}>
        <StageBackdrop id={scene.backdrop} light={preset.palette.light} glow={preset.palette.glow} />

        {scene.characters.map((sc) => {
          const character = characters.find((c) => c.id === sc.characterId);
          if (!character) return null;
          const anim = `st-anim-${scene.animation}`;
          return (
            <div
              key={sc.characterId}
              className="st-slot"
              style={{ left: `${sc.x * 100}%` }}
            >
              <div
                className={`st-actor ${anim}`}
                style={{
                  animationDelay: `${sc.delay ?? 0}s`,
                  height: `calc(72% * ${character.height})`,
                }}
              >
                <span
                  className="st-facing"
                  style={{ transform: sc.facing === "left" ? "scaleX(-1)" : undefined }}
                >
                  <CharacterSilhouette character={character} className="h-full w-full" />
                </span>
              </div>
            </div>
          );
        })}

        <StageEffects animation={scene.animation} accent={preset.palette.accent} />
      </div>

      {/* title card */}
      {scene.titleCard && (
        <div className="st-title-card absolute inset-x-0 top-[16%] z-20 px-6 text-center">
          <p
            className="mx-auto max-w-[80%] font-serif text-2xl leading-snug sm:text-4xl"
            style={{ color: preset.palette.accent, textShadow: "0 2px 18px rgba(0,0,0,0.8)" }}
          >
            {scene.titleCard}
          </p>
        </div>
      )}

      {/* captions / interactive choice share the bottom caption area so the
          stage animation stays visible while the decision is offered */}
      {showCaptions && scene.choice && onChoose ? (
        <div className="absolute inset-x-0 bottom-0 z-30 p-3 sm:p-5">
          <div className="st-caption mx-auto max-w-md rounded-xl border border-amber-400/30 bg-black/70 px-4 py-3 text-center backdrop-blur-sm">
            <p className="font-serif text-base text-amber-100 sm:text-lg">{scene.choice.prompt}</p>
            <div className="mt-3 flex flex-col gap-2">
              {scene.choice.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChoose(opt.nextSceneId)}
                  className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-50 transition hover:bg-amber-400/25"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        showCaptions &&
        (scene.narration || dialogue) && (
          <div className="absolute inset-x-0 bottom-0 z-20 p-3 sm:p-5">
            <div
              key={dialogue?.text ?? scene.narration}
              className="st-caption mx-auto max-w-2xl rounded-lg border border-white/10 bg-black/55 px-4 py-3 text-center backdrop-blur-sm"
            >
              {dialogue ? (
                <>
                  <span
                    className="block text-xs uppercase tracking-widest"
                    style={{ color: preset.palette.accent }}
                  >
                    {characters.find((c) => c.id === dialogue.characterId)?.name ?? "Dialog"}
                  </span>
                  <p className="font-serif text-base text-amber-50 sm:text-lg">„{dialogue.text}“</p>
                </>
              ) : (
                <p className="font-serif text-base text-amber-50 sm:text-lg">{scene.narration}</p>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
