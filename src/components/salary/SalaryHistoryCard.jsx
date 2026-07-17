import { Clock3 } from 'lucide-react'
import { formatMoney, formatRecordDate, paymentFrequencyLabels, salaryTypeLabels } from '../../utils/salaryMapper'
import SalaryStatusBadge from './SalaryStatusBadge'

function SalaryHistoryCard({ records = [] }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-charcoal">Salary History</h2>
          <p className="mt-1 text-sm text-stone-500">Recent compensation changes and effective periods.</p>
        </div>
        <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta"><Clock3 className="h-5 w-5" /></div>
      </div>
      {records.length === 0 ? <p className="rounded-2xl bg-ivory p-4 text-sm text-stone-500">No salary history is available yet.</p> : null}
      <div className="space-y-3">
        {records.map((record) => (
          <article key={record.id} className="rounded-2xl border border-beige bg-ivory p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold text-charcoal">{salaryTypeLabels[record.salary_type] || 'Salary'} · {paymentFrequencyLabels[record.payment_frequency] || 'Payment'}</p>
                <p className="mt-1 text-sm text-stone-500">{formatRecordDate(record.effective_from)} – {formatRecordDate(record.effective_to)}</p>
              </div>
              <SalaryStatusBadge status={record.status} />
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <p className="rounded-xl bg-white px-3 py-2 text-stone-500">Base Salary <span className="block font-semibold text-charcoal">{record.base_salary == null ? '—' : formatMoney(record.base_salary)}</span></p>
              <p className="rounded-xl bg-white px-3 py-2 text-stone-500">Hourly Rate <span className="block font-semibold text-charcoal">{record.hourly_rate == null ? '—' : formatMoney(record.hourly_rate)}</span></p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default SalaryHistoryCard
