"use client"
import { useMemo, useState } from 'react'
import FileDrop from './components/FileDrop'
import Card, { CardHeader, CardTitle, CardContent } from './components/Card'
import Skeleton from './components/Skeleton'
import EmptyState from './components/EmptyState'
import PlanTable from './components/PlanTable'
import { loadSampleElectricityPlans } from '../lib/data/electricity'
import { matchPlansForBill } from '../lib/match/electricity'
import type { ElectricityBillExtract } from '../types/billing'

export default function Home() {
  const [files, setFiles] = useState<File[]>([])
  const [loadingDemo, setLoadingDemo] = useState(false)

  const plans = useMemo(() => loadSampleElectricityPlans(), [])

  const demoBill: ElectricityBillExtract = {
    retailer: 'Demo Retailer',
    billingPeriod: { start: '2025-01-01', end: '2025-01-31' },
    usage: { peakKWh: 320, offpeakKWh: 80 },
    supplyChargePerDay: 1.0,
    usageRates: { peak: 0.30 },
    confidence: 0.9,
  }

  const results = useMemo(() => matchPlansForBill(demoBill, plans, { limit: 3 }), [plans])

  return (
    <div className="space-y-8">
      <section>
        <h1 className="ty-h1 mb-2">Design Preview</h1>
        <p className="ty-body">샘플 데이터로 컴포넌트 조합을 미리봅니다.</p>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>파일 업로드</CardTitle>
          </CardHeader>
          <CardContent>
            <FileDrop
              accept=".pdf,.png,.jpg,.jpeg,.csv"
              multiple
              onFiles={(fs) => setFiles(fs)}
            />
            {files.length > 0 ? (
              <ul className="mt-4 text-sm text-foreground/80 list-disc pl-6">
                {files.map((f) => (
                  <li key={f.name}>{f.name} ({Math.round(f.size / 1024)} KB)</li>
                ))}
              </ul>
            ) : (
              <EmptyState
                className="mt-4"
                title="선택된 파일이 없습니다"
                description="파일을 드롭하거나 클릭해 선택하세요."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>요금제 비교(샘플)</CardTitle>
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
    </div>
  )
}

