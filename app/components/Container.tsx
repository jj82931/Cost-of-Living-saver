type DivProps = React.HTMLAttributes<HTMLDivElement>

export default function Container({ className = '', ...props }: DivProps) {
  return <div className={'mx-auto max-w-5xl px-4 ' + className} {...props} />
}

