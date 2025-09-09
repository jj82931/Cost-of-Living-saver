type DivProps = React.HTMLAttributes<HTMLDivElement>

export default function Skeleton({ className = '', ...props }: DivProps) {
  return (
    <div
      className={'animate-pulse rounded-md bg-foreground/10 dark:bg-foreground/20 ' + className}
      {...props}
    />
  )
}

