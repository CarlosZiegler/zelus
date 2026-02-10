export function ZelusLogoZ({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-label="Zelus"
    >
      {/* Outer tile — sharp edges */}
      <rect x={2} y={2} width={60} height={60} stroke="currentColor" strokeWidth={2.5} />

      {/* Corner arcs */}
      <path d="M 2,21 A 19 19 0 0 1 21,2" stroke="currentColor" strokeWidth={1.5} />
      <path d="M 43,2 A 19 19 0 0 1 62,21" stroke="currentColor" strokeWidth={1.5} />
      <path d="M 62,43 A 19 19 0 0 1 43,62" stroke="currentColor" strokeWidth={1.5} />
      <path d="M 21,62 A 19 19 0 0 1 2,43" stroke="currentColor" strokeWidth={1.5} />

      {/* Inner arcs */}
      <path d="M 12,21 A 9 9 0 0 1 21,12" stroke="currentColor" strokeWidth={1} />
      <path d="M 43,12 A 9 9 0 0 1 52,21" stroke="currentColor" strokeWidth={1} />
      <path d="M 52,43 A 9 9 0 0 1 43,52" stroke="currentColor" strokeWidth={1} />
      <path d="M 21,52 A 9 9 0 0 1 12,43" stroke="currentColor" strokeWidth={1} />

      {/* Z letterform — geometric, sits inside the diamond space */}
      <path
        d="M 21,18 L 43,18 L 21,46 L 43,46"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="square"
      />
    </svg>
  )
}
