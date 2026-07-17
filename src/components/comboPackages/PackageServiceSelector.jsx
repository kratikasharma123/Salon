import { CheckCircle2 } from 'lucide-react'
import { formatServiceDuration, formatServiceMoney } from '../../utils/serviceMapper'

function PackageServiceSelector({ services = [], selectedIds = [], onChange, error }) {
  function toggleService(serviceId) {
    if (selectedIds.includes(serviceId)) onChange(selectedIds.filter((id) => id !== serviceId))
    else onChange([...selectedIds, serviceId])
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => {
          const selected = selectedIds.includes(service.id)
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => toggleService(service.id)}
              className={`rounded-[1.5rem] border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${selected ? 'border-terracotta bg-terracotta/10' : 'border-beige bg-white hover:bg-ivory'}`}
              aria-pressed={selected}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-charcoal">{service.name}</p>
                  <p className="mt-1 text-xs font-semibold text-brown">{service.service_code}</p>
                </div>
                {selected ? <CheckCircle2 className="h-5 w-5 text-terracotta" /> : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-stone-500">
                <span>{formatServiceMoney(service.price)}</span>
                <span>·</span>
                <span>{formatServiceDuration(service.duration_minutes)}</span>
              </div>
            </button>
          )
        })}
      </div>
      {error ? <p className="text-sm font-semibold text-rose-muted">{error}</p> : null}
    </div>
  )
}

export default PackageServiceSelector
