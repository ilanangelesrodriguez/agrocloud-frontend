import Image from "next/image";
import Link from "next/link";

export function SiteBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      aria-label="AgroCloud AI · Inicio"
      className="inline-flex shrink-0 items-center gap-2 focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
      href="/"
    >
      <Image
        priority
        alt=""
        aria-hidden="true"
        className="size-9 rounded-xl"
        height={38}
        src="/agrocloud/logo-mark.svg"
        width={38}
      />
      <span
        className={`font-sans text-lg font-bold tracking-tight text-foreground ${compact ? "sm:hidden" : ""}`}
      >
        Agro<span className="text-accent">Cloud</span>
        <span className="ml-1 align-top text-[10px] font-semibold text-muted">AI</span>
      </span>
    </Link>
  );
}
