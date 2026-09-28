import { Link } from "react-router-dom";
import { Sheet } from "@/components/ui/sheet.tsx";

export function AddMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const items = [
    { to: "/carta/nova", title: "Adicionar carta", detail: "Cadastrar nome, número, tradução e imagem." },
    { to: "/colecao/nova", title: "Criar coleção", detail: "Agrupar cartas por coleção." },
    { to: "/decks/novo", title: "Criar deck", detail: "Montar um deck com as cartas cadastradas." },
  ];
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Adicionar" description="O que você quer cadastrar?">
      <div className="grid gap-2">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => onOpenChange(false)}
            className="rounded-2xl border border-line bg-card px-4 py-4 hover:border-gold/40"
          >
            <span className="block font-semibold">{item.title}</span>
            <span className="mt-1 block text-sm text-muted">{item.detail}</span>
          </Link>
        ))}
      </div>
    </Sheet>
  );
}
