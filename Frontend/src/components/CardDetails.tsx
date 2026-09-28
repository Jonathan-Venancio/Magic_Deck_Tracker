import type { ReactNode } from "react";
import { ColorPips, ManaBadge } from "@/components/ManaBadge.tsx";
import { formatNumber } from "@/lib/format.ts";
import type { Card } from "@/lib/types.ts";

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-card px-3 py-3">
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}

export function CardDetails({
  card,
  collectionName,
  actions,
}: {
  card: Card;
  collectionName: string;
  actions?: ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-gold">{formatNumber(card.number)}</p>
      <h2 className="mt-1 text-3xl font-semibold tracking-tight">{card.name}</h2>
      <p className="mt-2 text-muted">{card.typeLine || "Tipo não informado"}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3">
        <Info label="Coleção" value={collectionName} />
        <Info label="Número" value={formatNumber(card.number)} />
        <div className="col-span-2">
          <Info label="Tipo" value={card.typeLine || "—"} />
        </div>
        <Info label="Custo" value={<ManaBadge cost={card.manaCost} />} />
        <Info label="Quantidade" value={String(card.quantity)} />
        <div className="col-span-2">
          <Info label="Cores" value={<ColorPips colors={card.colors} names />} />
        </div>
      </dl>
      <h3 className="mt-8 text-lg font-semibold">Texto da carta</h3>
      <p className="mt-2 whitespace-pre-wrap font-serif text-lg leading-relaxed text-foreground/95">
        {card.text || "Nenhuma tradução cadastrada."}
      </p>
      {actions ? <div className="mt-6 grid gap-3 sm:grid-cols-2">{actions}</div> : null}
    </div>
  );
}
