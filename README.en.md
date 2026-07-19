# Old Dragon API — Node.js Demo

🇧🇷 [Versão em português](README.md)

Example Express application (built with express-generator) demonstrating how to
integrate with the [Old Dragon API](https://github.com/olddragoneditora/olddragon-api)
using OAuth 2.0 + PKCE: login, reading user data, and one write.

You can use the live app at
[olddragon-api-nodejs-demo.fly.dev](https://olddragon-api-nodejs-demo.fly.dev) —
or fork this project and adapt it to your own application, deploying it
yourself (see "Deploy" below).

## What this demo shows

- **OAuth 2.0 login with PKCE (S256)** — the standard authorization code flow
  for a web app (confidential client, `client_secret` never reaches the
  browser), no device flow needed.
- **Reads (`content.read`)**: lists the authenticated user's campaigns
  (`GET /campanhas.json`) and characters (`GET /personagens.json`), and shows a
  character's detail page (`GET /personagens/:id.json`).
- **Write (`content.write`)**: a form on the character page sends
  `PATCH /personagens/:id.json` to update current HP.
- **Token refresh**: on a plain 401 (expired token), the app exchanges the
  refresh token for a new access token and retries the call once before
  giving up and sending the user back to `/login`. A 401 for insufficient
  scope (`insufficient_scope`) is never treated as an expired token — it's
  shown as an on-screen error message instead.

## Features

- OAuth 2.0 authentication with PKCE
- Campaign and character listing + detail
- Updating a character's HP (a write to the API)
- Portuguese UI using EJS templates (the app's screens are Portuguese-only;
  this README is the English reference)

## Requirements

- Node.js 24 or higher (current LTS)
- An Old Dragon account (olddragon.com.br)
- OAuth application Client ID and Client Secret

## Getting OAuth credentials

Register your application at
[olddragon.com.br/conta/aplicativos](https://olddragon.com.br/conta/aplicativos)
(self-service, no manual approval needed). Request the `openid`, `email`,
`content.read`, `content.write` and `offline_access` scopes, and provide the
callback URL (`http://localhost:8080/callback` for local development).

More details at [github.com/olddragoneditora/olddragon-api](https://github.com/olddragoneditora/olddragon-api).

## Scopes used

| Scope | Usage |
|---|---|
| `openid`, `email` | Identifies the logged-in user |
| `content.read` | Required for every read (`GET`): campaigns, characters |
| `content.write` | Required for the HP update (`PATCH`) |
| `offline_access` | Issues a refresh token so the access token can be renewed without a new login |

## Running locally

1. Clone this project
2. Install dependencies: `npm install`
3. Set the environment variables:

```bash
export CLIENT_ID="your_client_id"
export CLIENT_SECRET="your_client_secret"
export SESSION_SECRET="your_session_secret_key"
export CALLBACK_URL="http://localhost:8080/callback"
```

4. Run: `npm start`
5. Open: http://localhost:8080

## Environment Variables

| Variable | Description |
|---|---|
| `CLIENT_ID` | Old Dragon OAuth application ID |
| `CLIENT_SECRET` | Old Dragon OAuth application secret |
| `SESSION_SECRET` | Session signing secret |
| `CALLBACK_URL` | OAuth callback URL (e.g. `http://localhost:8080/callback`) |
| `OLDDRAGON_BASE_URL` | Optional, defaults to `https://olddragon.com.br` — useful to point at another environment |
| `PORT` | Optional, defaults to `8080` |

## Deploy

Deployment runs on [Fly.io](https://fly.io) via GitHub Actions
(`.github/workflows/fly-deploy.yml`), triggered on every push to `main` (or
manually from the Actions tab, via `workflow_dispatch`). You need to set the
`FLY_API_TOKEN` secret in the repository settings.

To deploy your own copy:

```sh
fly launch
fly secrets set CLIENT_ID="your_client_id"
fly secrets set CLIENT_SECRET="your_client_secret"
fly secrets set CALLBACK_URL="https://your-app.fly.dev/callback"
fly secrets set SESSION_SECRET="make_up_a_random_secret_key_here"
fly deploy
```

**Note**: the app uses `express-session`'s default in-memory session store.
That's fine for this demo (single machine, only holds short-lived OAuth
tokens), but it doesn't scale across multiple instances — a real production
app should use a persistent store (Redis, Postgres, etc).

## Structure

- `app.js`: Main Express setup and the OAuth2 strategy
- `lib/oldDragonApi.js`: Standard headers and the request wrapper with token refresh
- `routes/index.js`: Home, login, callback, logout
- `routes/personagens.js`: Character listing, detail, and HP update
- `views/`: EJS templates (Portuguese-only UI)
- `bin/www`: Server startup script
