export function ZelusLogoZDiamond({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-label="Zelus"
    >
      {/* Outer tile — sharp edges, heavy stroke */}
      <rect x={2} y={2} width={60} height={60} stroke="currentColor" strokeWidth={3.5} />

      {/* Corner arcs */}
      <path d="M 2,21 A 19 19 0 0 1 21,2" stroke="currentColor" strokeWidth={2.5} />
      <path d="M 43,2 A 19 19 0 0 1 62,21" stroke="currentColor" strokeWidth={2.5} />
      <path d="M 62,43 A 19 19 0 0 1 43,62" stroke="currentColor" strokeWidth={2.5} />
      <path d="M 21,62 A 19 19 0 0 1 2,43" stroke="currentColor" strokeWidth={2.5} />

      {/* Inner arcs */}
      <path d="M 12,21 A 9 9 0 0 1 21,12" stroke="currentColor" strokeWidth={1.5} />
      <path d="M 43,12 A 9 9 0 0 1 52,21" stroke="currentColor" strokeWidth={1.5} />
      <path d="M 52,43 A 9 9 0 0 1 43,52" stroke="currentColor" strokeWidth={1.5} />
      <path d="M 21,52 A 9 9 0 0 1 12,43" stroke="currentColor" strokeWidth={1.5} />

      {/* Outer diamond */}
      <polygon points="32,10 54,32 32,54 10,32" stroke="currentColor" strokeWidth={2.5} />

      {/* Inner diamond */}
      <polygon points="32,20 44,32 32,44 20,32" stroke="currentColor" strokeWidth={1.5} />

      {/* Axis lines */}
      <line x1={32} y1={2} x2={32} y2={10} stroke="currentColor" strokeWidth={1.5} />
      <line x1={54} y1={32} x2={62} y2={32} stroke="currentColor" strokeWidth={1.5} />
      <line x1={32} y1={54} x2={32} y2={62} stroke="currentColor" strokeWidth={1.5} />
      <line x1={2} y1={32} x2={10} y2={32} stroke="currentColor" strokeWidth={1.5} />

      {/* Z rotated -45° — follows the diamond axis */}
      <g transform="rotate(-45 32 32)">
        <path
          d="M 23,22 L 41,22 L 23,42 L 41,42"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="square"
        />
      </g>
    </svg>
  )
}
