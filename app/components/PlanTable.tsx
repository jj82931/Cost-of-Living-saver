import { Plan, ComparisonResult } from '../../types/billing'
import Table, { THead, TBody, TRow, THeadCell, TCell } from './Table'

interface PlanTableProps {
  plans: Plan[]
  results?: ComparisonResult[]
  className?: string
  title?: string
}

export default function PlanTable({ plans, results, className = '', title = 'Plans' }: PlanTableProps) {
  const byId = new Map<string, ComparisonResult>()
  results?.forEach(r => byId.set(r.planId, r))

  const sortedPlans = results && results.length > 0
    ? [...plans].sort((a, b) => (byId.get(a.id)?.annualCost ?? Infinity) - (byId.get(b.id)?.annualCost ?? Infinity))
    : plans

  const best = results && results.length > 0 ? results[0] : undefined

  return (
    <div className={className}>
      <div className="mb-3">
        <h2 className="ty-h2">{title}</h2>
        <p className="ty-body text-foreground/70">
          {sortedPlans.length} plans
          {best ? ` • Best annual cost: $${best.annualCost.toFixed(2)}` : ''}
        </p>
      </div>
      <Table>
        <THead>
          <TRow>
            <THeadCell>Name</THeadCell>
            <THeadCell>Supply $/day</THeadCell>
            <THeadCell>Peak $/kWh</THeadCell>
            <THeadCell>Off-peak $/kWh</THeadCell>
            <THeadCell>FiT $/kWh</THeadCell>
            <THeadCell>Annual cost</THeadCell>
          </TRow>
        </THead>
        <TBody>
          {sortedPlans.map((p) => {
            const r = byId.get(p.id)
            return (
              <TRow key={p.id}>
                <TCell>{p.name}</TCell>
                <TCell>{p.supplyChargePerDay.toFixed(2)}</TCell>
                <TCell>{p.usageRates.peak.toFixed(2)}</TCell>
                <TCell>{p.usageRates.offpeak != null ? p.usageRates.offpeak.toFixed(2) : '-'}</TCell>
                <TCell>{p.fitPerKWh != null ? p.fitPerKWh.toFixed(2) : '-'}</TCell>
                <TCell>{r ? `$${r.annualCost.toFixed(2)}` : '-'}</TCell>
              </TRow>
            )
          })}
        </TBody>
      </Table>
    </div>
  )
}

