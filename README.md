# Magic Deck Tracker

Companion para consultar traduções das suas cartas físicas de Magic durante a partida.

O frontend é React + Vite. O backend é FastAPI com Poetry e SQLite.

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
