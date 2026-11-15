import { spawnSync } from "node:child_process";

// En producción, aplicar migraciones ANTES de compilar/publicar la versión nueva.
// En local y preview no se modifica ninguna base de datos.
if (process.env.VERCEL_ENV !== "production") {
  console.log("Prisma deploy: omitido en local/preview");
} else {
  if (!process.env.DATABASE_URL || !/^postgres(ql)?:\/\//.test(process.env.DATABASE_URL)) {
    console.error("PUBLICACION BLOQUEADA: DATABASE_URL de producción no disponible.");
    process.exit(1);
  }
  const command = "./node_modules/.bin/prisma";
  const result = spawnSync(command, ["migrate", "deploy"], { stdio: "inherit" });
  if (result.error || result.status !== 0) {
    console.error("PUBLICACION BLOQUEADA: no se aplicaron las migraciones.");
    process.exit(1);
  }
}
