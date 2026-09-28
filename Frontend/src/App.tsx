import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AppShell } from "@/components/AppShell.tsx";
import { AppProvider } from "@/context/AppContext.tsx";
import { CardDetailPage } from "@/pages/CardDetailPage.tsx";
import { CardFormPage } from "@/pages/CardFormPage.tsx";
import { ChooseDeckPage } from "@/pages/ChooseDeckPage.tsx";
import { CollectionDetailPage } from "@/pages/CollectionDetailPage.tsx";
import { CollectionFormPage } from "@/pages/CollectionFormPage.tsx";
import { CollectionPage } from "@/pages/CollectionPage.tsx";
import { DeckBuilderPage } from "@/pages/DeckBuilderPage.tsx";
import { DecksPage } from "@/pages/DecksPage.tsx";
import { GamePage } from "@/pages/GamePage.tsx";
import { HomePage } from "@/pages/HomePage.tsx";
import { InitialHandPage } from "@/pages/InitialHandPage.tsx";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="colecao" element={<CollectionPage />} />
            <Route path="colecao/nova" element={<CollectionFormPage />} />
            <Route path="colecao/:collectionId" element={<CollectionDetailPage />} />
            <Route path="carta/nova" element={<CardFormPage />} />
            <Route path="carta/:cardId" element={<CardDetailPage />} />
            <Route path="carta/:cardId/editar" element={<CardFormPage />} />
            <Route path="decks" element={<DecksPage />} />
            <Route path="decks/novo" element={<DeckBuilderPage />} />
            <Route path="decks/:deckId" element={<DeckBuilderPage />} />
            <Route path="jogar" element={<ChooseDeckPage />} />
          </Route>
          <Route path="jogar/mao" element={<InitialHandPage />} />
          <Route path="jogar/partida" element={<GamePage />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: "#1a1714",
            border: "1px solid rgba(95, 191, 74, 0.35)",
            color: "#f6f1e7",
          },
        }}
      />
    </AppProvider>
  );
}
