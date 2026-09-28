import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode, RefObject } from "react";
import { cn } from "@/lib/utils.ts";

export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  variant = "sheet",
  initialFocusRef,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  variant?: "sheet" | "fullscreen";
  initialFocusRef?: RefObject<HTMLInputElement | null>;
}) {
  const fullscreen = variant === "fullscreen";
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content
          aria-describedby={description ? undefined : undefined}
          onOpenAutoFocus={(event) => {
            if (!initialFocusRef?.current) return;
            event.preventDefault();
            initialFocusRef.current.focus();
          }}
          className={cn(
            "sheet-panel fixed z-50 border-line bg-ink outline-none",
            fullscreen
              ? "inset-0 flex flex-col"
              : "inset-x-0 bottom-0 max-h-[min(92dvh,860px)] overflow-y-auto rounded-t-3xl border px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:max-h-[min(80dvh,760px)] md:w-[min(560px,calc(100%-2rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl",
          )}
        >
          {fullscreen ? (
            <div className="flex items-start justify-between gap-3 border-b border-white/5 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
              <div>
                <Dialog.Title className="text-xl font-semibold">{title}</Dialog.Title>
                {description ? (
                  <Dialog.Description className="mt-1 text-sm text-muted">{description}</Dialog.Description>
                ) : (
                  <Dialog.Description className="sr-only">{title}</Dialog.Description>
                )}
              </div>
              <Dialog.Close className="grid size-11 place-items-center rounded-2xl border border-line bg-card text-foreground" aria-label="Fechar">
                <X className="size-5" />
              </Dialog.Close>
            </div>
          ) : (
            <>
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/15" />
              <Dialog.Title className="text-xl font-semibold">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-sm text-muted">{description}</Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{title}</Dialog.Description>
              )}
            </>
          )}
          <div className={cn(fullscreen ? "min-h-0 flex-1 overflow-y-auto px-4 py-4" : "mt-4")}>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
