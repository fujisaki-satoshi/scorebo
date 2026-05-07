import type { Sport } from "@/lib/types";

type Props = {
  sport: Sport;
  size?: number;
  className?: string;
};

export default function SportIcon({ sport, size = 28, className }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 32 32",
    "aria-hidden": true,
    className,
  };

  if (sport === "baseball") {
    return (
      <svg {...common}>
        <circle cx="16" cy="16" r="14" fill="white" stroke="#d4d4d4" />
        <path
          d="M5 11 Q 16 17 27 11"
          stroke="#d22"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M5 21 Q 16 15 27 21"
          stroke="#d22"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (sport === "softball") {
    return (
      <svg {...common}>
        <circle cx="16" cy="16" r="14" fill="white" stroke="#d4d4d4" />
        <text
          x="16"
          y="20"
          textAnchor="middle"
          fontSize="11"
          fontWeight="800"
          fill="#1a7a35"
          fontFamily="system-ui, sans-serif"
        >
          SB
        </text>
      </svg>
    );
  }

  // kickball — soccer-ball style with red / yellow / green panels
  return (
    <svg {...common}>
      <circle cx="16" cy="16" r="14" fill="white" stroke="#222" />
      <polygon points="16,7 22,11 20,17 12,17 10,11" fill="#d22" />
      <polygon points="22,11 27,15 25,21 20,17" fill="#fcd116" />
      <polygon points="10,11 5,15 7,21 12,17" fill="#1a7a35" />
    </svg>
  );
}
