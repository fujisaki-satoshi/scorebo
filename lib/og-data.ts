import type { Game, InningScore, Sport } from "@/lib/types";

export type FsValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  timestampValue?: string;
  arrayValue?: { values?: FsValue[] };
  mapValue?: { fields?: Record<string, FsValue> };
  nullValue?: null;
};

function fsToVal(v: FsValue | undefined): unknown {
  if (!v) return undefined;
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.integerValue !== undefined) return Number(v.integerValue);
  if (v.doubleValue !== undefined) return v.doubleValue;
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.nullValue !== undefined) return null;
  if (v.timestampValue !== undefined) return new Date(v.timestampValue).getTime() / 1000;
  if (v.arrayValue) return (v.arrayValue.values ?? []).map(fsToVal);
  if (v.mapValue) {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v.mapValue.fields ?? {})) {
      out[k] = fsToVal(val);
    }
    return out;
  }
  return undefined;
}

function parseGame(id: string, f: Record<string, FsValue>): Game {
  const inningsRaw = (fsToVal(f.innings) as unknown[]) ?? [];
  const innings: InningScore[] = inningsRaw.map((row) => {
    const r = row as { inning: number; top: number | null; bottom: number | null };
    return { inning: r.inning, top: r.top ?? null, bottom: r.bottom ?? null };
  });
  return {
    id,
    sport: fsToVal(f.sport) as Sport,
    date: (fsToVal(f.date) as string) ?? "",
    location: (fsToVal(f.location) as string) ?? "",
    team_top: (fsToVal(f.team_top) as string) ?? "",
    team_bottom: (fsToVal(f.team_bottom) as string) ?? "",
    innings,
    max_innings: (fsToVal(f.max_innings) as number) ?? 9,
    status: (fsToVal(f.status) as Game["status"]) ?? "in_progress",
    created_at: null as unknown as Game["created_at"],
    updated_at: null,
  };
}

export async function loadGameById(
  id: string,
): Promise<{ game: Game; updatedAtSec: number } | null> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return null;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/games/${encodeURIComponent(id)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`firestore rest: ${res.status}`);
  const body = (await res.json()) as { fields?: Record<string, FsValue> };
  const f = body.fields ?? {};
  const ts = f.updated_at?.timestampValue;
  const updatedAtSec = ts ? Math.floor(new Date(ts).getTime() / 1000) : 0;
  return { game: parseGame(id, f), updatedAtSec };
}

export async function loadGameByViewToken(
  viewToken: string,
): Promise<{ game: Game; updatedAtSec: number } | null> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return null;

  const vtUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/view_tokens/${encodeURIComponent(viewToken)}`;
  const vtRes = await fetch(vtUrl, { cache: "no-store" });
  if (!vtRes.ok) return null;
  const vtBody = (await vtRes.json()) as { fields?: Record<string, FsValue> };
  const gameId = vtBody.fields?.game_id?.stringValue;
  if (!gameId) return null;

  return loadGameById(gameId);
}
