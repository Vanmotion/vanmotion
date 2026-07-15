import Link from "next/link";

import LogoutButton from "@/app/admin/LogoutButton";

import SidebarNav from "./SidebarNav";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.top}>
        <Link href="/admin" className={styles.brand}>
          <span className={styles.brandName}>
            VANMOTION
          </span>

          <span className={styles.brandSubtitle}>
            Administración
          </span>
        </Link>

        <div className={styles.status}>
          <span className={styles.statusLight} />

          <div>
            <strong>Sistema activo</strong>
            <small>Panel operativo</small>
          </div>
        </div>
      </div>

      <div className={styles.navigationArea}>
        <p className={styles.sectionLabel}>
          Gestión
        </p>

        <SidebarNav />
      </div>

      <div className={styles.bottom}>
        <div className={styles.publicArea}>
          <p className={styles.sectionLabel}>
            Página pública
          </p>

          <Link
            href="/"
            target="_blank"
            className={styles.publicLink}
          >
            <span className={styles.publicIcon}>
              ↗
            </span>

            <span>
              <strong>Ver página pública</strong>
              <small>Abrir VANMOTION</small>
            </span>
          </Link>
        </div>

        <div className={styles.profile}>
          <div className={styles.avatar}>
            VM
          </div>

          <div className={styles.profileText}>
            <strong>Administrador</strong>
            <small>Acceso protegido</small>
          </div>
        </div>

        <div className={styles.logout}>
          <LogoutButton />
        </div>

        <p className={styles.version}>
          VANMOTION · BUILD 2026
        </p>
      </div>
    </aside>
  );
}