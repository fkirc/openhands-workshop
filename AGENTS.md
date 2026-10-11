# AGENTS.md

https://nomomarket.netlify.app/

## Pull Requests

Always open PRs towards the upstream repo (`fkirc/openhands-workshop`), never towards the fork.

## Development

- Run `pnpm install`
- Run `pnpm run develop` to launch a local dev-server at http://localhost:12000/ with live reload

## Tech Stack

- Next.js / React, TypeScript, client-rendered
- Tailwind CSS
- pnpm (use `pnpm`, not raw `npm`)

## UI verification (Playwright)
If port 12000 already answers, reuse that dev server instead of starting a second one.

`localhost` is NOT reachable for the user. Port 12000 is exposed under the work-host URL, so link that in PRs, e.g. `https://<identifier>.prod-runtime.all-hands.dev/`.

Tooling: Playwright is a devDependency; its browser binaries are not, so run `pnpm exec playwright install chromium` once if `~/.cache/ms-playwright` is empty; run its CLI directly, e.g. `pnpm exec playwright screenshot <url> <out.png>`. Only write an ad-hoc Node script when a task needs chained interactions (clicks, downloads) beyond what the CLI covers.

Navigation: reach page state via route and URL params; fall back to clicks only for state the URL can't set.

Verifying a change: screenshot the same state before and after, check the goal is reached, then compare for unwanted side effects. Stop iterating once screenshots stop adding evidence.

Never use a Playwright MCP server (or similar browser-automation MCP) for this — always prefer the CLI/script approach above.

Hydration gotchas (cost real time, learn from them):
- Don't stub `Math.random` in `page.addInitScript`; it breaks hydration. Read random values from the DOM instead.
- A slow first paint in `next dev` can look like a dead page; poll by actually clicking until state changes before concluding a click handler is broken.

Retention of screenshots:
Place the screenshots into the folder <before-after/name-of-issue/before-iso-date.png> and <before-after/name-of-issue/after-iso-date.png>

## Dependency Hygiene and Security

No new packages!! If a task cannot be accomplished with the existing packages and without crazy workarounds, make a hardstop and notify the user.

## Documentation style

In PR-descriptions and other places: short, precise, and close to the prompt-author's own writing style. An incomplete description is better than one bloated with freely invented assumptions.

What should never be missing:

- a link to a working preview-URL
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
