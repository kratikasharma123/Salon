import { MapPin, Navigation } from 'lucide-react'
import { getBranchAddress } from '../../utils/branchMappers'

function LocationCard({ branch }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-charcoal">Location</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">Physical branch address and coordinates.</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        <div className="rounded-2xl border border-beige bg-ivory p-4">
          <p className="font-semibold text-charcoal">{getBranchAddress(branch)}</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-beige bg-ivory p-4 text-sm text-charcoal">
          <Navigation className="h-4 w-4 text-terracotta" />
          {branch.latitude && branch.longitude ? `${branch.latitude}, ${branch.longitude}` : 'Coordinates not added yet'}
        </div>
      </div>
    </section>
  )
}

export default LocationCard
