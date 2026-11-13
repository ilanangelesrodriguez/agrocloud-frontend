"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/access-requests", label: "Solicitudes" },
  { href: "/admin/companies", label: "Empresas" },
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Administración global" className="flex flex-wrap content-start gap-2 md:flex-col">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          aria-current={pathname === href || (href !== "/admin" && pathname.startsWith(href + "/")) ? "page" : undefined}
          className="rounded-lg px-3 py-2 text-sm aria-[current=page]:bg-accent-soft aria-[current=page]:font-semibold"
          href={href}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
