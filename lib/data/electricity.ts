import type { Plan } from '../../types/billing'
import plans from '../../data/electricity/plans.sample.json'

export function loadSampleElectricityPlans(): Plan[] {
  // Trust types via TS json module import; validate minimally at runtime
  return (plans as unknown as Plan[]).map(p => ({
    id: String(p.id),
    name: String(p.name),
    supplyChargePerDay: Number(p.supplyChargePerDay) || 0,
    usageRates: {
      peak: Number(p.usageRates?.peak) || 0,
      ...(p.usageRates?.offpeak != null ? { offpeak: Number(p.usageRates.offpeak) || 0 } : {}),
    },
    ...(p.fitPerKWh != null ? { fitPerKWh: Number(p.fitPerKWh) || 0 } : {}),
  }))
}

