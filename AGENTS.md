# AGENTS.md

https://nomomarket.netlify.app/

## Pull Requests

Always open PRs towards the upstream repo (`fkirc/openhands-workshop`), never towards the fork.

## Development

- Clone the repo
- Run `pnpm install`
- Run `pnpm run develop` to launch a local dev-server at http://localhost:12000/ with live reload

## Tech Stack

- Next.js / React, TypeScript, client-rendered
- Tailwind CSS
- pnpm (use `pnpm`, not raw `npm`)

## UI verification (Playwright)
The `develop` script serves on port 12000:

```bash
corepack pnpm run develop
```

If 12000 already answers, reuse it instead of starting a second server.

`allowedDevOrigins` in `next.config.ts` must allow the work-host domain (`*.prod-runtime.all-hands.dev`). If it is pinned to a single ephemeral subdomain, the dev server blocks its own HMR/dev resources for every other sandbox: the page still renders, but never hydrates, so no client component (dropdowns, filters, etc.) responds to clicks. After changing `allowedDevOrigins`, restart the dev server.

The sandbox is remote, so `http://localhost:12000/` is NOT reachable for the user (and a preview-URL of it would not be usable). Port 12000 is pre-exposed by OpenHands under the work-host URL from the environment, so provide that preview-URL within your PRs, e.g. `https://<identifier>.prod-runtime.all-hands.dev/`.

Tooling: Playwright is a devDependency; its browser binaries are not, so run `pnpm exec playwright install chromium` once if `~/.cache/ms-playwright` is empty; run its CLI directly, e.g. `pnpm exec playwright screenshot <url> <out.png>`. Only write an ad-hoc Node script when a task needs chained interactions (clicks, downloads) beyond what the CLI covers.

Navigation:
- Reach the relevant page state by direct route and URL-parameter navigation. Prefer encoding reproducible state in the URL over click-navigation whenever the app supports it — it costs fewer tokens and makes the steps easy to repeat.
- Fall back to UI interactions only for state that cannot be set directly via the URL.

Procedure for verifying a change:
1. Before the change, screenshot the page in the state you are about to modify (the baseline).
2. Make the change.
3. After the change, screenshot the same state.
4. Verify whether the goal has been reached.
5. If yes, compare the before/after screenshots to detect unwanted UI side effects elsewhere on the page.

If a screenshot shows the wrong state, iterate with targeted navigation or interaction only while the screenshots are still adding evidence. Stop once the goal is confirmed, or once the loop is becoming fruitless and likely to waste screenshots or tokens.

Never use a Playwright MCP server (or similar browser-automation MCP) for this — always prefer the CLI/script approach above.

Hydration gotchas (cost real time, learn from them):
- `allowedDevOrigins` in `next.config.ts` must cover the work-host URL, or the dev server blocks its own client resources and the page never hydrates: buttons stay dead even though clicks reach the DOM. It currently uses the wildcard `**.prod-runtime.all-hands.dev`.
- Do NOT stub `Math.random` in `page.addInitScript` to make a page deterministic. Overriding it before the Next.js dev client boots breaks hydration (same dead-click symptom). Seed randomness only after the app is interactive, or read the value under test from the rendered DOM instead.
- A slow first paint in `next dev` can look like a dead page; poll by actually clicking until state changes before concluding a click handler is broken.

Retention of screenshots:
Place the screenshots into the folder <before-after/name-of-issue/before-iso-date.png> and <before-after/name-of-issue/after-iso-date.png>

## Dependency Hygiene and Security

No new packages!!
If a task looks difficult, do not go for a radical goal-achieval-quest that involves downloading untrusted npm packages or Python scripts.
Instead, make a hardstop and notify the user if a task cannot be accomplished with the existing packages and without any crazy workarounds.

## Documentation style

In PR-descriptions and other places, follow this style: Short, precise, and close to the prompt-author. The original writing style of the author should still be "felt" even after you translate a prompt into a PR-description.

Do not bloat up PR-descriptions by making a bunch of assumptions. An incomplete description is better than a bloated description with freely invented assumptions.

What should never be missing:

- a link to a working preview-URL (remember that localhost is not reachable from the outside)
- before/after screenshots in the PR-description if needed.

## Apps in this repo

Apps live as routes under `src/app/<app>/` and are registered in `src/data/apps.ts`.
The route needs `output: "export"`-friendly, client-rendered React.

### ShadowTales (`/shadowtales`)

A personalisable, interactive shadow theatre. See [SHADOWTALES.md](SHADOWTALES.md).

- Domain code in `src/lib/shadowtales/` (types, style presets, demo stories,
  rule-based generator, "what-if" variants, localStorage store).
- UI in `src/components/shadowtales/` (TheaterPlayer, SceneRenderer,
  CharacterSilhouette, CharacterEditor, StoryForm, Timeline, StyleSelector,
  SceneEditor, WhatIfPanel, StageBackdrop, StageEffects).
- Theatre CSS animations live in `src/app/shadowtales/shadowtales.css`.
- State is in the URL (`?view=`, `?story=`, `?scene=`), so pages are reproducible
  for screenshots and Playwright.
- Verify flows with Playwright scripts; the demo and an interactive example are
  seeded into localStorage on first load.
