export function SplashScreen({ saindo = false }: { saindo?: boolean }) {
  return (
    <div
      role="status"
      aria-label="Carregando sua conta"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-primary transition-opacity duration-[250ms] ease-out ${
        saindo ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <img src="/favicon.svg" alt="" aria-hidden="true" className="h-16 w-16" />
        <span className="font-display text-xl font-semibold tracking-tight text-primary-foreground">
          Conta Fácil
        </span>
      </div>
      <div className="h-1 w-32 overflow-hidden rounded-full bg-primary-foreground/25" aria-hidden="true">
        <div className="h-full w-2/5 animate-indeterminate rounded-full bg-primary-foreground" />
      </div>
    </div>
  )
}
