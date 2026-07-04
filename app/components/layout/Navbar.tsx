export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/60 border-b border-white/10">
      <div className="max-w-7xl mx-auto h-20 px-8 flex items-center justify-between">

        {/* Logo */}
        <div className="tracking-[8px] text-xl font-semibold">
          VANMOTION
        </div>

        {/* Menu */}
        <nav className="hidden md:flex gap-10 text-sm uppercase tracking-wider">

          <a href="#">Inicio</a>

          <a href="#">Colección</a>

          <a href="#">Historia</a>

          <a href="#">Contacto</a>

        </nav>

        {/* Right */}
        <div className="flex items-center gap-6 text-sm">

          <button>ES</button>

          <button>EN</button>

        </div>

      </div>
    </header>
  );
}