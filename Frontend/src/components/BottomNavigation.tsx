import { House, Layers, Library, Swords } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils.ts";

const items = [
  { to: "/", label: "Home", icon: House, match: (path: string) => path === "/" },
  {
    to: "/colecao",
    label: "Coleção",
    icon: Library,
    match: (path: string) => path.startsWith("/colecao") || path.startsWith("/carta"),
  },
  { to: "/decks", label: "Decks", icon: Layers, match: (path: string) => path.startsWith("/decks") },
  { to: "/jogar", label: "Jogar", icon: Swords, match: (path: string) => path.startsWith("/jogar") },
];

export function BottomNavigation() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink/92 backdrop-blur-md lg:hidden">
      <ul className="grid h-16 grid-cols-4 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === "/"}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-xs",
                  active ? "font-semibold text-gold" : "text-muted",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SideNavigation() {
  const { pathname } = useLocation();
  return (
    <nav className="mt-8 grid gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.match(pathname);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={cn(
              "flex h-12 items-center gap-3 rounded-2xl px-3 text-sm",
              active ? "bg-gold/15 font-semibold text-gold" : "text-muted hover:bg-white/5 hover:text-foreground",
            )}
          >
            <Icon className="size-5" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
