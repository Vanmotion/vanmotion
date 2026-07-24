import LogoutButton from "@/app/admin/LogoutButton";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-4 border-b border-white/10 bg-[#050505]/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:h-24 lg:px-10 lg:py-0">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.28em] text-white/30 sm:text-xs sm:tracking-[0.3em]">
          VANMOTION
        </p>

        <h2 className="mt-2 truncate text-base font-medium tracking-wide text-white sm:text-lg lg:text-xl">
          Panel de administración
        </h2>
      </div>

      <div className="flex flex-none items-center gap-3 sm:gap-4 lg:gap-5">
        <div className="hidden items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 md:flex">
          <span className="h-2 w-2 rounded-full bg-green-400" />

          <span className="text-xs font-medium text-green-400">
            Sistema activo
          </span>
        </div>

        <div className="hidden h-9 w-px bg-white/10 md:block" />

        <div className="hidden text-right lg:block">
          <p className="text-sm font-medium text-white">
            Administrador
          </p>

          <p className="mt-1 text-xs text-white/40">
            Acceso protegido
          </p>
        </div>

        <details className="group relative">
          <summary
            aria-label="Abrir menú del administrador"
            className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10 group-open:bg-white group-open:text-black [&::-webkit-details-marker]:hidden"
          >
            VM
          </summary>

          <div className="absolute right-0 top-14 z-50 w-[min(16rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[#0b0b0b] p-4 shadow-2xl shadow-black/60">
            <div className="mb-4 border-b border-white/10 pb-4">
              <p className="text-sm font-semibold text-white">
                Administrador
              </p>

              <p className="mt-1 text-xs text-white/40">
                Sesión privada de VANMOTION
              </p>
            </div>

            <LogoutButton />
          </div>
        </details>
      </div>
    </header>
  );
}
