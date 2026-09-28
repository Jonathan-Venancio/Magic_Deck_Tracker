# Magic Deck Tracker

Frontend React do companion para consultar traduções de cartas físicas de Magic durante uma partida.

Os dados vêm da API FastAPI em `Backend/`. Imagens de carta só aparecem se você enviar uma.

## Rodar

Com o backend já no ar (`poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`):

```bash
cd Frontend
npm install
npm run dev
```

Abra http://localhost:5173/

## Build e PWA

```bash
npm run build
npm run preview
```

O build gera o manifest e o service worker para uso como PWA.
