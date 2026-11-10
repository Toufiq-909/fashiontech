export function StarRating({
  value,
  size = 14,
  showValue = false,
  count,
}: {
  value: number;
  size?: number;
  showValue?: boolean;
  count?: number;
}) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`${value} out of 5 stars`}>
      <span className="inline-flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg key={star} width={size} height={size} viewBox="0 0 20 20">
            <path
              d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z"
              fill={star <= Math.round(value) ? "#F9B637" : "none"}
              stroke="#3D3C42"
              strokeWidth="1.2"
            />
          </svg>
        ))}
      </span>
      {showValue && <span className="text-xs font-semibold">{value.toFixed(1)}</span>}
      {typeof count === "number" && <span className="text-xs muted">({count})</span>}
    </span>
  );
}
