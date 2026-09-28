import { Archive, Hand, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils.ts";

export type GameTab = "hand" | "search" | "draw" | "graveyard";

export function GameBottomNavigation({
  active,
  onChange,
}: {
  active: GameTab;
  onChange: (tab: GameTab) => void;
}) {
  const side = [
    { id: "hand" as const, label: "Mão", icon: Hand },
    { id: "search" as const, label: "Buscar", icon: Search },
  ];
  const end = [{ id: "graveyard" as const, label: "Cemitério", icon: Archive }];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink/95 backdrop-blur-md xl:hidden">
      <ul className="grid h-[4.75rem] grid-cols-4 items-end pb-[env(safe-area-inset-bottom)]">
        {side.map((item) => {
          const Icon = item.icon;
          const selected = active === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onChange(item.id)}
                className={cn(
                  "flex h-16 w-full flex-col items-center justify-center gap-1 text-xs",
                  selected ? "text-gold" : "text-muted",
                )}
              >
                <Icon className="size-5" />
                <span className={cn(selected && "font-semibold")}>{item.label}</span>
              </button>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() => onChange("draw")}
            className="flex w-full -translate-y-3 flex-col items-center gap-1"
          >
            <span className="grid size-16 place-items-center rounded-full bg-gold text-ink shadow-[0_10px_30px_rgba(224,177,90,0.35)]">
              <Plus className="size-7" />
            </span>
            <span className="text-xs font-semibold text-gold">Comprar</span>
          </button>
        </li>
        {end.map((item) => {
          const Icon = item.icon;
          const selected = active === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onChange(item.id)}
                className={cn(
                  "flex h-16 w-full flex-col items-center justify-center gap-1 text-xs",
                  selected ? "text-gold" : "text-muted",
                )}
              >
                <Icon className="size-5" />
                <span className={cn(selected && "font-semibold")}>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
