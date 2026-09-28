# Magic Deck Tracker

Protótipo frontend do companion para consultar traduções de cartas físicas de Magic durante uma partida.

Não há backend, login nem integração com APIs. Os dados de exemplo ficam no navegador (`localStorage`). Imagens de carta só aparecem se você enviar uma do seu aparelho.

## Rodar

```bash
cd Frontend
npm install
npm run dev
```

## Build e PWA

```bash
npm run build
npm run preview
```

O build gera o manifest e o service worker para uso como PWA.
