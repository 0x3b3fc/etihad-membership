import { Badge } from '@/components/shadcn/badge'
import { cn } from '@/lib/utils'

type Status = 'PENDING' | 'ACCEPTED' | 'REJECTED'

const statusConfig: Record<Status, { label: string; className: string }> = {
  PENDING: {
    label: 'قيد المراجعة',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  },
  ACCEPTED: {
    label: 'مقبول',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  REJECTED: {
    label: 'مرفوض',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
