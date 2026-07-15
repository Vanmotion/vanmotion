import Link from "next/link";
import { loginAdmin } from "@/actions/authActions";

interface LoginAdminPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function LoginAdminPage({
  searchParams,
}: LoginAdminPageProps) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 py-12 text-white">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link
            href="/"
            className="text-2xl font-bold tracking-[0.35em] text-white"
          >
            VANMOTION
          </Link>

          <p className="mt-4 text-sm uppercase tracking-[0.25em] text-white/40">
            Panel de administración
          </p>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 md:p-9">
          <h1 className="text-3xl font-bold">
            Acceso privado
          </h1>

          <p className="mt-3 leading-6 text-white/50">
            Introduce la contraseña del administrador para acceder.
          </p>

          {error === "1" && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-sm font-semibold text-red-300">
                La contraseña no es correcta.
              </p>
            </div>
          )}

          <form
            action={loginAdmin}
            className="mt-7"
          >
            <label
              htmlFor="password"
              className="mb-2 block text-sm text-white/60"
            >
              Contraseña
            </label>

            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              autoFocus
              placeholder="Introduce tu contraseña"
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-white outline-none transition focus:border-white/40"
            />

            <button
              type="submit"
              className="mt-5 w-full rounded-xl bg-white px-6 py-4 font-bold transition hover:opacity-80"
              style={{ color: "#000000" }}
            >
              Entrar al panel
            </button>
          </form>
        </section>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-white/45 transition hover:text-white"
          >
            ← Volver a la web
          </Link>
        </div>
      </div>
    </main>
  );
}