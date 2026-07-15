export default function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-24 items-center justify-between border-b border-white/10 bg-[#050505]/90 px-10 backdrop-blur-xl">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/30">
          VANMOTION
        </p>

        <h2 className="mt-2 text-xl font-medium tracking-wide text-white">
          Panel de administración
        </h2>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-green-400" />

          <span className="text-xs font-medium text-green-400">
            Sistema activo
          </span>
        </div>

        <div className="h-9 w-px bg-white/10" />

        <div className="text-right">
          <p className="text-sm font-medium text-white">
            Administrador
          </p>

          <p className="mt-1 text-xs text-white/40">
            Acceso protegido
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white">
          VM
        </div>
      </div>
    </header>
  );
}