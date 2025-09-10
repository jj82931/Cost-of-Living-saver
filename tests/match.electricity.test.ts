import { describe, it, expect } from 'vitest'
import { loadSampleElectricityPlans } from '../lib/data/electricity'
import { matchPlansForBill } from '../lib/match/electricity'
import type { ElectricityBillExtract } from '../types/billing'

describe('matchPlansForBill', () => {
  it('ranks plans by estimated annual cost', () => {
    const plans = loadSampleElectricityPlans()
    const bill: ElectricityBillExtract = {
      retailer: 'X',
      billingPeriod: { start: '2025-01-01', end: '2025-01-31' },
      usage: { peakKWh: 300 },
      supplyChargePerDay: 1,
      usageRates: { peak: 0.3 },
      confidence: 1,
    }
    const top = matchPlansForBill(bill, plans, { limit: 2 })
    expect(top.length).toBe(2)
    // Ensure ascending by annual cost
    expect(top[0].annualCost).toBeLessThanOrEqual(top[1].annualCost)
  })
})

