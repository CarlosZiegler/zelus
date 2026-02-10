import { Link } from 'react-router'

import { cn } from '~/lib/utils'
import { AzulejoOverlay } from '~/components/brand/azulejo-overlay'

export function CardLink({
  to,
  className,
  children,
}: {
  to: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      className={cn(
        'group bg-card ring-foreground/10 hover:ring-primary/20 relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 ring-1 transition-colors',
        className,
      )}
    >
      <AzulejoOverlay />
      <div className="relative flex flex-1 flex-col justify-between">{children}</div>
    </Link>
  )
}
