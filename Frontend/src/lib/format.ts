export function formatNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "#—";
  return `#${digits.padStart(3, "0")}`;
}

export function normalizeNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return String(parseInt(digits, 10));
}

export function foldText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

export function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 5 || hour >= 18) return "Boa noite";
  if (hour < 12) return "Bom dia";
  return "Boa tarde";
}

export function formatLastUsed(iso?: string): string {
  if (!iso) return "Ainda não usado";
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "Agora";
  if (minutes < 60) return `Há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "Há 1 hora" : `Há ${hours} horas`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Ontem";
  if (days < 7) return `Há ${days} dias`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function firstName(name: string): string {
  const base = name.split(",")[0]?.trim() || name;
  return base.split(" ")[0] || name;
}

export function pluralCards(count: number): string {
  return count === 1 ? "1 carta" : `${count} cartas`;
}
