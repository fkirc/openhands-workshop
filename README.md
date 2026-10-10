# https://nomomarket.netlify.app/

# Development

- Clone the repo
- Run `pnpm install`
- Run `pnpm run develop` to launch a local dev-server at http://localhost:8100/ with live reload

If you change translations in JSON-files, then you might need to repeat `pnpm run develop`.

# OpenHands

Login works over whitelisted mail addresses — if yours is not whitelisted yet, ask for it to be added.

Issues can be submitted into OpenHands instead of being implemented by hand.
OpenHands then works on the issue and automatically creates a merge request containing:

- a link to the Netlify preview deployment of that branch,
- before/after screenshots for UI changes,
- the steps to verify the change.

For every new chat, select the workspace `nomomarket` in the workspace selector instead of "No workspace" —
otherwise the agent starts without this repo.

<img src="doc/images/openhands-new-chat.jpg" width="300"> <img src="doc/images/openhands-workspace-dropdown.jpg" width="300">

The agent rules for this repo are in [AGENTS.md](AGENTS.md).

# URL Parameters

Available query parameters are documented in [doc/availableURLParameters.md](doc/availableURLParameters.md).

# Deployment

Nothing deploys to production automatically. Every deploy is a Netlify draft:

- pushes to `develop` are deployed as a draft by the GitLab pipeline,
- feature branches are deployed as a draft by OpenHands, linked from the merge request,
- promotion to https://nomomarket.netlify.app/ happens manually in Netlify.

Deployments can also be triggered manually by running `pnpm run deploy`.
To preview deployments, log into Netlify and navigate to https://app.netlify.com/sites/nomomarket/deploys.
Click on "Publish deploy" to publish a specific deployment to https://nomomarket.netlify.app/.

# JSON Updates

Updates of JSON-files should comply with the following procedure to ensure traceability and auditability:

- Replace selected JSONs within the subfolder `static`.
- Run `./scripts/prettify_json_assets.sh` to ensure that newly added JSONs have a standardized format with readable linebreaks.
- Optionally, edit `variable-list.js` if JSONs have been renamed or moved to a different sub-sub-folder.
- For small changes, make a Git-commit where the deletion of old JSONs and addition of new JSONs happens within the same commit. This makes it possible to see on GitLab what has changed in a specific commit.
- Push the Git-commit; review changes before deploying into production.
