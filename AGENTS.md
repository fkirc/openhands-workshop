# AGENTS.md

https://gcci.earth/

## Development

- Clone the repo
- Run `pnpm install`
- Run `pnpm run develop` to launch a local dev-server at http://localhost:8100/ with live reload

If you change translations in JSON-files, then you might need to repeat `pnpm run develop`.

## OpenHands

Our OpenHands instance runs at https://openhands.gcci.dev/.
Login works over whitelisted mail addresses — if yours is not whitelisted yet, ask for it to be added.

Issues can be submitted into OpenHands instead of being implemented by hand.
OpenHands then works on the issue and automatically creates a merge request containing:

- before/after screenshots for UI changes,
- the steps to verify the change.

For every new chat, select the workspace `gccivis` in the workspace selector instead of "No workspace" —
otherwise the agent starts without this repo.

<img src="doc/images/openhands-new-chat.jpg" width="300"> <img src="doc/images/openhands-workspace-dropdown.jpg" width="300">

## Codebase map (TypeScript)
- Main app code lives in `src/` (`components/`, `pages/`, `data/`, `utils/`, `routes.ts`).
- Many files in `src/pages/` are thin re-export wrappers; shared page logic is usually in `src/components/`.
- Shared JSON shape/type declarations are in `src/data/json-structure.ts` and `declarations.d.ts`.

## Architecture notes
- App state is centralized in `src/data/redux-state.ts`; route-driven indicator switching is in `src/data/indicator-class.ts`.
- JSON lookup mappings are in `src/data/variable-list.js` (JavaScript). Keep TypeScript changes compatible with this JS module unless a task explicitly includes migrating it.

## Context-loading rules
- Do not load JSON into context by default; load JSON only when it is required for the current task.

## Build verification
- After any non-trivial TypeScript modification, run `pnpm exec tsc`.
- After any page modification (files under `src/pages/`), run `pnpm exec tsc && gatsby build`.

## UI verification (Playwright)
The `develop` script serves on port 8100, so screenshot against `http://localhost:8100/`:

```bash
corepack pnpm run develop
```

If 8100 already answers, reuse it instead of starting a second server.

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

Never use a Playwright MCP server (or similar browser-automation MCP) for this — always the CLI/script approach above.

Retention of screenshots:
Place the screenshots into the folder <before-after/name-of-issue/before-iso-date.png> and <before-after/name-of-issue/after-iso-date.png>
Those screenshots should be committed into git after manual approval!

## Change focus
- Keep edits minimal and targeted.
- Prefer changing canonical shared components over duplicative page wrappers when behavior should apply across routes.
- Do not change generated output under `public/` manually, because those JSONs are served from other systems and will be overwritten frequently.

## Committing and pushing
Never push to `develop` and never wait to be asked, even if someone is watching the session. Deliver finished work as a merge request so a human can review the diff.

1. **Branch** off `develop`, never off whatever branch happens to be checked out, and fetch first so the base is current: `git fetch origin && git switch -c openhands/<short-task-slug> origin/develop`.
2. **Verify first.** Run the checks the change calls for (`corepack pnpm exec tsc`, plus `gatsby build` for anything under `src/pages/`, plus the Playwright before/after screenshots for UI changes). If verification fails, stop and report — do not open an MR for unverified work.
3. **Commit**, including the `before-after/` screenshots for UI changes.
4. **Open the MR.** The GitLab PAT is already in the push remote:
   ```bash
   git push -u origin HEAD
   TOK=$(git remote get-url origin | sed -n 's#.*oauth2:\([^@]*\)@.*#\1#p')
   curl -s -X POST -H "PRIVATE-TOKEN: $TOK" \
     --data-urlencode "source_branch=$(git branch --show-current)" \
     --data-urlencode "target_branch=develop" \
     --data-urlencode "title=<type>: <short summary>" \
     --data-urlencode "description=$(cat /tmp/mr-body.md)" \
     --data-urlencode "remove_source_branch=true" \
     "https://wegcgitlab.uni-graz.at/api/v4/projects/arsclisys%2Fgcci%2Fgccivis/merge_requests" | jq -r '.web_url'
   ```
5. **Report** the MR URL in your final message.

Write the MR description according to "Documentation style" below.

## Dependency Hygiene and Security

No new packages!!
If a task looks difficult, do not go for a radical goal-achieval-quest that involves downloading untrusted npm packages or Python scripts.
Instead, make a hardstop and notify the user if a task cannot be accomplished with the existing packages and without any crazy workarounds.

## Documentation style

In MR-descriptions and other places, follow this style: Short, precise, and close to the prompt-author. The original writing style of the author should still be "felt" even after you translate a prompt into an MR-description.

Do not bloat up MR-descriptions by making a bunch of assumptions. An incomplete description is better than a bloated description with freely invented assumptions.

What should never be missing:
- the steps to verify the MR,
- before/after screenshots in the MR-description if needed.

## Reporting progress in GitLab-comments

Do NOT dump in a long, bloated AI-typical description of everything in detail what you did.
Instead, write only one or two sentence per action-point together with the respective images "before" and "after".

## URL Parameters

Available query parameters are documented in [doc/availableURLParameters.md](doc/availableURLParameters.md).

## JSON Updates

Updates of JSON-files should comply with the following procedure to ensure traceability and auditability:

- Replace selected JSONs within the subfolder `static`.
- Run `./scripts/prettify_json_assets.sh` to ensure that newly added JSONs have a standardized format with readable linebreaks.
- Optionally, edit `variable-list.js` if JSONs have been renamed or moved to a different sub-sub-folder.
- For small changes, make a Git-commit where the deletion of old JSONs and addition of new JSONs happens within the same commit. This makes it possible to see on GitLab what has changed in a specific commit.
- Push the Git-commit; review changes before deploying into production.

## Techstack

We use _React_ to build the UI and _D3.js_ to create the charts.

We use _Gatsby_ as a build-system to generate static sites.
Static site generation is helpful to optimize GCCI for search engines.
Therefore, we deliberately chose to _not_ build a single-page-application with toolchains like create-react-app.

A Gatsby Strapi boilerplate was used to bootstrap the stack. The stack includes:

- [Bootstrap](https://getbootstrap.com/)
- [Reactstrap](https://reactstrap.github.io/)
- [Reactstrap-form-fields](https://github.com/jeremylynch/reactstrap-form-fields)
- [Reactstrap-json-nav](https://github.com/jeremylynch/reactstrap-json-nav)
- [React Icons](https://github.com/react-icons/react-icons)
- [Google Tag Manager](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-google-tagmanager)
- [gatsby-plugin-netlify](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-netlify)
- [gatsby-plugin-google-tagmanager](https://www.gatsbyjs.org/packages/gatsby-plugin-google-tagmanager/)
- [gatsby-plugin-facebook-pixel](https://www.gatsbyjs.org/packages/gatsby-plugin-facebook-pixel)
- [gatsby-plugin-manifest](https://www.gatsbyjs.com/plugins/gatsby-plugin-manifest/)
- [gatsby-plugin-styled-components](https://www.gatsbyjs.org/packages/gatsby-plugin-styled-components/)

[View Gatsby Demo](https://gatsby-strapi-starter.netlify.com/)
