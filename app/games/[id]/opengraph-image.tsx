import { ImageResponse } from "next/og";

import { findInning, totalSlots, totals } from "@/lib/games";
import { loadGoogleFont } from "@/lib/og-fonts";
import { SPORT_META } from "@/lib/sports";
import type { Game, InningScore, Sport } from "@/lib/types";

export const alt = "試合スコア";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 0;

const SITE_URL_BASE = "scorebo.vercel.app";

function formatDate(date: string): string {
  const [yStr, mStr, dStr] = date.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (!y || !m || !d) return date;
  const dow = ["日", "月", "火", "水", "木", "金", "土"][
    new Date(y, m - 1, d).getDay()
  ];
  const thisYear = new Date().getFullYear();
  const head = y === thisYear ? `${m}月${d}日` : `${y}年${m}月${d}日`;
  return `${head}(${dow})`;
}

type FsValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
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

async function loadGame(id: string): Promise<Game | null> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return null;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/games/${encodeURIComponent(id)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`firestore rest: ${res.status}`);
  const body = (await res.json()) as { fields?: Record<string, FsValue> };
  const f = body.fields ?? {};
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

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = await loadGame(id);

  if (!game) {
    const text = "試合が見つかりません — スコアボ";
    const fontJp = await loadGoogleFont("Noto Sans JP", 700, text).catch(
      () => null,
    );
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#1a7a35",
            color: "#fff",
            fontSize: 56,
            fontWeight: 700,
            fontFamily: "NotoSansJP",
          }}
        >
          {text}
        </div>
      ),
      {
        ...size,
        fonts: fontJp
          ? [{ name: "NotoSansJP", data: fontJp, weight: 700, style: "normal" }]
          : undefined,
      },
    );
  }

  const meta = SPORT_META[game.sport];
  const { top, bottom } = totals(game.innings);
  const slots = Math.min(totalSlots(game.innings, game.max_innings), 9);
  const inningNumbers = Array.from({ length: slots }, (_, i) => i + 1);
  const dateStr = formatDate(game.date);
  const url = `${SITE_URL_BASE}/games/${game.id}`;

  const usedText =
    `スコアボ${meta.label}${game.team_top}${game.team_bottom}` +
    `${dateStr}${game.location ?? ""}先攻後攻計R回無料登録不要月火水木金土日年` +
    `${url}`;
  const numText = "0123456789−vs −";

  const [fontRegular, fontBold] = await Promise.all([
    loadGoogleFont("Noto Sans JP", 400, usedText + numText).catch(() => null),
    loadGoogleFont("Noto Sans JP", 700, usedText + numText).catch(() => null),
  ]);

  const fonts = [
    fontRegular && {
      name: "NotoSansJP",
      data: fontRegular,
      weight: 400 as const,
      style: "normal" as const,
    },
    fontBold && {
      name: "NotoSansJP",
      data: fontBold,
      weight: 700 as const,
      style: "normal" as const,
    },
  ].filter(Boolean) as {
    name: string;
    data: ArrayBuffer;
    weight: 400 | 700;
    style: "normal";
  }[];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          fontFamily: "NotoSansJP",
          color: "#1c1c1c",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#1a7a35",
            color: "#ffffff",
            padding: "20px 40px",
            height: 88,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="44" height="44" viewBox="0 0 24 24">
              <polygon
                points="12,5 19,12 12,19 5,12"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <polygon points="12,2.4 13.7,4.1 12,5.8 10.3,4.1" fill="#ffffff" />
              <polygon points="21.6,12 19.9,13.7 18.2,12 19.9,10.3" fill="#ffffff" />
              <polygon points="12,21.6 13.7,19.9 12,18.2 10.3,19.9" fill="#ffffff" />
              <polygon points="2.4,12 4.1,13.7 5.8,12 4.1,10.3" fill="#ffffff" />
              <circle cx="12" cy="12" r="1.4" fill="#ffffff" />
            </svg>
            <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: 1 }}>
              スコアボ
            </span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 400,
              opacity: 0.95,
            }}
          >
            {dateStr}
            {game.location ? `  ・  ${game.location}` : ""}
          </div>
        </div>

        {/* Mid */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "32px 56px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "6px 16px",
              borderRadius: 999,
              background: "#e8f5ed",
              color: "#145e29",
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 18,
            }}
          >
            {meta.label}
          </div>

          {/* Versus + score */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                flex: 1,
                display: "flex",
                fontSize: 44,
                fontWeight: 700,
                lineHeight: 1.1,
              }}
            >
              {game.team_top || "—"}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                fontSize: 110,
                fontWeight: 800,
                color: "#1a7a35",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                margin: "0 24px",
              }}
            >
              <span style={{ display: "flex" }}>{top}</span>
              <span style={{ display: "flex", color: "#888", fontWeight: 400 }}>
                −
              </span>
              <span style={{ display: "flex" }}>{bottom}</span>
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "flex-end",
                fontSize: 44,
                fontWeight: 700,
                lineHeight: 1.1,
                textAlign: "right",
              }}
            >
              {game.team_bottom || "—"}
            </div>
          </div>

          {/* Innings table */}
          <ScoreTableJSX
            game={game}
            slots={slots}
            inningNumbers={inningNumbers}
            top={top}
            bottom={bottom}
          />
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fafafa",
            borderTop: "1px solid #e2e6e2",
            padding: "18px 40px",
            height: 70,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#1a7a35",
              fontWeight: 700,
            }}
          >
            {url}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 20,
              fontWeight: 700,
              color: "#145e29",
            }}
          >
            <span style={{ display: "flex" }}>QRひとつで全員と共有 ・ 無料・登録不要</span>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}

