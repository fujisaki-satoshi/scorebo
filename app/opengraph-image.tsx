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
        <svg width="200" height="200" viewBox="0 0 24 24" style={{ marginBottom: 32 }}>
          <polygon
            points="12,5 19,12 12,19 5,12"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <polygon points="12,2.4 13.7,4.1 12,5.8 10.3,4.1" fill="#ffffff" />
          <polygon points="21.6,12 19.9,13.7 18.2,12 19.9,10.3" fill="#ffffff" />
          <polygon points="12,21.6 13.7,19.9 12,18.2 10.3,19.9" fill="#ffffff" />
          <polygon points="2.4,12 4.1,13.7 5.8,12 4.1,10.3" fill="#ffffff" />
          <circle cx="12" cy="12" r="1.4" fill="#ffffff" />
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
