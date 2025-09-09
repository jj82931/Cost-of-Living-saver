import { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export default function EmptyState({ title, description, icon, action, className = '' }: EmptyStateProps) {
  return (
    <div className={'flex flex-col items-center justify-center text-center p-8 gap-3 ' + className}>
      {icon && <div className="text-foreground/50">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-sm text-foreground/70 max-w-prose">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

