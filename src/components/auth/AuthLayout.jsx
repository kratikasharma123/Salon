import { LockKeyhole, Scissors, Sparkles } from 'lucide-react'

function AuthLayout({ badge, heading, description, features, children, footerTitle, footerText }) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-ivory text-charcoal">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-cream px-10 py-10 lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-rose-muted/20 blur-3xl" />
          <div className="absolute bottom-12 right-8 h-80 w-80 rounded-full bg-terracotta/15 blur-3xl" />
          <div className="absolute right-16 top-24 h-32 w-32 rotate-12 rounded-[2.5rem] border border-brown/10 bg-white/25" />
          <div className="absolute bottom-36 left-20 h-24 w-24 rounded-full border border-rose-muted/25" />
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-beige to-transparent" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brown text-cream shadow-soft">
              <Scissors className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight text-charcoal">SalonPro</p>
              <p className="text-sm font-medium text-stone-500">Premium salon workspace</p>
            </div>
          </div>

          <div className="relative z-10 max-w-2xl space-y-8 py-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-muted/25 bg-white/55 px-4 py-2 text-sm font-semibold text-brown shadow-subtle backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-terracotta" />
              {badge}
            </div>

            <div className="space-y-5">
              <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-charcoal xl:text-6xl">
                {heading}
              </h1>
              <p className="max-w-xl text-lg leading-8 text-stone-600">{description}</p>
            </div>

            <div className="grid max-w-xl gap-4">
              {features.map(({ icon: Icon, title }) => (
                <div key={title} className="flex items-center gap-4 rounded-2xl border border-beige bg-white/60 p-4 shadow-subtle backdrop-blur-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-charcoal">{title}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 rounded-[1.75rem] border border-beige bg-white/55 p-5 shadow-subtle backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-brown/10 p-3 text-brown">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-charcoal">{footerTitle}</p>
                <p className="mt-1 text-sm leading-6 text-stone-600">{footerText}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brown text-cream shadow-soft">
                <Scissors className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-semibold tracking-tight text-charcoal">SalonPro</p>
                <p className="text-sm font-medium text-stone-500">Salon Management SaaS</p>
              </div>
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  )
}

export default AuthLayout
