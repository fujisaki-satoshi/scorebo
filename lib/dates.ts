function parse(date: string): { y: number; m: number; d: number } | null {
  if (!date) return null;
  const [yStr, mStr, dStr] = date.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (!y || !m || !d) return null;
  return { y, m, d };
}

export function formatGameDate(date: string): string {
  const p = parse(date);
  if (!p) return date;
  if (p.y === new Date().getFullYear()) return `${p.m}/${p.d}`;
  return `${p.y}/${p.m}/${p.d}`;
}

export function formatGameDateFull(date: string): string {
  const p = parse(date);
  if (!p) return date;
  return `${p.y}/${p.m}/${p.d}`;
}
