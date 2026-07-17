import { useEffect, useState } from 'react'
import { defaultEmployeeForm, employeeGenderOptions, employeeStatuses } from '../../utils/employeeMapper'
import { maxEmployeeAddressLength, maxEmployeeNotesLength, validateEmployeeForm } from '../../utils/employeeValidation'
import Button from '../ui/Button'
import FormField from '../ui/FormField'
import Input from '../ui/Input'

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'
const textareaClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition placeholder:text-stone-400 focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function EmployeeForm({ roles = [], branches = [], defaultValues = defaultEmployeeForm, isSubmitting = false, submitLabel = 'Save Employee', submittingLabel = 'Saving...', onCancel, onSubmit, serverErrors = {} }) {
  const [form, setForm] = useState({ ...defaultEmployeeForm, ...defaultValues })
  const [errors, setErrors] = useState({})

  useEffect(() => { setForm({ ...defaultEmployeeForm, ...defaultValues }) }, [defaultValues])
  useEffect(() => { if (Object.keys(serverErrors).length > 0) setErrors((current) => ({ ...current, ...serverErrors })) }, [serverErrors])

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: name === 'employeeCode' ? value.toUpperCase() : value }))
    setErrors((current) => {
      if (!current[name]) return current
      const nextErrors = { ...current }
      delete nextErrors[name]
      return nextErrors
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateEmployeeForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="mb-6"><h2 className="text-xl font-semibold tracking-tight text-charcoal">Employee profile</h2><p className="mt-2 text-sm leading-6 text-stone-500">Create the staff profile, role, and primary branch assignment.</p></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="employeeFirstName" label="First Name *" error={errors.firstName}><Input id="employeeFirstName" value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} hasError={Boolean(errors.firstName)} /></FormField>
          <FormField id="employeeLastName" label="Last Name *" error={errors.lastName}><Input id="employeeLastName" value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} hasError={Boolean(errors.lastName)} /></FormField>
          <FormField id="employeeCode" label="Employee Code *" error={errors.employeeCode}><Input id="employeeCode" value={form.employeeCode} onChange={(event) => updateField('employeeCode', event.target.value)} placeholder="EMP-001" hasError={Boolean(errors.employeeCode)} /></FormField>
          <FormField id="employeeStatus" label="Employment Status" error={errors.employmentStatus}><select id="employeeStatus" value={form.employmentStatus} onChange={(event) => updateField('employmentStatus', event.target.value)} className={selectClassName}>{employeeStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></FormField>
          <FormField id="employeeEmail" label="Email *" error={errors.email}><Input id="employeeEmail" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} hasError={Boolean(errors.email)} /></FormField>
          <FormField id="employeePhone" label="Phone *" error={errors.phone}><Input id="employeePhone" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} hasError={Boolean(errors.phone)} /></FormField>
          <FormField id="employeeRole" label="Role *" error={errors.roleId}><select id="employeeRole" value={form.roleId} onChange={(event) => updateField('roleId', event.target.value)} className={selectClassName}><option value="">Select role</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.role_name}</option>)}</select></FormField>
          <FormField id="employeePrimaryBranch" label="Primary Branch *" error={errors.primaryBranchId}><select id="employeePrimaryBranch" value={form.primaryBranchId} onChange={(event) => updateField('primaryBranchId', event.target.value)} className={selectClassName}><option value="">Select branch</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></FormField>
          <FormField id="employeeJoiningDate" label="Joining Date *" error={errors.joiningDate}><Input id="employeeJoiningDate" type="date" value={form.joiningDate} onChange={(event) => updateField('joiningDate', event.target.value)} hasError={Boolean(errors.joiningDate)} /></FormField>
          <FormField id="employeeDateOfBirth" label="Date of Birth" error={errors.dateOfBirth}><Input id="employeeDateOfBirth" type="date" value={form.dateOfBirth} onChange={(event) => updateField('dateOfBirth', event.target.value)} hasError={Boolean(errors.dateOfBirth)} /></FormField>
          <FormField id="employeeGender" label="Gender" error={errors.gender}><select id="employeeGender" value={form.gender} onChange={(event) => updateField('gender', event.target.value)} className={selectClassName}>{employeeGenderOptions.map((gender) => <option key={gender.value || 'none'} value={gender.value}>{gender.label}</option>)}</select></FormField>
          <FormField id="employeeProfilePhotoUrl" label="Profile Photo URL" error={errors.profilePhotoUrl}><Input id="employeeProfilePhotoUrl" value={form.profilePhotoUrl} onChange={(event) => updateField('profilePhotoUrl', event.target.value)} hasError={Boolean(errors.profilePhotoUrl)} /></FormField>
        </div>
      </section>

      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="mb-6"><h2 className="text-xl font-semibold tracking-tight text-charcoal">Emergency contact and address</h2></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="emergencyName" label="Emergency Contact Name" error={errors.emergencyContactName}><Input id="emergencyName" value={form.emergencyContactName} onChange={(event) => updateField('emergencyContactName', event.target.value)} hasError={Boolean(errors.emergencyContactName)} /></FormField>
          <FormField id="emergencyPhone" label="Emergency Contact Phone" error={errors.emergencyContactPhone}><Input id="emergencyPhone" value={form.emergencyContactPhone} onChange={(event) => updateField('emergencyContactPhone', event.target.value)} hasError={Boolean(errors.emergencyContactPhone)} /></FormField>
          <div className="sm:col-span-2"><FormField id="employeeAddress" label="Address" error={errors.address}><textarea id="employeeAddress" rows="4" value={form.address} onChange={(event) => updateField('address', event.target.value)} className={`${textareaClassName} ${errors.address ? 'border-rose-muted' : ''}`} /><p className="text-xs font-medium text-stone-400">{form.address.length}/{maxEmployeeAddressLength} characters</p></FormField></div>
          <FormField id="employeeCity" label="City" error={errors.city}><Input id="employeeCity" value={form.city} onChange={(event) => updateField('city', event.target.value)} hasError={Boolean(errors.city)} /></FormField>
          <FormField id="employeeState" label="State" error={errors.state}><Input id="employeeState" value={form.state} onChange={(event) => updateField('state', event.target.value)} hasError={Boolean(errors.state)} /></FormField>
          <FormField id="employeePostalCode" label="Postal Code" error={errors.postalCode}><Input id="employeePostalCode" value={form.postalCode} onChange={(event) => updateField('postalCode', event.target.value)} hasError={Boolean(errors.postalCode)} /></FormField>
          <FormField id="employeeCountry" label="Country" error={errors.country}><Input id="employeeCountry" value={form.country} onChange={(event) => updateField('country', event.target.value)} hasError={Boolean(errors.country)} /></FormField>
        </div>
      </section>

      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft"><FormField id="employeeNotes" label="Notes" error={errors.notes}><textarea id="employeeNotes" rows="5" value={form.notes} onChange={(event) => updateField('notes', event.target.value)} className={`${textareaClassName} ${errors.notes ? 'border-rose-muted' : ''}`} /><p className="text-xs font-medium text-stone-400">{form.notes.length}/{maxEmployeeNotesLength} characters</p></FormField></section>

      <div className="sticky bottom-5 z-10 rounded-[2rem] border border-beige bg-white/95 p-4 shadow-soft backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4"><p className="text-sm leading-6 text-stone-500">Employees are saved to your current organization workspace.</p><div className="mt-4 grid gap-3 sm:mt-0 sm:min-w-96 sm:grid-cols-2"><button type="button" onClick={onCancel} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-beige bg-white px-5 text-sm font-semibold text-brown transition hover:bg-cream">Cancel</button><Button type="submit" isLoading={isSubmitting}>{isSubmitting ? submittingLabel : submitLabel}</Button></div></div>
    </form>
  )
}

export default EmployeeForm
