import Link from "next/link";

export default function GlobalVanmotionLogo() {
  return (
    <div className="pointer-events-none fixed bottom-24 left-5 z-[9999] sm:bottom-28 sm:left-7">
      <Link
        href="/"
        aria-label="VANMOTION — Ir al inicio"
        className="pointer-events-auto block w-[82px] opacity-85 drop-shadow-[0_8px_18px_rgba(0,0,0,0.65)] transition duration-300 hover:scale-[1.03] hover:opacity-100 sm:w-[104px]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/vanmotion-mark.webp"
          alt="VANMOTION"
          className="block h-auto w-full object-contain"
        />
      </Link>
    </div>
  );
}