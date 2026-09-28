# Magic Deck Tracker — backend

API FastAPI da coleção, decks e partida. Os dados ficam em SQLite (`data/app.db`). Imagens vão para `data/media/`.

## Rodar

```bash
cd Backend
poetry install
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check: http://localhost:8000/api/health

Na primeira subida o banco recebe as coleções de exemplo. Depois disso, o que você criar/editar no app fica persistido.
