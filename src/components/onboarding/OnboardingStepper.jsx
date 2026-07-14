import { Building2, Check, Clock3, MapPin, SlidersHorizontal } from 'lucide-react'

const steps = [
  { title: 'Business Details', icon: Building2 },
  { title: 'Location & Contact', icon: MapPin },
  { title: 'Business Preferences', icon: SlidersHorizontal },
  { title: 'Business Hours', icon: Clock3 },
]

function OnboardingStepper({ currentStep, maxCompletedStep, onStepSelect }) {
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="rounded-[2rem] border border-beige bg-white p-4 shadow-subtle sm:p-5">
      <div className="sm:hidden">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-semibold text-brown">Step {currentStep + 1} of {steps.length}</span>
          <span className="text-stone-500">{steps[currentStep].title}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-beige">
          <div className="h-full rounded-full bg-terracotta transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <ol className="hidden grid-cols-4 gap-3 sm:grid" aria-label="Onboarding progress">
        {steps.map(({ title, icon: Icon }, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isClickable = index <= maxCompletedStep

          return (
            <li key={title}>
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => onStepSelect(index)}
                aria-current={isCurrent ? 'step' : undefined}
                className={`group flex min-h-24 w-full flex-col items-start justify-between rounded-2xl border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta disabled:cursor-not-allowed ${
                  isCurrent
                    ? 'border-terracotta bg-terracotta/10 text-brown shadow-subtle'
                    : isCompleted
                      ? 'border-brown/20 bg-cream text-brown hover:border-terracotta/50'
                      : 'border-beige bg-ivory text-stone-500'
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    isCurrent || isCompleted ? 'bg-terracotta text-white' : 'bg-white text-stone-400'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </span>
                <span className="mt-3 text-sm font-semibold leading-5">{title}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default OnboardingStepper
