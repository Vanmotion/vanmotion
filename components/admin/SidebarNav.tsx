"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./Sidebar.module.css";

type NavigationItem = {
  label: string;
  description: string;
  href: string;
  icon: ReactNode;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    description: "Resumen general",
    href: "/admin",
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
        />

        <rect
          x="14"
          y="3"
          width="7"
          height="7"
        />

        <rect
          x="3"
          y="14"
          width="7"
          height="7"
        />

        <rect
          x="14"
          y="14"
          width="7"
          height="7"
        />
      </svg>
    ),
  },
  {
    label: "Vehículos",
    description: "Inventario y fotografías",
    href: "/admin/vehicles",
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M5 16h14l-1.5-6h-11L5 16Z" />
        <path d="M3 16h18v3H3z" />
        <circle cx="7" cy="19" r="2" />
        <circle cx="17" cy="19" r="2" />
      </svg>
    ),
  },
  {
    label: "Marcas",
    description: "Fabricantes registrados",
    href: "/admin/brands",
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M4 4h16v16H4z" />
        <path d="M8 8h8v8H8z" />
      </svg>
    ),
  },
  {
    label: "Contactos",
    description: "Solicitudes recibidas",
    href: "/admin/contactos",
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M4 5h16v11H8l-4 4V5Z" />
        <path d="M8 9h8M8 12h5" />
      </svg>
    ),
  },
  {
    label: "Música",
    description: "Temas y reproductor",
    href: "/admin/music",
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M9 18V6l10-2v12" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="16" cy="16" r="3" />
      </svg>
    ),
  },
  {
    label: "Ropa",
    description: "Productos, precios y stock",
    href: "/admin/ropa",
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M8 4 4 6l-2 5 4 2v7h12v-7l4-2-2-5-4-2c-.8 1.3-2.1 2-4 2S8.8 5.3 8 4Z" />
        <path d="M9 4c.5 1.2 1.5 2 3 2s2.5-.8 3-2" />
      </svg>
    ),
  },
  {
    label: "Pedidos",
    description: "Compras y envíos",
    href: "/admin/pedidos",
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M5 4h14v16H5z" />
        <path d="M8 8h8" />
        <path d="M8 12h8" />
        <path d="M8 16h5" />
      </svg>
    ),
  },
  {
    label: "Configuración",
    description: "Datos y redes sociales",
    href: "/admin/settings",
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="3" />

        <path d="M12 3v3" />
        <path d="M12 18v3" />
        <path d="M3 12h3" />
        <path d="M18 12h3" />

        <path d="m5.6 5.6 2.1 2.1" />
        <path d="m16.3 16.3 2.1 2.1" />
        <path d="m18.4 5.6-2.1 2.1" />
        <path d="m7.7 16.3-2.1 2.1" />
      </svg>
    ),
  },
];

function isActiveRoute(
  pathname: string,
  href: string,
): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav
      className={styles.navigation}
      aria-label="Navegación del administrador"
    >
      {navigationItems.map(
        (item, index) => {
          const active = isActiveRoute(
            pathname,
            item.href,
          );

          return (
            <Link
              href={item.href}
              key={item.href}
              className={`${styles.navItem} ${
                active ? styles.active : ""
              }`}
              aria-current={
                active
                  ? "page"
                  : undefined
              }
            >
              <span
                className={
                  styles.navNumber
                }
              >
                {String(index + 1).padStart(
                  2,
                  "0",
                )}
              </span>

              <span
                className={
                  styles.navIcon
                }
              >
                {item.icon}
              </span>

              <span
                className={
                  styles.navText
                }
              >
                <strong>
                  {item.label}
                </strong>

                <small>
                  {item.description}
                </small>
              </span>

              <span
                className={
                  styles.navArrow
                }
              >
                →
              </span>
            </Link>
          );
        },
      )}
    </nav>
  );
}