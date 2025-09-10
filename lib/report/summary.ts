import type { ElectricityBillExtract, Plan, ComparisonResult } from '../../types/billing'

export interface SummaryBestPlan {
  planId: string
  name: string
  annualCost: number
  savingsVsBill?: number
}

export interface ReportSummary {
  headline: string
  best?: SummaryBestPlan
  assumptions: string[]
  details: string[]
}

/**
 * Build a concise summary from a matched comparison set.
 * Picks the best (lowest annualCost) result, computes savings vs bill total when available,
 * and returns human‑readable strings suitable for UI or composing emails.
 */
export function buildReportSummary(
  bill: ElectricityBillExtract,
  plans: Plan[],
  results: ComparisonResult[],
): ReportSummary {
  const assumptions = new Set<string>()
  results.forEach(r => (r.assumptions || []).forEach(a => a && assumptions.add(a)))

  const sorted = [...results].sort((a, b) => a.annualCost - b.annualCost)
  const best = sorted[0]

  if (!best) {
    return {
      headline: 'No comparable plans found',
      best: undefined,
      assumptions: Array.from(assumptions),
      details: [
        `Retailer: ${bill.retailer}`,
        `Bill period: ${bill.billingPeriod.start} to ${bill.billingPeriod.end}`,
      ],
    }
  }

  const bestPlan = plans.find(p => p.id === best.planId)

  const billTotal = bill.totalInclGst
  const savings = billTotal != null ? Number((billTotal - best.annualCost).toFixed(2)) : undefined

  const headline = bestPlan
    ? `Best plan: ${bestPlan.name} — est. $${best.annualCost.toFixed(2)}/yr`
    : `Best annual cost: $${best.annualCost.toFixed(2)}/yr`

  const details: string[] = []
  details.push(`Retailer: ${bill.retailer}`)
  details.push(`Bill period: ${bill.billingPeriod.start} to ${bill.billingPeriod.end}`)
  if (billTotal != null) details.push(`Bill total (incl. GST): $${billTotal.toFixed(2)}`)
  if (bestPlan) details.push(`Plan supply: $${bestPlan.supplyChargePerDay.toFixed(2)}/day`)

  return {
    headline,
    best: bestPlan
      ? {
          planId: best.planId,
          name: bestPlan.name,
          annualCost: Number(best.annualCost.toFixed(2)),
          savingsVsBill: savings,
        }
      : {
          planId: best.planId,
          name: best.planId,
          annualCost: Number(best.annualCost.toFixed(2)),
          savingsVsBill: savings,
        },
    assumptions: Array.from(assumptions),
    details,
  }
}

