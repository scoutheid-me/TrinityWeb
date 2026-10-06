# Permanent Trinity play address

https://scoutheid-me.github.io/TrinityWeb/

Bookmark this URL, or open `Play Trinity.url` in the repository folder. No local terminal or running development server is needed. Refresh after a deployment finishes to receive the new version. A running session is never forcibly reloaded during combat.

## Automatic releases

Pushing to `main` starts `.github/workflows/pages.yml`. It installs locked dependencies, runs all unit tests, builds the public playtest at `/TrinityWeb/`, runs a Chromium browser smoke test against that project path, and deploys to GitHub Pages. Failed checks leave the previous successful deployment available. The workflow can also be started manually under GitHub Actions → Publish Trinity.

Only the compiled `dist-pages` directory is published. GM and development automation are excluded. Runtime asset URLs honor Vite's base path and include the commit revision to avoid mixing old cached models with new code. Settings display the published commit's short revision. Do not upload source folders as the Pages artifact.

Local checks: `npm run build:pages`, then `npm run test:pages`. The normal local development URL remains http://127.0.0.1:5173/ and root-level builds still work.

Progress stays in the current browser's local storage/IndexedDB, not an online account. To transfer existing localhost progress, use paused settings → Comfort, calibration & saves → Download save backup, then import that backup at the permanent address. Switching browsers/devices also requires that export/import step.

Hosting follows GitHub's official custom workflow: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages . Hosting settings are under repository Settings → Pages, source GitHub Actions. Do not change repository visibility or introduce paid hosting without authorization.

The public build includes `version.json`. Clients check on focus and once per minute; a newer revision exposes Save & update game in the system menu. Existing clients keep running their loaded code until refreshed. Never claim an already-open tab automatically received a deployment.
