import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

const variantClass: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-primary text-primary-foreground hover:opacity-90',
  secondary:
    'bg-secondary text-secondary-foreground hover:opacity-90',
  outline:
    'border border-input bg-transparent hover:bg-muted',
  ghost:
    'bg-transparent hover:bg-muted',
  destructive:
    'bg-destructive text-destructive-foreground hover:opacity-90',
}

const sizeClass: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-9 px-4 text-sm',
  lg: 'h-10 px-6 text-base',
}

export default function Button({
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ' +
        variantClass[variant] +
        ' ' +
        sizeClass[size] +
        ' ' +
        className
      }
      {...props}
    />
  )
}

