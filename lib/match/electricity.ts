import type { ElectricityBillExtract, Plan, ComparisonResult } from '../../types/billing'
import { annualizeFromBill } from '../sim/electricity'

export interface MatchOptions {
  limit?: number
}

export function matchPlansForBill(bill: ElectricityBillExtract, plans: Plan[], opts: MatchOptions = {}): ComparisonResult[] {
  const limit = opts.limit ?? 5
  const results = plans.map((p) => {
    const sim = annualizeFromBill(p, bill)
    return {
      planId: p.id,
      annualCost: sim.annualCost,
      assumptions: sim.assumptions,
    } as ComparisonResult
  })
  return results.sort((a, b) => a.annualCost - b.annualCost).slice(0, limit)
}

