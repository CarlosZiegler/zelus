import { HugeiconsIcon } from '@hugeicons/react'
import { AlertDiamondIcon, Alert02Icon, MinusSignIcon } from '@hugeicons/core-free-icons'

import { cn } from '~/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

type Priority = 'urgent' | 'high' | 'medium' | 'low' | null

const priorityLabels: Record<string, string> = {
  '': 'Sem prioridade',
  urgent: 'Urgente',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
}

const priorityConfig: Record<string, { icon: typeof AlertDiamondIcon; className: string }> = {
  urgent: { icon: AlertDiamondIcon, className: 'text-red-600' },
  high: { icon: Alert02Icon, className: 'text-orange-500' },
  medium: { icon: Alert02Icon, className: 'text-amber-500' },
  low: { icon: Alert02Icon, className: 'text-emerald-600' },
  '': { icon: MinusSignIcon, className: 'text-muted-foreground' },
}

function PriorityIndicator({ priority }: { priority: Priority }) {
  const key = priority ?? ''
  const { icon, className } = priorityConfig[key]
  const label = priorityLabels[key]

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm', className)}>
      <HugeiconsIcon icon={icon} size={14} strokeWidth={2} />
      {label}
    </span>
  )
}

const priorityItems = Object.entries(priorityLabels).map(([value, label]) => ({ label, value }))

function PrioritySelector({ name, defaultValue }: { name: string; defaultValue?: string }) {
  return (
    <Select name={name} defaultValue={defaultValue ?? ''} items={priorityItems}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(priorityConfig).map(([value, { icon, className }]) => (
          <SelectItem key={value} value={value}>
            <HugeiconsIcon icon={icon} size={14} strokeWidth={2} className={className} />
            <span className={className}>{priorityLabels[value]}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { PriorityIndicator, PrioritySelector, priorityLabels }
export type { Priority }
