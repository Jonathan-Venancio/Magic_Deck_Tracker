# Magic Deck Tracker — backend

API FastAPI da coleção, decks e partida. Imagens vão para `DATA_DIR/media/` (padrão `data/media`).

## Rodar local

Sem Postgres, usa SQLite em `data/app.db`:

```bash
cd Backend
poetry install
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## PostgreSQL

```
DB_HOST=jonathan_db
DB_NAME=magicdecktracker
DB_USER=jonathan
DB_PASSWORD=sua-senha
DB_PORT=5432
```

Health check: http://localhost:8000/api/health

Na primeira subida o banco recebe as coleções de exemplo. Depois disso, o que você criar/editar no app fica persistido.
