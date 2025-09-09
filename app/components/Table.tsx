import { PropsWithChildren } from 'react'

type TableProps = React.TableHTMLAttributes<HTMLTableElement>
type SectionProps = React.HTMLAttributes<HTMLTableSectionElement>
type RowProps = React.HTMLAttributes<HTMLTableRowElement>
type CellProps = React.ThHTMLAttributes<HTMLTableCellElement> & React.TdHTMLAttributes<HTMLTableCellElement>

export function Table({ className = '', ...props }: TableProps) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        className={
          'w-full caption-bottom text-sm border-separate border-spacing-0 ' + className
        }
        {...props}
      />
    </div>
  )
}

export function THead({ className = '', ...props }: SectionProps) {
  return <thead className={'' + className} {...props} />
}

export function TBody({ className = '', ...props }: SectionProps) {
  return <tbody className={'' + className} {...props} />
}

export function TRow({ className = '', ...props }: RowProps) {
  return <tr className={'border-b last:border-0 ' + className} {...props} />
}

export function THeadCell({ className = '', ...props }: CellProps) {
  return (
    <th
      className={'h-10 px-4 text-left align-middle font-medium text-foreground/80 bg-muted ' + className}
      {...props}
    />
  )
}

export function TCell({ className = '', ...props }: CellProps) {
  return <td className={'p-4 align-middle ' + className} {...props} />
}

export default Table

