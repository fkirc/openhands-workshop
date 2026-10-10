# https://nomomarket.netlify.app/

A marketplace for mini-apps; inspired by the Nomo WebOn marketplace.

The workflow in this repo uses Cloud Agents (with OpenHands), with self-correcting web-dev-agents based on screenshots.
Deliverables are made with human-inspectable before-after-screenshots and with preview-URls.

# Workshop Setup

- Fork this repo ( click on "Fork" in the repo https://github.com/fkirc/openhands-workshop ).
- Log into https://app.all-hands.dev/login by using your GitHub-account (note: this step will create a new account on OpenHands when you do it for the first time).
- Follow the steps in https://app.all-hands.dev/ to verify your GitHub-mail and accept their terms of service
- Navigate to https://app.all-hands.dev/settings/integrations to configure the GitHub-integration, then select the repo that you forked before, and click on "Authorize" to allow OpenHands to access that repo.
- Open a new Conversation with OpenHands and select the repo (starting at the main-branch).
- Now OpenHands is ready to accept tasks!

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
