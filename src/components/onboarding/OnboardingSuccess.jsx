import { CheckCircle2, LayoutDashboard } from 'lucide-react'
import { Link } from 'react-router-dom'

function formatValue(value) {
  return value || 'Not provided'
}

function OnboardingSuccess({ form }) {
  const summary = [
    { label: 'Business Name', value: formatValue(form.businessName) },
    { label: 'Business Type', value: formatValue(form.businessType) },
    { label: 'Currency', value: formatValue(form.currency) },
    { label: 'Time Zone', value: formatValue(form.timezone) },
  ]

  return (
    <div className="rounded-[2rem] border border-beige bg-white p-6 text-center shadow-soft sm:p-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <div className="mx-auto mt-6 max-w-xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-terracotta">Setup complete</p>
        <h2 className="text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
          Your SalonPro workspace is ready
        </h2>
        <p className="text-sm leading-6 text-stone-500 sm:text-base">
          Your business setup is complete. Start managing your salon from your new workspace.
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-2xl gap-3 rounded-[1.5rem] border border-beige bg-ivory p-4 text-left sm:grid-cols-2">
        {summary.map((item) => (
          <div key={item.label} className="rounded-2xl border border-beige bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">{item.label}</p>
            <p className="mt-2 font-semibold text-charcoal">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-8 max-w-sm">
        <Link
          to="/dashboard"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brown px-5 py-3.5 text-sm font-semibold text-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
        >
          <LayoutDashboard className="h-4 w-4" />
          Open Dashboard
        </Link>
      </div>
    </div>
  )
}

export default OnboardingSuccess
