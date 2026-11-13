import Link from "next/link";

/** Links to both galleries, without modifying the existing component gallery. */
export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav
        aria-label="Biblioteca de diseño"
        className="mx-auto mt-5 flex max-w-6xl flex-wrap gap-2 px-1"
      >
        <Link
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:text-accent focus-visible:outline-2 focus-visible:outline-focus"
          href="/design-system"
        >
          Fundamentos
        </Link>
        <Link
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:text-accent focus-visible:outline-2 focus-visible:outline-focus"
          href="/design-system/advanced"
        >
          Componentes avanzados
        </Link>
      </nav>
      {children}
    </>
  );
}
