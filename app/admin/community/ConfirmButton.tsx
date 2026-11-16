"use client";

type Props = {
  label: string;
  question: string;
  danger?: boolean;
};

export default function ConfirmButton({ label, question, danger = false }: Props) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(question)) event.preventDefault();
      }}
      className={danger
        ? "rounded-md border border-red-400/35 bg-red-400/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-400/20"
        : "rounded-md border border-white/25 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"}
    >
      {label}
    </button>
  );
}
