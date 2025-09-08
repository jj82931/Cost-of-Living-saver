import { describe, it, expect } from "vitest";
import { parseElectricityBill } from "../lib/parsers/electricity";

describe("parseElectricityBill", () => {
  it("parses a typical retailer bill with full details", () => {
    const sample = `
Retailer: Example Energy
Account: 123456
NMI: N1234567890
Billing Period: 01/02/2025 - 28/02/2025

Usage Peak 350.5 kWh
  Off-peak 120 kWh

Charges
  Supply Charge 110 c/day
  Peak Rate 28 c/kWh
  Off-peak 20 c/kWh
  Feed-in Tariff 5 c/kWh

Total (incl. GST): $123.45
`;

    const res = parseElectricityBill(sample);

    expect(res.retailer).toBe("Example Energy");
    expect(res.nmi).toBe("N1234567890");

    expect(res.billingPeriod.start).toBe("2025-02-01");
    expect(res.billingPeriod.end).toBe("2025-02-28");

    expect(res.usage.peakKWh).toBeCloseTo(350.5, 3);
    expect(res.usage.offpeakKWh).toBe(120);

    // cents converted to dollars
    expect(res.supplyChargePerDay).toBeCloseTo(1.1, 3);
    expect(res.usageRates.peak).toBeCloseTo(0.28, 3);
    expect(res.usageRates.offpeak).toBeCloseTo(0.2, 3);
    expect(res.fitPerKWh).toBeCloseTo(0.05, 3);

    expect(res.totalInclGst).toBeCloseTo(123.45, 2);

    // sanity check on confidence aggregation
    expect(res.confidence).toBeGreaterThanOrEqual(0.8);
    expect(res.confidence).toBeLessThanOrEqual(1);
  });

  it("parses alternate date format: 01 Jan 2025 - 31 Jan 2025", () => {
    const sample = `
Retailer: Alt Retail
NMI # ABC9876543
Billing Period: 01 Jan 2025 - 31 Jan 2025
Peak Rate 30 c/kWh
Supply Charge 120 c/day
Usage 400 kWh
`;

    const res = parseElectricityBill(sample);

    expect(res.retailer).toBe("Alt Retail");
    expect(res.nmi).toBe("ABC9876543");

    expect(res.billingPeriod.start).toBe("2025-01-01");
    expect(res.billingPeriod.end).toBe("2025-01-31");

    // Accept either explicit $ or cent conversion
    expect(res.usageRates.peak).toBeCloseTo(0.3, 3);
    expect(res.supplyChargePerDay).toBeCloseTo(1.2, 3);

    // Generic kWh fallback should capture usage
    expect(res.usage.peakKWh).toBe(400);

    expect(res.confidence).toBeGreaterThan(0.3);
  });

  it("parses from-to sentence with dd/mm/yy", () => {
    const sample = `
Retailer: Sample Co
Your billing is from 1/2/25 to 28/2/25
Peak Rate $0.27 / kWh
Supply Charge 95 c/day
Peak 500 kWh
`;

    const res = parseElectricityBill(sample);

    expect(res.retailer).toBe("Sample Co");
    expect(res.billingPeriod.start).toBe("2025-02-01");
    expect(res.billingPeriod.end).toBe("2025-02-28");
    expect(res.usageRates.peak).toBeCloseTo(0.27, 3);
    expect(res.supplyChargePerDay).toBeCloseTo(0.95, 3);
    expect(res.usage.peakKWh).toBe(500);
  });

  it("parses yyyy/mm/dd format and hyphen month names", () => {
    const sample = `
Retailer: Wide Formats
Billing Period: 2025/02/01 - 2025/02/28
Off-peak 80 kWh
Supply Charge $1.00 / day
Peak Rate 31 c/kWh
Feed-in Tariff $0.06 / kWh
`;

    const res = parseElectricityBill(sample);

    expect(res.billingPeriod.start).toBe("2025-02-01");
    expect(res.billingPeriod.end).toBe("2025-02-28");
    expect(res.usageRates.peak).toBeCloseTo(0.31, 3);
    expect(res.supplyChargePerDay).toBeCloseTo(1.0, 3);
    expect(res.fitPerKWh).toBeCloseTo(0.06, 3);
  });

  it("handles missing fields gracefully with safe defaults", () => {
    const res = parseElectricityBill("just some unrelated text");

    expect(res.retailer).toBe("");
    expect(res.nmi).toBeUndefined();
    expect(res.billingPeriod.start).toBe("");
    expect(res.billingPeriod.end).toBe("");
    expect(res.usage.peakKWh).toBe(0);
    expect(res.supplyChargePerDay).toBe(0);
    expect(res.usageRates.peak).toBe(0);
    expect(res.confidence).toBeGreaterThanOrEqual(0);
    expect(res.confidence).toBeLessThanOrEqual(1);
  });
});
