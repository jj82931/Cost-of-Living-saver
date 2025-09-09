import { PropsWithChildren } from 'react'

type DivProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className = '', ...props }: DivProps) {
  return (
    <div
      className={
        'rounded-lg border bg-card text-card-foreground shadow-sm ' + className
      }
      {...props}
    />
  )
}

export function CardHeader({ className = '', ...props }: DivProps) {
  return <div className={'p-4 border-b ' + className} {...props} />
}

export function CardTitle({ className = '', ...props }: PropsWithChildren<DivProps>) {
  return (
    <h3 className={'text-lg font-semibold leading-none tracking-tight ' + className} {...props} />
  )
}

export function CardContent({ className = '', ...props }: DivProps) {
  return <div className={'p-4 ' + className} {...props} />
}

export function CardFooter({ className = '', ...props }: DivProps) {
  return <div className={'p-4 border-t ' + className} {...props} />
}

export default Card

