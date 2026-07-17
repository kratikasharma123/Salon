import { MapPinned, Navigation } from 'lucide-react'
import { getBranchAddress } from '../../utils/branchMappers'

function BranchMapCard({ branch }) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-beige bg-white shadow-soft">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta">
            <MapPinned className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-charcoal">Branch Location</h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">Google Maps integration placeholder for this branch.</p>
          </div>
        </div>
      </div>
      <div className="mx-6 mb-6 flex min-h-64 items-center justify-center rounded-[2rem] border border-dashed border-beige bg-ivory p-6 text-center">
        <div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
            <Navigation className="h-6 w-6" />
          </div>
          <p className="mt-4 font-semibold text-charcoal">Map preview coming soon</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-stone-500">{getBranchAddress(branch) || 'Branch address not available yet.'}</p>
          {branch.latitude && branch.longitude ? <p className="mt-2 text-xs font-semibold text-brown">{branch.latitude}, {branch.longitude}</p> : null}
        </div>
      </div>
    </section>
  )
}

export default BranchMapCard
