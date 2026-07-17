import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import FormField from '../ui/FormField'
import Input from '../ui/Input'
import { categoryIconOptions, categoryStatuses, defaultCategoryForm } from '../../utils/categoryMapper'
import { maxCategoryDescriptionLength, validateCategoryForm } from '../../utils/categoryValidation'

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'
const textareaClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition placeholder:text-stone-400 focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function CategoryForm({ defaultValues = defaultCategoryForm, isSubmitting = false, submitLabel = 'Save Category', submittingLabel = 'Saving...', onCancel, onSubmit, serverErrors = {} }) {
  const [form, setForm] = useState({ ...defaultCategoryForm, ...defaultValues })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm({ ...defaultCategoryForm, ...defaultValues })
  }, [defaultValues])

  useEffect(() => {
    if (Object.keys(serverErrors).length > 0) {
      setErrors((current) => ({ ...current, ...serverErrors }))
    }
  }, [serverErrors])

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => {
      if (!current[name]) return current
      const nextErrors = { ...current }
      delete nextErrors[name]
      return nextErrors
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateCategoryForm(form)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-charcoal">Category information</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">Group related services so your catalog is easier to browse and manage.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="categoryName" label="Category Name *" error={errors.name}>
            <Input id="categoryName" value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="e.g. Hair Styling" hasError={Boolean(errors.name)} aria-describedby={errors.name ? 'categoryName-error' : undefined} />
          </FormField>

          <FormField id="categoryDisplayOrder" label="Display Order" error={errors.displayOrder}>
            <Input id="categoryDisplayOrder" type="number" step="1" value={form.displayOrder} onChange={(event) => updateField('displayOrder', event.target.value)} placeholder="0" hasError={Boolean(errors.displayOrder)} aria-describedby={errors.displayOrder ? 'categoryDisplayOrder-error' : undefined} />
          </FormField>

          <FormField id="categoryIcon" label="Icon">
            <select id="categoryIcon" value={form.icon} onChange={(event) => updateField('icon', event.target.value)} className={selectClassName}>
              {categoryIconOptions.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
            </select>
          </FormField>

          <FormField id="categoryStatus" label="Status" error={errors.status}>
            <select id="categoryStatus" value={form.status} onChange={(event) => updateField('status', event.target.value)} className={selectClassName} aria-describedby={errors.status ? 'categoryStatus-error' : undefined}>
              {categoryStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </FormField>

          <div className="sm:col-span-2">
            <FormField id="categoryDescription" label="Description" error={errors.description}>
              <textarea
                id="categoryDescription"
                rows="5"
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Describe what types of services belong in this category"
                className={`${textareaClassName} ${errors.description ? 'border-rose-muted' : ''}`}
                aria-describedby={errors.description ? 'categoryDescription-error' : 'categoryDescription-help'}
              />
              <p id="categoryDescription-help" className="text-xs font-medium text-stone-400">{form.description.length}/{maxCategoryDescriptionLength} characters</p>
            </FormField>
          </div>
        </div>
      </section>

      <div className="sticky bottom-5 z-10 rounded-[2rem] border border-beige bg-white/95 p-4 shadow-soft backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm leading-6 text-stone-500">Categories are saved to your current organization workspace.</p>
        <div className="mt-4 grid gap-3 sm:mt-0 sm:min-w-96 sm:grid-cols-2">
          <button type="button" onClick={onCancel} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-beige bg-white px-5 text-sm font-semibold text-charcoal transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">
            Cancel
          </button>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default CategoryForm
