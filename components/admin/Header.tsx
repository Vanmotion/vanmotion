export default function Header() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-white/10 px-10">

      <div>
        <h2 className="text-xl font-light tracking-widest">
          Panel de Administración
        </h2>

        <p className="mt-1 text-sm text-white/40">
          VANMOTION
        </p>
      </div>

      <div className="text-sm text-white/50">
        Bienvenido
      </div>

    </header>
  );
}