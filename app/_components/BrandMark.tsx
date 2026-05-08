type Props = {
  size?: number;
  className?: string;
};

export function BrandMark({ size = 36, className }: Props) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg bg-white/15 ${className ?? ""}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.72}
        height={size * 0.72}
        className="block"
      >
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
    </span>
  );
}
