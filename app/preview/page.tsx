"use client"
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card'
import PlanTable from '../components/PlanTable'
import Button from '../components/Button'
import Icon from '../components/Icon'
import Tip from '../components/Tip'
import Skeleton from '../components/Skeleton'
import { useMemo, useState } from 'react'
import { loadSampleElectricityPlans } from '../../lib/data/electricity'
import { matchPlansForBill } from '../../lib/match/electricity'
import { buildReportSummary } from '../../lib/report/summary'
import type { ElectricityBillExtract } from '../../types/billing'

export default function PreviewPage() {
  const [loadingDemo, setLoadingDemo] = useState(false)
  const plans = useMemo(() => loadSampleElectricityPlans(), [])

  const demoBill: ElectricityBillExtract = {
    retailer: 'Demo Retailer',
    billingPeriod: { start: '2025-01-01', end: '2025-01-31' },
    usage: { peakKWh: 320, offpeakKWh: 80 },
    supplyChargePerDay: 1.0,
    usageRates: { peak: 0.30 },
    totalInclGst: 180,
    confidence: 0.9,
  }

  const results = useMemo(() => matchPlansForBill(demoBill, plans, { limit: 3 }), [plans])
  const summary = useMemo(() => buildReportSummary(demoBill, plans, results), [plans, results])

  return (
    <div className="space-y-8">
      <section>
        <h1 className="ty-h1 mb-2">UI Preview</h1>
        <p className="ty-body">New components and report summary samples.</p>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Buttons · Icons · Tip</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button><Icon name="arrow-right" /> Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex items-center gap-4 text-xl mb-4">
              <Icon name="check" />
              <Icon name="info" />
              <Icon name="warning" />
              <Icon name="upload" />
              <Icon name="arrow-right" />
            </div>
            <Tip title="Sample Tip">This box demonstrates the Tip component.</Tip>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Plan Comparison (Sample)</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDemo ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : (
              <PlanTable plans={plans} results={results} title="Sample Plans" />
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Report Summary (Sample)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium">{summary.headline}</div>
              {summary.best?.savingsVsBill != null && (
                <div className="text-sm text-foreground/80">
                  Estimated savings: ${summary.best.savingsVsBill.toFixed(2)} / year
                </div>
              )}
              {summary.assumptions.length > 0 && (
                <ul className="list-disc pl-5 text-sm text-foreground/70">
                  {summary.assumptions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

