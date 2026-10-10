# https://nomomarket.netlify.app/

# Development

- Clone the repo
- Run `pnpm install`
- Run `pnpm run develop` to launch a local dev-server at http://localhost:12000/ with live reload

The sandbox is remote, so `localhost` is not reachable from outside. Port 12000 is pre-exposed by OpenHands, so the running app is visible at the work-host URL printed in the environment, e.g. https://work-1-xbvjadjarafueilw.prod-runtime.all-hands.dev/

If you change translations in JSON-files, then you might need to repeat `pnpm run develop`.

# Tech Stack

- Next.js / React, all TypeScript, client-rendered
- Tailwind CSS
- pnpm as the package manager

# OpenHands

Issues can be submitted into OpenHands instead of being implemented by hand.
OpenHands then works on the issue and automatically creates a pull request containing:

- before/after screenshots for UI changes,
- the steps to verify the change.

For every new chat, select the workspace `nomomarket` in the workspace selector instead of "No workspace" —
otherwise the agent starts without this repo.

<img src="doc/images/openhands-new-chat.jpg" width="300"> <img src="doc/images/openhands-workspace-dropdown.jpg" width="300">

The agent rules for this repo are in [AGENTS.md](AGENTS.md).

# URL Parameters

Available query parameters are documented in [doc/availableURLParameters.md](doc/availableURLParameters.md).
