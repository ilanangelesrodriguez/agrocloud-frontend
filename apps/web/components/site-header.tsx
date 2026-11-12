"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { siteConfig, portalLoginUrl } from "@/config/site";
import { SiteBrand } from "@/components/site-brand";
import { ThemeSwitch } from "@/components/theme-switch";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/75 bg-background/90 backdrop-blur-xl">
      <div className="site-container flex h-[72px] items-center justify-between gap-5">
        <SiteBrand />
        <nav aria-label="Navegación principal" className="hidden items-center gap-1 lg:flex">
          {siteConfig.nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={`site-nav-link ${pathname === href ? "site-nav-active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <ThemeSwitch className="!size-10 border border-border" />
          {portalLoginUrl && (
            <a href={portalLoginUrl} className="site-nav-link">
              Ingresar
            </a>
          )}
          <Link
            href="/solicitar-acceso"
            className="site-button site-button-primary !px-4 !py-2.5 text-sm"
          >
            Solicitar acceso
          </Link>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeSwitch className="!size-10 border border-border" />
          <button
            type="button"
            aria-controls="mobile-navigation"
            aria-expanded={open}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="grid size-10 place-items-center rounded-xl border border-border text-foreground focus-visible:outline-2 focus-visible:outline-focus"
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <span aria-hidden="true" className="text-xl">
                ×
              </span>
            ) : (
              <span aria-hidden="true" className="text-xl">
                ☰
              </span>
            )}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Navegación móvil"
          className="border-t border-border bg-background px-5 py-4 shadow-lg lg:hidden"
        >
          <div className="mx-auto flex max-w-lg flex-col gap-1">
            {siteConfig.nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={pathname === href ? "page" : undefined}
                className={`site-nav-link px-4 py-3 ${pathname === href ? "site-nav-active" : ""}`}
              >
                {label}
              </Link>
            ))}
            {portalLoginUrl && (
              <a href={portalLoginUrl} className="site-nav-link px-4 py-3">
                Ingresar al portal
              </a>
            )}
            <Link
              href="/solicitar-acceso"
              onClick={() => setOpen(false)}
              className="site-button site-button-primary mt-3 text-center"
            >
              Solicitar acceso
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
