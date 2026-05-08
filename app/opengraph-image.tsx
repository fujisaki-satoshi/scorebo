import { ImageResponse } from "next/og";

export const alt = "Scorebo — score sharing app";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #1a7a35 0%, #146028 60%, #0f4a1f 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: "80px",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 24 24" style={{ marginBottom: 32 }}>
          <polygon
            points="12,2 22,12 12,22 2,12"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <polygon points="12,7 17,12 12,17 7,12" fill="#ffffff" />
        </svg>
        <div
          style={{
            fontSize: 132,
            fontWeight: 800,
            letterSpacing: -2,
            display: "flex",
          }}
        >
          SCOREBO
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            letterSpacing: 8,
            marginTop: 12,
            opacity: 0.9,
            display: "flex",
          }}
        >
          SCORE SHARING APP
        </div>
        <div
          style={{
            display: "flex",
            gap: 28,
            marginTop: 56,
            fontSize: 26,
            fontWeight: 500,
            opacity: 0.85,
          }}
        >
          <span>BASEBALL</span>
          <span>·</span>
          <span>SOFTBALL</span>
          <span>·</span>
          <span>KICKBALL</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
