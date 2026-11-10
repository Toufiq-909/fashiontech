import { garmentMarkup } from "@/lib/garment";

export function GarmentArt({
  category,
  colour,
  className,
  tone = "#F1DEC4",
}: {
  category: string;
  colour: string;
  className?: string;
  tone?: string;
}) {
  return (
    <svg
      viewBox="0 0 400 500"
      className={className}
      role="img"
      aria-label={`Illustration of a ${category.replace("-", " ")} in ${colour}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="400" height="500" fill={tone} />
      <circle cx="332" cy="92" r="92" fill="#FEFBF6" opacity="0.4" />
      <circle cx="52" cy="428" r="116" fill="#73976A" opacity="0.16" />
      <circle cx="344" cy="414" r="56" fill="#7F5283" opacity="0.12" />
      <g dangerouslySetInnerHTML={{ __html: garmentMarkup(category, colour) }} />
    </svg>
  );
}