function ScoreTableJSX({
  game,
  slots,
  inningNumbers,
  top,
  bottom,
}: {
  game: Game;
  slots: number;
  inningNumbers: number[];
  top: number;
  bottom: number;
}) {
  const labelWidth = 180;
  const totalWidth = 80;
  const cellStyle = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRight: "1px solid #e2e6e2",
    fontSize: 28,
    padding: "8px 0",
    fontVariantNumeric: "tabular-nums" as const,
  };
  const headStyle = {
    ...cellStyle,
    background: "#f5f7f5",
    color: "#666",
    fontWeight: 700,
    fontSize: 22,
  };
  const labelCell = {
    width: labelWidth,
    display: "flex",
    alignItems: "center",
    paddingLeft: 16,
    borderRight: "1px solid #e2e6e2",
    background: "#fafcfa",
    fontWeight: 700,
    fontSize: 22,
    color: "#1c1c1c",
  };
  const totalHead = {
    width: totalWidth,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#1a7a35",
    color: "#fff",
    fontWeight: 700,
    fontSize: 22,
  };
  const totalCell = {
    width: totalWidth,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#e8f5ed",
    color: "#145e29",
    fontWeight: 800,
    fontSize: 30,
    fontVariantNumeric: "tabular-nums" as const,
  };

  function renderRow(
    label: string,
    getValue: (n: number) => number | null | undefined,
    total: number,
    last: boolean,
  ) {
    return (
      <div
        style={{
          display: "flex",
          borderBottom: last ? "none" : "1px solid #e2e6e2",
        }}
      >
        <div style={labelCell}>{label}</div>
        {inningNumbers.map((n) => {
          const v = getValue(n);
          return (
            <div key={n} style={cellStyle}>
              {v == null ? "−" : v}
            </div>
          );
        })}
        <div style={totalCell}>{total}</div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid #e2e6e2",
        borderRadius: 12,
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #e2e6e2",
        }}
      >
        <div
          style={{
            width: labelWidth,
            display: "flex",
            alignItems: "center",
            paddingLeft: 16,
            background: "#f5f7f5",
            color: "#666",
            fontWeight: 700,
            fontSize: 22,
            borderRight: "1px solid #e2e6e2",
          }}
        >
          {`${slots}回`}
        </div>
        {inningNumbers.map((n) => (
          <div
            key={n}
            style={{
              ...headStyle,
              ...(n > game.max_innings
                ? { color: "#145e29", background: "#e8f5ed" }
                : {}),
            }}
          >
            {n}
          </div>
        ))}
        <div style={totalHead}>R</div>
      </div>
      {renderRow(
        game.team_top || "先攻",
        (n) => findInning(game.innings, n)?.top,
        top,
        false,
      )}
      {renderRow(
        game.team_bottom || "後攻",
        (n) => findInning(game.innings, n)?.bottom,
        bottom,
        true,
      )}
    </div>
  );
}
