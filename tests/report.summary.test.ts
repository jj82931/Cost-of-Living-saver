import { describe, it, expect } from 'vitest'
import { buildReportSummary } from '../lib/report/summary'
import type { ElectricityBillExtract, Plan, ComparisonResult } from '../types/billing'

const sampleBill = (over: Partial<ElectricityBillExtract> = {}): ElectricityBillExtract => ({
  retailer: 'Acme Power',
  billingPeriod: { start: '2025-01-01', end: '2025-03-31' },
  usage: { peakKWh: 1200 },
  supplyChargePerDay: 1,
  usageRates: { peak: 0.3 },
  confidence: 0.9,
  ...over,
})

const plans: Plan[] = [
  { id: 'p1', name: 'Saver A', supplyChargePerDay: 1, usageRates: { peak: 0.28 } },
  { id: 'p2', name: 'Saver B', supplyChargePerDay: 1.1, usageRates: { peak: 0.27 }, fitPerKWh: 0.05 },
]

describe('buildReportSummary', () => {
  it('returns fallback when no results', () => {
    const bill = sampleBill()
    const res = buildReportSummary(bill, plans, [])
    expect(res.headline).toMatch(/No comparable plans/)
    expect(res.best).toBeUndefined()
    expect(res.details.find(d => d.includes('Retailer: Acme Power'))).toBeTruthy()
  })

  it('picks the best (lowest cost) result', () => {
    const bill = sampleBill()
    const results: ComparisonResult[] = [
      { planId: 'p1', annualCost: 1200, assumptions: [] },
      { planId: 'p2', annualCost: 1100, assumptions: [] },
    ]
    const res = buildReportSummary(bill, plans, results)
    expect(res.best?.planId).toBe('p2')
    expect(res.headline).toMatch(/Saver B/)
    expect(res.best?.annualCost).toBe(1100)
  })

  it('aggregates unique assumptions', () => {
    const bill = sampleBill()
    const results: ComparisonResult[] = [
      { planId: 'p1', annualCost: 1200, assumptions: ['A', 'B'] },
      { planId: 'p2', annualCost: 1100, assumptions: ['B', 'C'] },
    ]
    const res = buildReportSummary(bill, plans, results)
    expect(res.assumptions.sort()).toEqual(['A', 'B', 'C'])
  })

  it('computes savings vs bill total when available', () => {
    const bill = sampleBill({ totalInclGst: 1500 })
    const results: ComparisonResult[] = [
      { planId: 'p1', annualCost: 1200, assumptions: [] },
    ]
    const res = buildReportSummary(bill, plans, results)
    expect(res.best?.savingsVsBill).toBe(300)
    expect(res.details.some(d => /Bill total/.test(d))).toBe(true)
  })
})

