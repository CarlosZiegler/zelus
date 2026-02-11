import { Badge } from '~/components/ui/badge'
import { cn } from '~/lib/utils'

type Status = 'open' | 'in_progress' | 'resolved' | 'closed'

const statusLabels: Record<Status, string> = {
  open: 'Em aberto',
  in_progress: 'Em progresso',
  resolved: 'Resolvido',
  closed: 'Fechado',
}

const statusStyles: Record<
  Status,
  { variant: 'default' | 'secondary' | 'outline'; className?: string }
> = {
  open: { variant: 'default' },
  in_progress: { variant: 'secondary', className: 'bg-amber-100 text-amber-800' },
  resolved: { variant: 'outline', className: 'bg-emerald-100 text-emerald-800' },
  closed: { variant: 'secondary' },
}

function StatusBadge({ status }: { status: Status }) {
  const { variant, className } = statusStyles[status]

  return (
    <Badge variant={variant} className={cn(className)}>
      {statusLabels[status]}
    </Badge>
  )
}

export { StatusBadge, statusLabels }
export type { Status }
