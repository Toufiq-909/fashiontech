import { fabricProperties } from "@/lib/config";

function PropertyIcon({ name }: { name: string }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 32 32",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "wind":
      return (
        <svg {...common}>
          <path d="M4 12h14a4 4 0 1 0-4-4" />
          <path d="M4 18h20a3 3 0 1 1-3 3" />
          <path d="M4 24h10" />
        </svg>
      );
    case "crease":
      return (
        <svg {...common}>
          <path d="M6 8h20v16H6z" />
          <path d="M10 8v16M16 8v16M22 8v16" />
          <path d="M4 12l4-4" />
        </svg>
      );
    case "soft":
      return (
        <svg {...common}>
          <path d="M8 22c0-7 4-12 10-14 2 8-1 14-10 14Z" />
          <path d="M24 10c1 7-3 12-10 13" />
        </svg>
      );
    case "feather":
      return (
        <svg {...common}>
          <path d="M26 6C16 6 9 11 7 21c10 2 17-4 19-15Z" />
          <path d="M6 26c5-8 10-12 17-16" />
        </svg>
      );
    case "drop":
      return (
        <svg {...common}>
          <path d="M16 4s8 8.5 8 14a8 8 0 0 1-16 0c0-5.5 8-14 8-14Z" />
          <path d="M12 20a4 4 0 0 0 4 4" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M16 4C7 8 5 15 6 23c8 2 16-3 20-19Z" />
          <path d="M9 26c2-7 7-12 14-16" />
        </svg>
      );
  }
}

export function PropertyBadges({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <ul className={`property-badges ${tone === "light" ? "property-light" : ""}`}>
      {fabricProperties.map((property) => (
        <li key={property.name}>
          <span className="property-icon">
            <PropertyIcon name={property.icon} />
          </span>
          <span>
            <strong>{property.name}</strong>
            <span className="property-note">{property.note}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
