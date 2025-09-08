export interface BillingPeriod {
  start: string // ISO date yyyy-mm-dd
  end: string   // ISO date yyyy-mm-dd
}

export interface Usage {
  peakKWh: number
  offpeakKWh?: number
}

export interface UsageRates {
  peak: number // dollars per kWh
  offpeak?: number // dollars per kWh
}

export interface ElectricityBillExtract {
  retailer: string
  nmi?: string
  billingPeriod: BillingPeriod
  usage: Usage
  supplyChargePerDay: number // dollars per day
  usageRates: UsageRates
  fitPerKWh?: number // dollars per kWh
  totalInclGst?: number
  confidence: number // 0..1
}

export interface Plan {
  id: string
  name: string
  supplyChargePerDay: number
  usageRates: UsageRates
  fitPerKWh?: number
}

export interface ComparisonResult {
  planId: string
  annualCost: number
  assumptions: string[]
}

