import { Loader2, Scissors } from 'lucide-react'

function AuthLoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-6 text-charcoal">
      <div className="rounded-[2rem] border border-beige bg-white p-8 text-center shadow-soft">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brown text-cream shadow-soft">
          <Scissors className="h-6 w-6" />
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-brown">
          <Loader2 className="h-4 w-4 animate-spin" />
          Restoring secure SalonPro session...
        </div>
      </div>
    </main>
  )
}

export default AuthLoadingScreen
