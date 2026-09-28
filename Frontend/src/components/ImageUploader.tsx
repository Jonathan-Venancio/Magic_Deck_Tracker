import { ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { CardImagePlaceholder } from "@/components/CardImagePlaceholder.tsx";
import { Button } from "@/components/ui/button.tsx";
import { fileToStoredImage } from "@/lib/images.ts";

export function ImageUploader({
  value,
  onChange,
  label = "Adicionar imagem",
  emptyHint = "Sem imagem",
}: {
  value?: string;
  onChange: (value: string | undefined) => void;
  label?: string;
  emptyHint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const image = await fileToStoredImage(file);
      onChange(image);
    } catch {
      toast.error("Não foi possível usar essa imagem.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="overflow-hidden rounded-3xl border border-line bg-card">
        {value ? (
          <img src={value} alt="Prévia da imagem enviada" className="mx-auto max-h-80 w-full object-contain" />
        ) : (
          <CardImagePlaceholder className="h-48 w-full" hint={emptyHint} />
        )}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Button variant="secondary" disabled={busy} onClick={() => inputRef.current?.click()}>
          <ImagePlus className="size-4" />
          {busy ? "Preparando..." : value ? "Alterar imagem" : label}
        </Button>
        {value ? (
          <Button variant="danger" onClick={() => onChange(undefined)}>
            <Trash2 className="size-4" />
            Remover imagem
          </Button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void onFile(event.target.files?.[0])}
      />
      <p className="mt-2 text-xs text-muted">A imagem é enviada para o servidor. Nada é buscado ou gerado automaticamente.</p>
    </div>
  );
}
