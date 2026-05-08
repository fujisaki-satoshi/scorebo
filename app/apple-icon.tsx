import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        }}
      >
        <svg width="120" height="120" viewBox="0 0 24 24">
          <polygon
            points="12,2 22,12 12,22 2,12"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <polygon points="12,7 17,12 12,17 7,12" fill="#ffffff" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
