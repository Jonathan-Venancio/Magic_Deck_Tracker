import { Download } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function InstallAppButton({ compact = false }: { compact?: boolean }) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone()) return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstallEvent(null);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!installEvent) return null;

  async function install() {
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstallEvent(null);
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className="grid size-11 place-items-center rounded-2xl border border-gold/40 bg-gold/10 text-gold"
        aria-label="Instalar aplicativo"
      >
        <Download className="size-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void install()}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-gold/40 bg-gold/10 px-4 text-sm font-semibold text-gold"
    >
      <Download className="size-4" />
      Instalar app
    </button>
  );
}
