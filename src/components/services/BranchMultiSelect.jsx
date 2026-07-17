function BranchMultiSelect({ branches = [], selectedIds = [], onChange, error }) {
  function toggleBranch(branchId) {
    if (selectedIds.includes(branchId)) {
      onChange(selectedIds.filter((id) => id !== branchId))
    } else {
      onChange([...selectedIds, branchId])
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {branches.map((branch) => (
          <label key={branch.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-terracotta ${selectedIds.includes(branch.id) ? 'border-terracotta bg-terracotta/10' : 'border-beige bg-white hover:bg-ivory'}`}>
            <input
              type="checkbox"
              checked={selectedIds.includes(branch.id)}
              onChange={() => toggleBranch(branch.id)}
              className="mt-1 h-4 w-4 rounded border-beige text-terracotta focus:ring-terracotta"
            />
            <span>
              <span className="block font-semibold text-charcoal">{branch.name}</span>
              <span className="mt-1 block text-xs font-medium text-stone-500">{branch.branch_code || branch.city || 'Branch'}</span>
            </span>
          </label>
        ))}
      </div>
      {branches.length === 0 ? <p className="rounded-2xl border border-beige bg-ivory p-4 text-sm text-stone-500">Create a branch before assigning services.</p> : null}
      {error ? <p className="text-sm font-medium text-rose-muted">{error}</p> : null}
    </div>
  )
}

export default BranchMultiSelect
