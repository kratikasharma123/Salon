import { useEffect, useState } from 'react'
import { updateBranch } from '../../services/branchService'
import { branchToBranchForm, normalizeWorkingHours } from '../../utils/branchMappers'
import { getAuthErrorMessage } from '../../utils/authHelpers'
import { hasWorkingHoursErrors, validateWorkingHours } from '../../utils/branchValidation'
import Button from '../ui/Button'
import BusinessHours from './BusinessHours'

function BranchWorkingHoursPanel({ branch, onSaved }) {
  const [workingHours, setWorkingHours] = useState(normalizeWorkingHours(branch.working_hours, branch.opening_time, branch.closing_time))
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setWorkingHours(normalizeWorkingHours(branch.working_hours, branch.opening_time, branch.closing_time))
    setErrors({})
  }, [branch])

  async function handleSave() {
    const nextErrors = validateWorkingHours(workingHours)
    setErrors(nextErrors)
    setMessage(null)
    if (hasWorkingHoursErrors(nextErrors)) return

    setIsSubmitting(true)
    try {
      const updatedBranch = await updateBranch(branch.id, { ...branchToBranchForm(branch), workingHours })
      setMessage({ type: 'success', message: 'Working hours updated successfully.' })
      onSaved?.(updatedBranch)
    } catch (submitError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleDiscard() {
    setWorkingHours(normalizeWorkingHours(branch.working_hours, branch.opening_time, branch.closing_time))
    setErrors({})
    setMessage(null)
  }

  return (
    <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-charcoal">Working Hours</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">Configure weekly operating hours, closed days, and optional breaks.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={handleDiscard} className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-beige bg-white px-4 text-sm font-semibold text-brown transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">Discard Changes</button>
          <Button type="button" onClick={handleSave} isLoading={isSubmitting} className="w-auto min-w-36">Save Hours</Button>
        </div>
      </div>

      {message ? <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-semibold ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10 text-rose-muted' : 'border-terracotta/25 bg-terracotta/10 text-charcoal'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}

      <BusinessHours value={workingHours} errors={errors} onChange={setWorkingHours} />
    </section>
  )
}

export default BranchWorkingHoursPanel
