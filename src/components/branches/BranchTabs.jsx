const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'staff', label: 'Staff' },
  { key: 'working-hours', label: 'Working Hours' },
  { key: 'holidays', label: 'Holidays' },
  { key: 'settings', label: 'Settings' },
]

function BranchTabs({ activeTab, onChange }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-beige bg-white p-2 shadow-soft">
      <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Branch details tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.key)}
              className={`min-h-11 shrink-0 rounded-2xl px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                isActive ? 'bg-brown text-white shadow-subtle' : 'text-stone-600 hover:bg-ivory hover:text-brown'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default BranchTabs
