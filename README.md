# https://nomomarket.netlify.app/

A marketplace for mini-apps; inspired by the Nomo WebOn marketplace.

The workflow in this repo uses Cloud Agents (with OpenHands), with self-correcting web-dev-agents based on screenshots.
Deliverables are made with human-inspectable before-after-screenshots and with preview-URls.

# Development

- Clone the repo
- Run `pnpm install`
- Run `pnpm run develop` to launch a local dev-server at http://localhost:12000/ with live reload

The sandbox is remote, so `localhost` is not reachable from outside. Port 12000 is pre-exposed by OpenHands, so the running app is visible at the work-host URL printed in the environment, e.g. https://<identifier>.prod-runtime.all-hands.dev/

# Tech Stack

- Next.js / React, all TypeScript, client-rendered
- Tailwind CSS
- pnpm as the package manager

# OpenHands

Issues can be submitted into OpenHands.
OpenHands then works on the issue and creates a pull request containing:

- before/after screenshots for UI changes,
- the steps to verify the change.

The agent rules for this repo are in [AGENTS.md](AGENTS.md).
