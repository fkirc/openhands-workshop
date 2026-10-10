# AGENTS.md

https://nomomarket.netlify.app/

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
- the steps to verify the PR,
- before/after screenshots in the PR-description if needed.
