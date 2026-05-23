export function teamShort(name: string): string {
  if (!name) return "—";
  return name.length > 12 ? name.slice(0, 12) + "…" : name;
}
