import React from 'react'
import Icon from './Icon'

interface TipProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  children?: React.ReactNode
}

export default function Tip({ title = 'Tip', children, className = '', ...props }: TipProps) {
  return (
    <div className={'flex gap-3 items-start rounded-md border p-3 bg-muted/50 ' + className} {...props}>
      <div className="mt-1 text-primary">
        <Icon name="info" />
      </div>
      <div>
        <div className="font-medium mb-1">{title}</div>
        {children && <div className="text-sm text-foreground/80">{children}</div>}
      </div>
    </div>
  )
}

