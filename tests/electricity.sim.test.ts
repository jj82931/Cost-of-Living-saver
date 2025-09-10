import { describe, it, expect } from 'vitest'
import { simulateAnnualCost, annualizeFromBill } from '../lib/sim/electricity'
import type { Plan, ElectricityBillExtract } from '../types/billing'

describe('electricity simulation', () => {
  it('computes annual cost from daily usage', () => {
    const plan: Plan = {
      id: 'p1',
      name: 'Test Plan',
      supplyChargePerDay: 1.0,
      usageRates: { peak: 0.3, offpeak: 0.2 },
      fitPerKWh: 0.05,
    }
    const res = simulateAnnualCost(
      plan,
      { peakKWh: 10, offpeakKWh: 5, feedInKWh: 2 },
      365,
    )
    expect(res.annualCost).toBeCloseTo(1788.5, 2)
  })

  it('annualizes from a bill period and evaluates a plan', () => {
    const plan: Plan = {
      id: 'p1',
      name: 'Test Plan',
      supplyChargePerDay: 1.0,
      usageRates: { peak: 0.3 },
    }
    const bill: ElectricityBillExtract = {
      retailer: 'R',
      billingPeriod: { start: '2025-02-01', end: '2025-02-28' },
      usage: { peakKWh: 280 }, // 10 kWh/day over 28 days
      supplyChargePerDay: 1.0,
      usageRates: { peak: 0.3 },
      confidence: 1,
    }
    const res = annualizeFromBill(plan, bill)
    // supply: 365*1 = 365, usage: 10*0.3*365 = 1095
    expect(res.annualCost).toBeCloseTo(1460, 1)
  })
})

