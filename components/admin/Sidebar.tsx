import Link from "next/link";

const links = [
  {
    name: "Dashboard",
    href: "/admin",
  },
  {
    name: "Vehículos",
    href: "/admin/vehicles",
  },
  {
    name: "Marcas",
    href: "/admin/brands",
  },
  {
    name: "Contactos",
    href: "/admin/contacts",
  },
  {
    name: "Configuración",
    href: "/admin/settings",
  },
];

export default function Sidebar() {
  return (
    <aside className="w-72 border-r border-white/10 bg-black">
      <div className="px-8 py-10">

        <h1 className="text-2xl tracking-[0.35em] font-light">
          VANMOTION
        </h1>

        <div className="mt-16 flex flex-col gap-2">

          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              {item.name}
            </Link>
          ))}

        </div>
      </div>
    </aside>
  );
}