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
        <svg width="128" height="128" viewBox="0 0 24 24">
          <polygon
            points="12,5 19,12 12,19 5,12"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <polygon points="12,2.4 13.7,4.1 12,5.8 10.3,4.1" fill="#ffffff" />
          <polygon points="21.6,12 19.9,13.7 18.2,12 19.9,10.3" fill="#ffffff" />
          <polygon points="12,21.6 13.7,19.9 12,18.2 10.3,19.9" fill="#ffffff" />
          <polygon points="2.4,12 4.1,13.7 5.8,12 4.1,10.3" fill="#ffffff" />
          <circle cx="12" cy="12" r="1.4" fill="#ffffff" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
