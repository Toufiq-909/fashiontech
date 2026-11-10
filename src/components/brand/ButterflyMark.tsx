type Props = {
  size?: number;
  className?: string;
  wing?: string;
  accent?: string;
  body?: string;
};

/** Geometric butterfly built from four wing petals. Decorative by default. */
export function ButterflyMark({
  size = 32,
  className,
  wing = "#FFDD9C",
  accent = "#F9B637",
  body = "currentColor",
}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g>
        <path d="M30 30C22 12 8 6 5 13c-3 8 6 20 20 22Z" fill={wing} />
        <path d="M34 30C42 12 56 6 59 13c3 8-6 20-20 22Z" fill={wing} />
        <path d="M30 34C20 38 13 50 19 55c6 5 13-4 15-17Z" fill={accent} />
        <path d="M34 34c10 4 17 16 11 21-6 5-13-4-15-17Z" fill={accent} />
        <path d="M32 18v28" stroke={body} strokeWidth="3" strokeLinecap="round" />
        <path
          d="M32 20c-2-5-6-7-9-8M32 20c2-5 6-7 9-8"
          stroke={body}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <ButterflyMark
        size={compact ? 30 : 36}
        wing={light ? "#FFDD9C" : "#7F5283"}
        accent={light ? "#F9B637" : "#73976A"}
        body={light ? "#FEFBF6" : "#3D3C42"}
      />
      <span className="flex flex-col leading-none">
        <span
          className="font-display text-[1.5rem] font-extrabold tracking-[-0.05em]"
          style={{ color: light ? "#FEFBF6" : "#3D3C42" }}
        >
          butterfly
        </span>
        {!compact && (
          <span
            className="text-[0.64rem] tracking-[0.06em]"
            style={{ color: light ? "#FFDD9C" : "#677E61" }}
          >
            Live to Love
          </span>
        )}
      </span>
    </span>
  );
}
