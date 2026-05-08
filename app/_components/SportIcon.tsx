import type { Sport } from "@/lib/types";

type Props = {
  sport: Sport;
  size?: number;
  className?: string;
};

export function SportIcon({ sport, size = 24, className }: Props) {
  if (sport === "baseball") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className={className}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" fill="#fff" stroke="#1a1a1a" strokeWidth="1.7" />
        <path
          d="M7 4.8 Q10.2 12 7 19.2"
          fill="none"
          stroke="#d93025"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M17 4.8 Q13.8 12 17 19.2"
          fill="none"
          stroke="#d93025"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (sport === "softball") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className={className}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" fill="#f4c430" stroke="#1a1a1a" strokeWidth="1.7" />
        <path
          d="M7 4.8 Q10.2 12 7 19.2"
          fill="none"
          stroke="#d93025"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M17 4.8 Q13.8 12 17 19.2"
          fill="none"
          stroke="#d93025"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" fill="#fff" stroke="#1a1a1a" strokeWidth="1.7" />
      <polygon points="7.5,3.6 11,6.2 9.7,10.3 5.3,10.3 4,6.2" fill="#1a7a35" />
      <polygon points="16.5,3.6 20,6.2 18.7,10.3 14.3,10.3 13,6.2" fill="#1a7a35" />
      <polygon points="7.5,20.4 11,17.8 9.7,13.7 5.3,13.7 4,17.8" fill="#d93025" />
      <polygon points="16.5,20.4 20,17.8 18.7,13.7 14.3,13.7 13,17.8" fill="#d93025" />
      <polygon
        points="12,9.5 14.85,11.57 13.76,14.93 10.24,14.93 9.15,11.57"
        fill="#f4c430"
        stroke="#1a1a1a"
        strokeWidth="0.6"
      />
    </svg>
  );
}
