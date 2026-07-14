import { Inbox } from 'lucide-react'

function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-beige bg-ivory p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-semibold text-charcoal">{title}</h3>
      {description ? <p className="mt-2 text-sm leading-6 text-stone-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export default EmptyState
