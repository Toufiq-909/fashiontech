import { ButterflyMark } from "@/components/brand/ButterflyMark";

/**
 * Decorative flight path with drifting butterflies. Pure SVG + CSS transforms,
 * stopped by the prefers-reduced-motion rules in globals.css.
 */
export function Butterflies({ className = "" }: { className?: string }) {
  return (
    <div className={`butterfly-field ${className}`} aria-hidden="true">
      <svg className="flight-path" viewBox="0 0 600 520" fill="none" preserveAspectRatio="none">
        <path
          d="M40 470C150 420 120 300 230 280c110-20 80-160 190-180 88-16 110-70 140-80"
          stroke="rgba(254,251,246,0.5)"
          strokeWidth="1.4"
          strokeDasharray="3 9"
          strokeLinecap="round"
        />
        <path
          d="M60 200c80-70 150 10 210-40 70-58 120 10 210-50"
          stroke="rgba(255,221,156,0.45)"
          strokeWidth="1.2"
          strokeDasharray="2 8"
          strokeLinecap="round"
        />
      </svg>
      <span className="butterfly butterfly-a">
        <ButterflyMark size={44} wing="#FFDD9C" accent="#F9B637" body="#FEFBF6" />
      </span>
      <span className="butterfly butterfly-b">
        <ButterflyMark size={26} wing="#A6D1E6" accent="#73976A" body="#FEFBF6" />
      </span>
      <span className="butterfly butterfly-c">
        <ButterflyMark size={34} wing="#F9B637" accent="#FB6C00" body="#3D3C42" />
      </span>
      <span className="butterfly butterfly-d">
        <ButterflyMark size={20} wing="#FEFBF6" accent="#FFDD9C" body="#677E61" />
      </span>
    </div>
  );
}
