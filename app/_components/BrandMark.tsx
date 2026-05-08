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
        width={size * 0.7}
        height={size * 0.7}
        className="block"
      >
        <polygon
          points="12,3 21,12 12,21 3,12"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <polygon points="12,8 16,12 12,16 8,12" fill="#ffffff" />
      </svg>
    </span>
  );
}
