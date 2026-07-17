import { CalendarDays, IndianRupee, Scissors } from 'lucide-react'
import { formatPackageDate, formatPackageMoney, getPackageSavings } from '../../utils/comboPackageMapper'
import { formatServiceDuration, formatServiceMoney } from '../../utils/serviceMapper'

function DetailRow({ label, value }) {
  return (
    <div className="rounded-2xl bg-ivory p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-charcoal">{value}</p>
    </div>
  )
}

function ComboPackageDetailsCard({ comboPackage }) {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold tracking-tight text-charcoal">Package Information</h2>
        <p className="mt-2 text-sm leading-6 text-stone-500">{comboPackage.description || 'No description added.'}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <DetailRow label="Original Price" value={formatPackageMoney(comboPackage.original_price)} />
          <DetailRow label="Package Price" value={formatPackageMoney(comboPackage.package_price)} />
          <DetailRow label="Savings" value={formatPackageMoney(getPackageSavings(comboPackage))} />
          <DetailRow label="Created" value={formatPackageDate(comboPackage.created_at)} />
        </div>
      </section>

      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta"><Scissors className="h-5 w-5" /></div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-charcoal">Included Services</h2>
            <p className="text-sm text-stone-500">{comboPackage.services_count} services in this package</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          {comboPackage.services?.length ? comboPackage.services.map((service) => (
            <div key={service.id} className="rounded-2xl border border-beige bg-ivory p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-charcoal">{service.name}</p>
                  <p className="mt-1 text-xs font-semibold text-brown">{service.service_code}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm font-semibold text-stone-500">
                  <span>{formatServiceDuration(service.duration_minutes)}</span>
                  <span>{formatServiceMoney(service.price)}</span>
                </div>
              </div>
            </div>
          )) : <p className="rounded-2xl bg-ivory p-4 text-sm text-stone-500">No services assigned.</p>}
        </div>
      </section>

      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta"><CalendarDays className="h-5 w-5" /></div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-charcoal">Recent Activity</h2>
            <p className="text-sm text-stone-500">Package booking activity will appear here once appointments are integrated.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export function ComboPackageMetricCard({ label, value, icon: Icon = IndianRupee }) {
  return (
    <div className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta"><Icon className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">{label}</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-charcoal">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default ComboPackageDetailsCard
