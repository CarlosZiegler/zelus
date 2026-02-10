export function ZelusLogoTile({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-label="Zelus"
    >
      {/* White tile background */}
      <rect width={64} height={64} fill="white" />

      {/* Corner quarter-circle arcs */}
      <path d="M 0,14 A 14 14 0 0 1 14,0" stroke="currentColor" strokeWidth={5} />
      <path d="M 50,0 A 14 14 0 0 1 64,14" stroke="currentColor" strokeWidth={5} />
      <path d="M 64,50 A 14 14 0 0 1 50,64" stroke="currentColor" strokeWidth={5} />
      <path d="M 14,64 A 14 14 0 0 1 0,50" stroke="currentColor" strokeWidth={5} />

      {/* Corner square accents */}
      <rect x={0} y={0} width={5} height={5} fill="currentColor" />
      <rect x={59} y={0} width={5} height={5} fill="currentColor" />
      <rect x={59} y={59} width={5} height={5} fill="currentColor" />
      <rect x={0} y={59} width={5} height={5} fill="currentColor" />

      {/* Diamond */}
      <polygon
        points="32,8 56,32 32,56 8,32"
        stroke="currentColor"
        strokeWidth={5}
        strokeLinejoin="miter"
      />

      {/* Z inside the diamond — horizontal, clipped to diamond */}
      <clipPath id="diamond-clip">
        <polygon points="32,8 56,32 32,56 8,32" />
      </clipPath>
      <g clipPath="url(#diamond-clip)">
        <path
          d="M 16,20 L 48,20 L 16,44 L 48,44"
          stroke="currentColor"
          strokeWidth={5}
          strokeLinecap="square"
        />
      </g>
    </svg>
  )
}
