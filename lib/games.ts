import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Game, GameDraft, GameStatus, InningScore } from "./types";

const COL = "games";

export const PAGE_SIZE = 20;

function fromDoc(d: QueryDocumentSnapshot<DocumentData>): Game {
  const data = d.data();
  return {
    id: d.id,
    view_token: data.view_token as string | undefined,
    owner_uid: data.owner_uid as string | undefined,
    sport: data.sport,
    date: data.date,
    location: data.location ?? "",
    team_top: data.team_top,
    team_bottom: data.team_bottom,
    innings: Array.isArray(data.innings) ? data.innings : [],
    max_innings: data.max_innings,
    status: data.status,
    created_at: data.created_at,
    updated_at: data.updated_at ?? null,
  };
}

export async function listMyGames(ownerUid: string): Promise<Game[]> {
  const ref = collection(db, COL);
  const q = query(ref, where("owner_uid", "==", ownerUid));
  const snap = await getDocs(q);
  const games = snap.docs.map(fromDoc);
  games.sort((a, b) => {
    const aMs = a.created_at?.toMillis?.() ?? 0;
    const bMs = b.created_at?.toMillis?.() ?? 0;
    return bMs - aMs;
  });
  return games;
}

export async function listGames(after?: QueryDocumentSnapshot<DocumentData>) {
  const ref = collection(db, COL);
  const q = after
    ? query(ref, orderBy("created_at", "desc"), startAfter(after), limit(PAGE_SIZE))
    : query(ref, orderBy("created_at", "desc"), limit(PAGE_SIZE));
  const snap = await getDocs(q);
  const games = snap.docs.map(fromDoc);
  const last = snap.docs.at(-1);
  return { games, last, hasMore: snap.size === PAGE_SIZE };
}

export async function createGame(draft: GameDraft, ownerUid?: string) {
  const viewToken = crypto.randomUUID().replace(/-/g, "");
  const batch = writeBatch(db);
  const gameRef = doc(collection(db, COL));
  batch.set(gameRef, {
    ...draft,
    view_token: viewToken,
    ...(ownerUid ? { owner_uid: ownerUid } : {}),
    innings: [],
    status: "in_progress" as GameStatus,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  batch.set(doc(db, "view_tokens", viewToken), { game_id: gameRef.id });
  await batch.commit();
  return gameRef.id;
}

export function watchGameByViewToken(
  viewToken: string,
  cb: (game: Game | null) => void,
): () => void {
  let cancelled = false;
  let unsub: (() => void) | null = null;

  getDoc(doc(db, "view_tokens", viewToken))
    .then((snap) => {
      if (cancelled) return;
      if (!snap.exists()) {
        cb(null);
        return;
      }
      unsub = watchGame(snap.data().game_id as string, cb);
    })
    .catch(() => {
      if (!cancelled) cb(null);
    });

  return () => {
    cancelled = true;
    unsub?.();
  };
}

export function watchGame(id: string, cb: (game: Game | null) => void) {
  const ref = doc(db, COL, id);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      cb(null);
      return;
    }
    cb(fromDoc(snap as QueryDocumentSnapshot<DocumentData>));
  });
}

export async function updateInnings(id: string, innings: InningScore[]) {
  await updateDoc(doc(db, COL, id), { innings, updated_at: serverTimestamp() });
}

export async function updateStatus(id: string, status: GameStatus) {
  await updateDoc(doc(db, COL, id), { status, updated_at: serverTimestamp() });
}

export async function updateGameMeta(
  id: string,
  patch: Partial<Pick<Game, "sport" | "date" | "location" | "team_top" | "team_bottom" | "max_innings">>,
) {
  await updateDoc(doc(db, COL, id), { ...patch, updated_at: serverTimestamp() });
}

export async function deleteGame(id: string) {
  await deleteDoc(doc(db, COL, id));
}

export function totals(innings: InningScore[]) {
  let top = 0;
  let bottom = 0;
  for (const s of innings) {
    top += s.top ?? 0;
    bottom += s.bottom ?? 0;
  }
  return { top, bottom };
}

export function findInning(innings: InningScore[], n: number): InningScore | undefined {
  return innings.find((s) => s.inning === n);
}

export function lastRecordedInning(innings: InningScore[]): number {
  return innings.reduce((max, s) => Math.max(max, s.inning), 0);
}

export function totalSlots(innings: InningScore[], maxInnings: number): number {
  return Math.max(maxInnings, lastRecordedInning(innings));
}

export function currentInning(innings: InningScore[], maxInnings: number): number {
  const slots = totalSlots(innings, maxInnings);
  for (let i = 1; i <= slots; i++) {
    const s = findInning(innings, i);
    if (!s || s.top == null || s.bottom == null) return i;
  }
  return slots; // all filled
}

export function hasAnyScore(innings: InningScore[]): boolean {
  return innings.some((s) => s.top != null || s.bottom != null);
}

export function setInning(
  innings: InningScore[],
  inning: number,
  top: number | null,
  bottom: number | null,
): InningScore[] {
  const next = innings.filter((s) => s.inning !== inning);
  next.push({ inning, top, bottom });
  next.sort((a, b) => a.inning - b.inning);
  return next;
}
