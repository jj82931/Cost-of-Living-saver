import { describe, it, expect } from 'vitest'
import { loadSampleElectricityPlans } from '../lib/data/electricity'

describe('loadSampleElectricityPlans', () => {
  it('loads a non-empty list with required fields', () => {
    const plans = loadSampleElectricityPlans()
    expect(Array.isArray(plans)).toBe(true)
    expect(plans.length).toBeGreaterThanOrEqual(3)
    for (const p of plans) {
      expect(typeof p.id).toBe('string')
      expect(typeof p.name).toBe('string')
      expect(typeof p.supplyChargePerDay).toBe('number')
      expect(typeof p.usageRates.peak).toBe('number')
    }
  })
})

