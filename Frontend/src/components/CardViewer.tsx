import { X, ZoomIn } from "lucide-react";
import { useEffect, useState } from "react";
import { CardImagePlaceholder } from "@/components/CardImagePlaceholder.tsx";
import { formatNumber } from "@/lib/format.ts";
import type { Card } from "@/lib/types.ts";

export function CardViewer({
  card,
  collectionName,
  onClose,
}: {
  card: Card;
  collectionName: string;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(false);
  const [textOpen, setTextOpen] = useState(!card.image);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black/92" role="dialog" aria-modal="true" aria-label={card.name}>
      <div className="flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <p className="text-sm font-semibold text-gold">{formatNumber(card.number)}</p>
        <div className="flex gap-2">
          {card.image ? (
            <button
              type="button"
              onClick={() => setZoom((value) => !value)}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-line bg-card px-3 text-sm"
            >
              <ZoomIn className="size-4" />
              {zoom ? "Reduzir" : "Ampliar"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-2xl border border-line bg-card"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-4">
        {card.image ? (
          <img
            src={card.image}
            alt={card.name}
            className="mx-auto max-h-[78dvh] w-auto max-w-full rounded-2xl object-contain transition-transform duration-200"
            style={{ transform: zoom ? "scale(1.65)" : "none" }}
          />
        ) : (
          <CardImagePlaceholder
            className="mx-auto aspect-[63/88] w-full max-w-sm rounded-2xl"
            hint="Adicione uma imagem para esta carta"
          />
        )}
      </div>
      {card.image ? (
        <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => setTextOpen((value) => !value)}
            className="h-12 w-full rounded-2xl bg-gold-deep font-semibold text-foreground"
          >
            {textOpen ? "Ocultar tradução" : "Ver tradução"}
          </button>
        </div>
      ) : null}
      {textOpen ? (
        <div className="max-h-[46dvh] overflow-y-auto border-t border-line bg-ink px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p className="text-sm font-semibold text-gold">
            {formatNumber(card.number)} · {collectionName}
          </p>
          <h2 className="mt-1 text-xl font-semibold">{card.name}</h2>
          <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-muted">Tradução</h3>
          <p className="mt-2 whitespace-pre-wrap font-serif text-lg leading-relaxed">
            {card.text || "Nenhuma tradução cadastrada."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
