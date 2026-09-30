# Magic Deck Tracker

Companion para consultar traduções das suas cartas físicas de Magic durante a partida.

O frontend é React + Vite. O backend é FastAPI com Poetry. Em produção usa PostgreSQL; localmente, sem `DB_HOST`, cai no SQLite.

## Backend

```bash
cd Backend
poetry install
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend

Em outro terminal:

```bash
export PATH="$HOME/.local/node-v22.18.0-linux-x64/bin:$PATH"
cd Frontend
npm install
npm run dev
```

Abra http://localhost:5173/

O Vite encaminha `/api` para o backend em `http://127.0.0.1:8000`. Os dois precisam estar rodando.

## Docker

O GitHub Actions em `.github/workflows/docker.yml` publica no Docker Hub, no push para `main`/`master`:

- `{DOCKERHUB_USERNAME}/magic-deck-tracker-frontend`
- `{DOCKERHUB_USERNAME}/magic-deck-tracker-backend`

Secrets do repositório: `DOCKERHUB_USERNAME` e `DOCKERHUB_TOKEN`.

A imagem do frontend já aponta para `https://api.magicdecktracker.jonathanvenancio.site`. No proxy, encaminhe:

- `magicdecktracker.jonathanvenancio.site` → frontend `:80`
- `api.magicdecktracker.jonathanvenancio.site` → backend `:8000`

No EasyPanel, no serviço do backend, use as mesmas variáveis do outro projeto:

```
DB_HOST=nome-do-servico-postgres
DB_NAME=magicdecktracker
DB_USER=jonathan
DB_PASSWORD=sua-senha
DB_PORT=5432
CORS_ORIGINS=https://magicdecktracker.jonathanvenancio.site
DATA_DIR=/data
```

`DB_HOST` é o nome interno do container/serviço Postgres no EasyPanel, não o domínio público.

```bash
export DOCKERHUB_USERNAME=seu-usuario
docker compose pull
docker compose up -d
```

