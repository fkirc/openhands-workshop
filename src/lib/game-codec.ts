/**
 * Encodes a game of Snakes & Ladders into a URL-safe string, and back.
 *
 * The site is a static export with no server, so there is nothing to sync two
 * devices through. Instead the whole game state travels inside the invitation
 * link: anyone who opens it lands in the same game, on the same turn.
 */

export const MAX_PLAYERS = 4;
export const TOTAL = 100;
const MAX_GLYPHS = 60;
const MAX_NAME = 14;
const VERSION = "1";

/** One seat at the table, in the compact form the link carries. */
export interface GamePlayer {
  name: string;
  square: number;
  rolls: number;
  ladders: number;
  snakes: number;
  /** One character per roll: `m`ove, `l`adder, `s`nake. */
  glyphs: string;
}

export interface GameState {
  players: GamePlayer[];
  turn: number;
  /** Index of the winner, or null while the game is running. */
  winner: number | null;
}

export const defaultName = (i: number) => ["Anna", "Sepp", "Lisi", "Ferdl"][i] ?? `Player ${i + 1}`;

/** Names ride inside the link, so strip the field separators and cap the length. */
export function cleanName(raw: string, fallback: string) {
  const cleaned = raw.replace(/[|,;\s]+/g, " ").trim().slice(0, MAX_NAME);
  return cleaned || fallback;
}

export function freshState(count: number): GameState {
  return {
    players: Array.from({ length: count }, (_, i) => ({
      name: defaultName(i),
      square: 0,
      rolls: 0,
      ladders: 0,
      snakes: 0,
      glyphs: "",
    })),
    turn: 0,
    winner: null,
  };
}

const clampInt = (raw: string | undefined, min: number, max: number, fallback: number) => {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
};

function encodeBase64Url(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64Url(text: string) {
  const b64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeGame(state: GameState) {
  const players = state.players
    .map((p) =>
      [
        p.name.replace(/[|,;]/g, " "),
        p.square,
        p.rolls,
        p.ladders,
        p.snakes,
        p.glyphs.slice(-MAX_GLYPHS).replace(/[^mls]/g, ""),
      ].join(","),
    )
    .join(";");
  const plain = [VERSION, state.turn, state.winner ?? -1, players].join("|");
  return encodeBase64Url(plain);
}

/** Decode a link payload. Returns null for anything malformed. */
export function decodeGame(raw: string | null | undefined): GameState | null {
  if (!raw) return null;
  try {
    const parts = decodeBase64Url(raw).split("|");
    if (parts.length < 4 || parts[0] !== VERSION) return null;

    const turn = clampInt(parts[1], 0, MAX_PLAYERS - 1, 0);
    const winnerRaw = clampInt(parts[2], -1, MAX_PLAYERS - 1, -1);

    const players = parts[3]
      .split(";")
      .slice(0, MAX_PLAYERS)
      .map((chunk, i) => {
        const f = chunk.split(",");
        return {
          name: cleanName(f[0] ?? "", defaultName(i)),
          square: clampInt(f[1], 0, TOTAL, 0),
          rolls: clampInt(f[2], 0, 10000, 0),
          ladders: clampInt(f[3], 0, 1000, 0),
          snakes: clampInt(f[4], 0, 1000, 0),
          glyphs: (f[5] ?? "").replace(/[^mls]/g, "").slice(-MAX_GLYPHS),
        };
      });

    if (players.length < 2) return null;

    const winner = winnerRaw >= 0 && winnerRaw < players.length ? winnerRaw : null;
    return { players, turn: turn < players.length ? turn : 0, winner };
  } catch {
    return null;
  }
}
