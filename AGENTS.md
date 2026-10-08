# AGENTS.md

## What this is
Static, dependency-free frontend: `index.html` + `styles.css` + `script.js`, `storage.js`,
`utils.js`. Plain `<script src>` (not ES modules), all state in `localStorage`. There is no
backend, no build step, no database, and no external service — so the app needs **no secrets**.

## Running it
```
docker compose -f docker-compose.base44.yml up -d --build   # web entry point: http://localhost:3000
```
- A `node:22-alpine` container bind-mounts the repo at `/app` and runs the **Vite dev server**
  (`npm run dev`, host `0.0.0.0`, port 3000) straight from source, so edits to the HTML/CSS/JS
  hot-reload. Vite is a dev-server dependency only — it does not build or transform the app;
  no app code was changed to accommodate it.
- `node_modules` lives in the named volume `node_modules` (not in the repo). `npm install`
  runs on container start, so a fresh clone needs no manual install.

## Quirks
- `vite.config.js` sets `server.allowedHosts` to `.${BASE44_SANDBOX_HOST_DOMAIN}` **only** when
  `BASE44_PREVIEW_MODE === '1'`. The preview proxy forwards the sandbox hostname as the `Host`
  header and Vite rejects unknown hosts ("Blocked request"). With the flag unset, Vite's default
  host handling applies unchanged. Do not hardcode a resolved host name here.
- `index.html` links `manifest.json`, which does not exist in the repo (pre-existing). Browsers
  log a 404 for it; it does not affect the app.

## Verifying
- `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/` → `200`, and the HTML contains
  `/@vite/client` (confirms the dev server, not a prebuilt bundle).
- Behaviour is client-side only: add a task via the input + "➕ Add", toggle its checkbox, then
  reload the page — the task persists in `localStorage` under the key `todoAppData`.
