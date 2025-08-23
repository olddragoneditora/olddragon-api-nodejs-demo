# Exemplo de Integração com a API do Old Dragon (Express Generator)

Este é um exemplo de aplicação Express criada com o express-generator que demonstra como integrar com a API do Old Dragon usando OAuth 2.0.

Você pode acessar esta aplicação indo em [olddragon-api-nodejs-demo.fly.dev](https://olddragon-api-nodejs-demo.fly.dev)

E você mesmo pode fazer _fork_ deste projeto e adaptá-lo para sua própria aplicação, fazendo deploy você mesmo.

## Funcionalidades

- Autenticação OAuth 2.0 com PKCE
- Integração com a API do Old Dragon
- Interface usando EJS templates
- Exemplo de busca de campanhas do usuário

## Requisitos

- Node.js 24 ou superior
- Conta no Old Dragon (olddragon.com.br)
- Client ID e Client Secret da aplicação OAuth

## Configuração

1. Clone este projeto
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente:

```bash
export CLIENT_ID="seu_client_id"
export CLIENT_SECRET="seu_client_secret"
export SESSION_SECRET="sua_chave_secreta_sessao"
export CALLBACK_URL="https://seu-app.fly.dev/callback"
```

4. Execute: `npm start`
5. Acesse: http://localhost:3000

## Deploy no Fly.io

```sh
fly launch
fly secrets set CLIENT_ID="seu_client_id"
fly secrets set CLIENT_SECRET="seu_client_secret"
fly secrets set CALLBACK_URL="https://seu-app.fly.dev/callback"
fly secrets set SESSION_SECRET="invente_uma_chave_secreta_aleatoria_aqui"
fly deploy
```

## Variáveis de Ambiente

- `CLIENT_ID`: ID da aplicação OAuth do Old Dragon
- `CLIENT_SECRET`: Secret da aplicação OAuth do Old Dragon
- `SESSION_SECRET`: Chave secreta para sessões
- `CALLBACK_URL`: URL de callback OAuth (ex: http://localhost:3000/callback)

## Como obter credenciais OAuth

Siga as instruções em [github.com/burobrasil/olddragon-api](https://github.com/burobrasil/olddragon-api)

## Estrutura

- `app.js`: Configuração principal do Express com OAuth
- `routes/index.js`: Rotas principais incluindo login/callback
- `views/`: Templates EJS
- `bin/www`: Script de inicialização do servidor
