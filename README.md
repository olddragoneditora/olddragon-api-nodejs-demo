# Old Dragon API — Demo Node.js

🇬🇧 [English version](README.en.md)

Exemplo de aplicação Express (criada com o express-generator) que demonstra como
integrar com a [API do Old Dragon](https://github.com/olddragoneditora/olddragon-api)
usando OAuth 2.0 + PKCE: login, leitura de dados do usuário e uma escrita.

Você pode acessar a aplicação em produção em
[olddragon-api-nodejs-demo.fly.dev](https://olddragon-api-nodejs-demo.fly.dev) —
ou fazer _fork_ deste projeto e adaptá-lo para a sua própria aplicação, fazendo
deploy você mesmo (veja "Deploy" abaixo).

## O que este demo mostra

- **Login via OAuth 2.0 com PKCE (S256)** — fluxo padrão de authorization code
  em uma aplicação web (client confidencial, `client_secret` fica só no
  servidor), sem precisar de device flow.
- **Leitura (`content.read`)**: lista as campanhas (`GET /campanhas.json`) e os
  personagens (`GET /personagens.json`) do usuário autenticado, e mostra o
  detalhe de um personagem (`GET /personagens/:id.json`).
- **Escrita (`content.write`)**: um formulário na página do personagem faz
  `PATCH /personagens/:id.json` para atualizar os PV atuais.
- **Renovação de token**: em um 401 comum (token expirado), a aplicação troca o
  refresh token por um novo access token e repete a chamada uma vez antes de
  desistir e mandar o usuário de volta para `/login`. Um 401 por escopo
  insuficiente (`insufficient_scope`) nunca é tratado como token expirado — é
  mostrado como mensagem de erro na tela.

## Funcionalidades

- Autenticação OAuth 2.0 com PKCE
- Listagem e detalhe de campanhas e personagens
- Atualização de PV de um personagem (escrita na API)
- Interface em português usando templates EJS

## Requisitos

- Node.js 24 ou superior (LTS atual)
- Conta no Old Dragon (olddragon.com.br)
- Client ID e Client Secret de uma aplicação OAuth

## Como obter credenciais OAuth

Cadastre sua aplicação em
[olddragon.com.br/conta/aplicativos](https://olddragon.com.br/conta/aplicativos)
(o cadastro é self-service, sem aprovação manual). Peça os escopos `openid`,
`email`, `content.read`, `content.write` e `offline_access`, e informe a URL de
callback (`http://localhost:8080/callback` em desenvolvimento).

Mais detalhes em [github.com/olddragoneditora/olddragon-api](https://github.com/olddragoneditora/olddragon-api).

## Escopos usados

| Escopo | Uso |
|---|---|
| `openid`, `email` | Identifica o usuário logado |
| `content.read` | Exigido em toda leitura (`GET`): campanhas, personagens |
| `content.write` | Exigido para a atualização de PV (`PATCH`) |
| `offline_access` | Emite um refresh token para renovar o access token sem novo login |

## Rodando localmente

1. Clone este projeto
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente:

```bash
export CLIENT_ID="seu_client_id"
export CLIENT_SECRET="seu_client_secret"
export SESSION_SECRET="sua_chave_secreta_sessao"
export CALLBACK_URL="http://localhost:8080/callback"
```

4. Execute: `npm start`
5. Acesse: http://localhost:8080

## Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `CLIENT_ID` | ID da aplicação OAuth do Old Dragon |
| `CLIENT_SECRET` | Secret da aplicação OAuth do Old Dragon |
| `SESSION_SECRET` | Chave secreta para sessões |
| `CALLBACK_URL` | URL de callback OAuth (ex: `http://localhost:8080/callback`) |
| `OLDDRAGON_BASE_URL` | Opcional, padrão `https://olddragon.com.br` — útil para apontar para outro ambiente |
| `PORT` | Opcional, padrão `8080` |

## Deploy

O deploy é feito no [Fly.io](https://fly.io) via GitHub Actions
(`.github/workflows/fly-deploy.yml`), disparado a cada push na branch `main`
(ou manualmente pela aba Actions, via `workflow_dispatch`). É preciso
configurar o secret `FLY_API_TOKEN` nas configurações do repositório.

Para fazer deploy da sua própria cópia:

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

## Estrutura

- `app.js`: Configuração principal do Express e da estratégia OAuth2
- `lib/oldDragonApi.js`: Cabeçalhos padrão e o wrapper de requisição com renovação de token
- `routes/index.js`: Home, login, callback, logout
- `routes/personagens.js`: Listagem, detalhe e atualização de PV de personagens
- `views/`: Templates EJS
- `bin/www`: Script de inicialização do servidor
