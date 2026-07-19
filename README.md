# Old Dragon API — Demo Node.js / Node.js Demo

Exemplo de aplicação Express (criada com o express-generator) que demonstra como
integrar com a [API do Old Dragon](https://github.com/olddragoneditora/olddragon-api)
usando OAuth 2.0 + PKCE: login, leitura de dados do usuário e uma escrita.

Example Express application (built with express-generator) demonstrating how to
integrate with the [Old Dragon API](https://github.com/olddragoneditora/olddragon-api)
using OAuth 2.0 + PKCE: login, reading user data, and one write.

Você pode acessar a aplicação em produção em
[olddragon-api-nodejs-demo.fly.dev](https://olddragon-api-nodejs-demo.fly.dev) —
ou fazer _fork_ deste projeto e adaptá-lo para a sua própria aplicação, fazendo
deploy você mesmo (veja "Deploy" abaixo).

You can use the live app at
[olddragon-api-nodejs-demo.fly.dev](https://olddragon-api-nodejs-demo.fly.dev) —
or fork this project and adapt it to your own application, deploying it
yourself (see "Deploy" below).

## O que este demo mostra / What this demo shows

- **Login via OAuth 2.0 com PKCE (S256)** — fluxo padrão de authorization code
  em uma aplicação web (client confidencial, `client_secret` fica só no
  servidor), sem precisar de device flow.
  **OAuth 2.0 login with PKCE (S256)** — the standard authorization code flow
  for a web app (confidential client, `client_secret` never reaches the
  browser), no device flow needed.
- **Leitura (`content.read`)**: lista as campanhas (`GET /campanhas.json`) e os
  personagens (`GET /personagens.json`) do usuário autenticado, e mostra o
  detalhe de um personagem (`GET /personagens/:id.json`).
  **Reads (`content.read`)**: lists the authenticated user's campaigns
  (`GET /campanhas.json`) and characters (`GET /personagens.json`), and shows a
  character's detail page (`GET /personagens/:id.json`).
- **Escrita (`content.write`)**: um formulário na página do personagem faz
  `PATCH /personagens/:id.json` para atualizar os PV atuais.
  **Write (`content.write`)**: a form on the character page sends
  `PATCH /personagens/:id.json` to update current HP.
- **Renovação de token**: em um 401 comum (token expirado), a aplicação troca o
  refresh token por um novo access token e repete a chamada uma vez antes de
  desistir e mandar o usuário de volta para `/login`. Um 401 por escopo
  insuficiente (`insufficient_scope`) nunca é tratado como token expirado — é
  mostrado como mensagem de erro na tela.
  **Token refresh**: on a plain 401 (expired token), the app exchanges the
  refresh token for a new access token and retries the call once before
  giving up and sending the user back to `/login`. A 401 for insufficient
  scope (`insufficient_scope`) is never treated as an expired token — it's
  shown as an on-screen error message instead.

## Funcionalidades / Features

- Autenticação OAuth 2.0 com PKCE / OAuth 2.0 authentication with PKCE
- Listagem e detalhe de campanhas e personagens / Campaign and character listing + detail
- Atualização de PV de um personagem (escrita na API) / Updating a character's HP (a write to the API)
- Interface bilíngue (PT/EN) usando templates EJS / Bilingual (PT/EN) UI using EJS templates

## Requisitos / Requirements

- Node.js 24 ou superior (LTS atual) / Node.js 24 or higher (current LTS)
- Conta no Old Dragon (olddragon.com.br) / An Old Dragon account (olddragon.com.br)
- Client ID e Client Secret de uma aplicação OAuth / OAuth application Client ID and Client Secret

## Como obter credenciais OAuth / Getting OAuth credentials

Cadastre sua aplicação em
[olddragon.com.br/conta/aplicativos](https://olddragon.com.br/conta/aplicativos)
(o cadastro é self-service, sem aprovação manual). Peça os escopos `openid`,
`email`, `content.read`, `content.write` e `offline_access`, e informe a URL de
callback (`http://localhost:8080/callback` em desenvolvimento).

Register your application at
[olddragon.com.br/conta/aplicativos](https://olddragon.com.br/conta/aplicativos)
(self-service, no manual approval needed). Request the `openid`, `email`,
`content.read`, `content.write` and `offline_access` scopes, and provide the
callback URL (`http://localhost:8080/callback` for local development).

Mais detalhes em [github.com/olddragoneditora/olddragon-api](https://github.com/olddragoneditora/olddragon-api).
More details at [github.com/olddragoneditora/olddragon-api](https://github.com/olddragoneditora/olddragon-api).

## Escopos usados / Scopes used

| Escopo / Scope | Uso / Usage |
|---|---|
| `openid`, `email` | Identifica o usuário logado / Identifies the logged-in user |
| `content.read` | Exigido em toda leitura (`GET`): campanhas, personagens / Required for every read (`GET`): campaigns, characters |
| `content.write` | Exigido para a atualização de PV (`PATCH`) / Required for the HP update (`PATCH`) |
| `offline_access` | Emite um refresh token para renovar o access token sem novo login / Issues a refresh token so the access token can be renewed without a new login |

## Rodando localmente / Running locally

1. Clone este projeto / Clone this project
2. Instale as dependências / Install dependencies: `npm install`
3. Configure as variáveis de ambiente / Set the environment variables:

```bash
export CLIENT_ID="seu_client_id"
export CLIENT_SECRET="seu_client_secret"
export SESSION_SECRET="sua_chave_secreta_sessao"
export CALLBACK_URL="http://localhost:8080/callback"
```

4. Execute / Run: `npm start`
5. Acesse / Open: http://localhost:8080

## Variáveis de Ambiente / Environment Variables

| Variável / Variable | Descrição / Description |
|---|---|
| `CLIENT_ID` | ID da aplicação OAuth do Old Dragon / Old Dragon OAuth application ID |
| `CLIENT_SECRET` | Secret da aplicação OAuth do Old Dragon / Old Dragon OAuth application secret |
| `SESSION_SECRET` | Chave secreta para sessões / Session signing secret |
| `CALLBACK_URL` | URL de callback OAuth (ex: `http://localhost:8080/callback`) / OAuth callback URL |
| `OLDDRAGON_BASE_URL` | Opcional, padrão `https://olddragon.com.br` — útil para apontar para outro ambiente / Optional, defaults to `https://olddragon.com.br` — useful to point at another environment |
| `PORT` | Opcional, padrão `8080` / Optional, defaults to `8080` |

## Deploy

O deploy é feito no [Fly.io](https://fly.io) via GitHub Actions
(`.github/workflows/fly-deploy.yml`), disparado a cada push na branch `main`
(ou manualmente pela aba Actions, via `workflow_dispatch`). É preciso
configurar o secret `FLY_API_TOKEN` nas configurações do repositório.

Deployment runs on [Fly.io](https://fly.io) via GitHub Actions
(`.github/workflows/fly-deploy.yml`), triggered on every push to `main` (or
manually from the Actions tab, via `workflow_dispatch`). You need to set the
`FLY_API_TOKEN` secret in the repository settings.

Para fazer deploy da sua própria cópia / To deploy your own copy:

```sh
fly launch
fly secrets set CLIENT_ID="seu_client_id"
fly secrets set CLIENT_SECRET="seu_client_secret"
fly secrets set CALLBACK_URL="https://seu-app.fly.dev/callback"
fly secrets set SESSION_SECRET="invente_uma_chave_secreta_aleatoria_aqui"
fly deploy
```

**Nota**: a aplicação usa o *session store* padrão em memória do
`express-session`. Isso é aceitável para este demo (single machine, guarda só
tokens OAuth de curta duração), mas não escala para múltiplas instâncias — um
app real de produção deve usar um store persistente (Redis, Postgres, etc).

**Note**: the app uses `express-session`'s default in-memory session store.
That's fine for this demo (single machine, only holds short-lived OAuth
tokens), but it doesn't scale across multiple instances — a real production
app should use a persistent store (Redis, Postgres, etc).

## Estrutura / Structure

- `app.js`: Configuração principal do Express e da estratégia OAuth2 / Main Express setup and the OAuth2 strategy
- `lib/oldDragonApi.js`: Cabeçalhos padrão e o wrapper de requisição com renovação de token / Standard headers and the request wrapper with token refresh
- `routes/index.js`: Home, login, callback, logout / Home, login, callback, logout
- `routes/personagens.js`: Listagem, detalhe e atualização de PV de personagens / Character listing, detail, and HP update
- `views/`: Templates EJS / EJS templates
- `bin/www`: Script de inicialização do servidor / Server startup script
