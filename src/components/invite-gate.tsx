"use client";

import { useMemo, useSyncExternalStore } from "react";
import { SnakesAndLadders } from "./snakes-and-ladders";
import { decodeGame } from "@/lib/game-codec";

const noopSubscribe = () => () => {};

/** The `?g=` payload, read after hydration without an effect or a mismatch. */
function useGameParam() {
  return useSyncExternalStore(
    noopSubscribe,
    () => new URLSearchParams(window.location.search).get("g") ?? "",
    () => "",
  );
}

/**
 * Decides whether the visitor brought a game with them. An invitation link
 * carries the whole state, so opening it resumes that exact game; `key` forces
 * a clean remount when a different link is opened.
 */
export function InviteGate() {
  const param = useGameParam();
  const initial = useMemo(() => decodeGame(param), [param]);

  return <SnakesAndLadders key={param || "fresh"} initial={initial} invited={initial !== null} />;
}
