type Props = {
  size?: number;
  className?: string;
};

export function BrandMark({ size = 36, className }: Props) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg bg-white/20 ${className ?? ""}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span
        className="block rotate-45 rounded-[2px] border-2 border-white"
        style={{ width: size * 0.45, height: size * 0.45 }}
      />
    </span>
  );
}
