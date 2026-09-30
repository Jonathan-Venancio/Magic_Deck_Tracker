import { Button } from "@/components/ui/button.tsx";
import { Sheet } from "@/components/ui/sheet.tsx";

export function ConfirmSheet({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  working,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  working?: boolean;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <div className="grid gap-2">
        <Button variant="danger" disabled={working} onClick={() => void onConfirm()}>
          {confirmLabel}
        </Button>
        <Button variant="secondary" disabled={working} onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
      </div>
    </Sheet>
  );
}
