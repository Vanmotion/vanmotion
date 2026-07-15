"use client";

import type { FormEvent } from "react";
import { useFormStatus } from "react-dom";
import { deleteContactRequest } from "@/actions/contactActions";

interface DeleteContactButtonProps {
  contactId: string;
  contactName: string;
}

export default function DeleteContactButton({
  contactId,
  contactName,
}: DeleteContactButtonProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar la solicitud de "${contactName}"?\n\nEsta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <form
      action={deleteContactRequest}
      onSubmit={handleSubmit}
    >
      <input
        type="hidden"
        name="contactId"
        value={contactId}
      />

      <DeleteButton />
    </form>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl border border-red-500/50 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Eliminando..." : "Eliminar"}
    </button>
  );
}