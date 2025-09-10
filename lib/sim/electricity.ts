import { ElectricityBillExtract, Plan, Usage } from '../../types/billing'

const MS_DAY = 24 * 60 * 60 * 1000

const parseISO = (s: string) => new Date(s + (s.includes('T') ? '' : 'T00:00:00'))

export interface DailyUsage extends Usage {
  /** kWh exported back to grid per day (optional) */
  feedInKWh?: number
}

export interface SimResult {
  annualCost: number
  assumptions: string[]
  breakdown?: {
    supply: number
    usage: number
    credits: number
  }
}

/**
 * Compute annual cost estimate from a plan and daily usage assumptions.
 */
export function simulateAnnualCost(plan: Plan, daily: DailyUsage, days: number = 365): SimResult {
  const assumptions: string[] = []
  const d = Math.max(1, Math.round(days))

  const supply = plan.supplyChargePerDay * d

  const peakPerDay = Math.max(0, daily.peakKWh || 0)
  const offPerDay = Math.max(0, daily.offpeakKWh || 0)
  const feedInPerDay = Math.max(0, daily.feedInKWh || 0)

  const peakUsageCost = peakPerDay * (plan.usageRates.peak || 0) * d
  const offUsageCost = (plan.usageRates.offpeak ? offPerDay * plan.usageRates.offpeak * d : 0)
  const usage = peakUsageCost + offUsageCost

  const credits = plan.fitPerKWh ? plan.fitPerKWh * feedInPerDay * d : 0

  const annualCost = supply + usage - credits
  if (!plan.usageRates.offpeak && offPerDay > 0) {
    assumptions.push('Off-peak usage present but plan has no off-peak rate.')
  }
  if (!plan.fitPerKWh && feedInPerDay > 0) {
    assumptions.push('Feed-in provided but plan has no FiT.')
  }

  return {
    annualCost,
    assumptions,
    breakdown: { supply, usage, credits },
  }
}

/**
 * Annualize usage from a sample bill and evaluate a plan.
 */
export function annualizeFromBill(plan: Plan, bill: ElectricityBillExtract): SimResult {
  const start = parseISO(bill.billingPeriod.start)
  const end = parseISO(bill.billingPeriod.end)
  const spanDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / MS_DAY) + 1)

  const daily: DailyUsage = {
    peakKWh: (bill.usage.peakKWh || 0) / spanDays,
    ...(bill.usage.offpeakKWh ? { offpeakKWh: bill.usage.offpeakKWh / spanDays } : {}),
  }
  const res = simulateAnnualCost(plan, daily, 365)
  res.assumptions = [
    `Annualized from ${spanDays} day bill period`,
    ...res.assumptions,
  ]
  return res
}

