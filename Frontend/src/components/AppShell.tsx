import { Plus } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { useState } from "react";
import { AddMenu } from "@/components/AddMenu.tsx";
import { BottomNavigation, SideNavigation } from "@/components/BottomNavigation.tsx";
import { Logo } from "@/components/Logo.tsx";
import { Button } from "@/components/ui/button.tsx";

export function AppShell() {
  const [addOpen, setAddOpen] = useState(false);
  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-ink/95 px-4 py-6 lg:flex">
        <Logo />
        <SideNavigation />
        <div className="mt-auto grid gap-2">
          <Button asChild>
            <Link to="/carta/nova">Adicionar carta</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/colecao/nova">Criar coleção</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/decks/novo">Criar deck</Link>
          </Button>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-background/80 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md lg:hidden">
          <Logo />
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="grid size-11 place-items-center rounded-2xl bg-gold-deep text-foreground"
            aria-label="Adicionar"
          >
            <Plus className="size-5" />
          </button>
        </header>
        <main className="pb-32 lg:pb-10">
          <Outlet />
        </main>
        <BottomNavigation />
      </div>
      <AddMenu open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
