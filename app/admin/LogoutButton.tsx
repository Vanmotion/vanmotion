"use client";

import { useFormStatus } from "react-dom";
import { logoutAdmin } from "@/actions/authActions";

export default function LogoutButton() {
  return (
    <form action={logoutAdmin}>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl border border-red-500/40 px-4 py-3 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Cerrando sesión..." : "Cerrar sesión"}
    </button>
  );
}