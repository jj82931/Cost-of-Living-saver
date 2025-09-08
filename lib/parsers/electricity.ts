import { ElectricityBillExtract } from '../../types/billing'

// Format date as yyyy-mm-dd using local date parts to avoid timezone shifts
const iso = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const tryParseDate = (s: string): Date | null => {
  const trimmed = s.trim()

  // dd/mm/yyyy or dd-mm-yy etc.
  let m = trimmed.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.]((?:\d{2})|(?:\d{4}))$/)
  if (m) {
    const [_, d, mo, y] = m
    const yyyy = (+y < 100 ? 2000 + +y : +y)
    return new Date(yyyy, +mo - 1, +d)
  }

  // yyyy/mm/dd or yyyy-mm-dd
  m = trimmed.match(/^(\d{4})[-\/.](\d{1,2})[-\/.]((?:\d{1,2}))$/)
  if (m) {
    const [_, y, mo, d] = m
    return new Date(+y, +mo - 1, +d)
  }

  // 01 Jan 2025 or 01-Jan-2025
  m = trimmed.match(/^(\d{1,2})[\s-]+([A-Za-z]{3,})[\s-]+(\d{2,4})$/)
  if (m) {
    const month = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    }[m[2].slice(0, 3).toLowerCase()]
    const y = m[3]
    const yyyy = (+y < 100 ? 2000 + +y : +y)
    if (month !== undefined) return new Date(yyyy, month, +m[1])
  }
  return null
}

const toDollars = (value: number, unit: 'c' | '$') => unit === 'c' ? value / 100 : value

export function parseElectricityBill(text: string): ElectricityBillExtract {
  const safe = text || ''
  let confidence = 0

  const retailer = (safe.match(/Retailer\s*:\s*(.+)/i)?.[1] || '').trim()
  if (retailer) confidence += 0.1

  const nmi = (safe.match(/\bNMI\s*[:#]?\s*([A-Z0-9]+)/i)?.[1] || '').trim() || undefined
  if (nmi) confidence += 0.1

  // Billing period
  let startISO = ''
  let endISO = ''
  const bp = safe.match(/Billing\s*Period\s*:\s*([^\n]+?)\s*[-–—]\s*([^\n]+)/im)
  if (bp) {
    const s = tryParseDate(bp[1])
    const e = tryParseDate(bp[2])
    if (s && e) {
      startISO = iso(s)
      endISO = iso(e)
      confidence += 0.25
    }
  } else {
    const bp2 = safe.match(/from\s+(.+?)\s+to\s+(.+?)(?:[\n\r]|$)/i)
    if (bp2) {
      const s = tryParseDate(bp2[1])
      const e = tryParseDate(bp2[2])
      if (s && e) {
        startISO = iso(s)
        endISO = iso(e)
        confidence += 0.25
      }
    }
  }

  // Usage kWh
  const usageMatch = safe.match(/Usage[^\n]*?Peak[^\n]*?(\d+(?:\.\d+)?)\s*kWh/i) || safe.match(/\bPeak[^\n]*?(\d+(?:\.\d+)?)\s*kWh\b/i) || safe.match(/\b(\d+)\s*kWh\b/i)
  const peakKWh = usageMatch ? parseFloat(usageMatch[1]) : 0
  if (peakKWh > 0) confidence += 0.15

  const offpeakMatch = safe.match(/Off[-\s]?peak[^\n]*?(\d+(?:\.\d+)?)\s*kWh/i)
  const offpeakKWh = offpeakMatch ? parseFloat(offpeakMatch[1]) : undefined
  if (offpeakKWh) confidence += 0.05

  // Supply charge per day
  let supplyChargePerDay = 0
  const supplyDollarFirst = safe.match(/Supply\s*Charge[^\n]*?\$\s*([\d.]+)\s*\/?\s*day/i)
  const supplyMatch = supplyDollarFirst || safe.match(/Supply\s*Charge[^\n]*?([\d.]+)\s*(c|\$)\s*\/?\s*day/i)
  if (supplyMatch) {
    if (supplyDollarFirst) {
      supplyChargePerDay = parseFloat(supplyDollarFirst[1])
    } else {
      supplyChargePerDay = toDollars(parseFloat(supplyMatch[1]), (supplyMatch[2] as 'c' | '$'))
    }
    if (supplyChargePerDay > 0) confidence += 0.15
  }

  // Usage rates
  let peakRate = 0
  let offpeakRate: number | undefined
  const peakDollarFirst = safe.match(/Peak\s*Rate[^\n]*?\$\s*([\d.]+)\s*\/?\s*kWh/i) || safe.match(/\bPeak\b[^\n]*?\$\s*([\d.]+)\s*\/?\s*kWh/i)
  const peakRateMatch = peakDollarFirst || safe.match(/Peak\s*Rate[^\n]*?([\d.]+)\s*(c|\$)\s*\/\s*kWh/i) || safe.match(/\bPeak\b[^\n]*?([\d.]+)\s*(c|\$)\s*\/?\s*kWh/i)
  if (peakRateMatch) {
    if (peakDollarFirst) {
      peakRate = parseFloat(peakDollarFirst[1])
    } else {
      peakRate = toDollars(parseFloat(peakRateMatch[1]), peakRateMatch[2] as 'c' | '$')
    }
    if (peakRate > 0) confidence += 0.1
  }
  const offDollarFirst = safe.match(/Off[-\s]?peak[^\n]*?\$\s*([\d.]+)\s*\/?\s*kWh/i)
  const offRateMatch = offDollarFirst || safe.match(/Off[-\s]?peak[^\n]*?([\d.]+)\s*(c|\$)\s*\/\s*kWh/i)
  if (offRateMatch) {
    offpeakRate = offDollarFirst ? parseFloat(offDollarFirst[1]) : toDollars(parseFloat(offRateMatch[1]), offRateMatch[2] as 'c' | '$')
    confidence += 0.05
  }

  // Feed-in tariff and total
  let fit: number | undefined
  const fitDollarFirst = safe.match(/Feed[-\s]?in\s*Tariff[^\n]*?\$\s*([\d.]+)\s*\/?\s*kWh/i)
  const fitMatch = fitDollarFirst || safe.match(/Feed[-\s]?in\s*Tariff[^\n]*?([\d.]+)\s*(c|\$)\s*\/\s*kWh/i)
  if (fitMatch) {
    fit = fitDollarFirst ? parseFloat(fitDollarFirst[1]) : toDollars(parseFloat(fitMatch[1]), fitMatch[2] as 'c' | '$')
    confidence += 0.05
  }

  let total: number | undefined
  const totalMatch = safe.match(/Total\s*\(incl\.?\s*GST\)\s*:\s*\$?([\d.]+)/i)
  if (totalMatch) {
    total = parseFloat(totalMatch[1])
    confidence += 0.05
  }

  confidence = Math.max(0, Math.min(1, confidence))

  const result: ElectricityBillExtract = {
    retailer: retailer || '',
    nmi,
    billingPeriod: {
      start: startISO || '',
      end: endISO || '',
    },
    usage: { peakKWh, ...(offpeakKWh ? { offpeakKWh } : {}) },
    supplyChargePerDay,
    usageRates: { peak: peakRate, ...(offpeakRate ? { offpeak: offpeakRate } : {}) },
    ...(fit !== undefined ? { fitPerKWh: fit } : {}),
    ...(total !== undefined ? { totalInclGst: total } : {}),
    confidence,
  }

  return result
}
