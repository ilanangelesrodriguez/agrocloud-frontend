"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@heroui/react";
import { AnimatePresence, motion } from "motion/react";
import { FiArrowUpRight, FiLogIn, FiMenu, FiX } from "react-icons/fi";

import { SiteBrand } from "@/components/site-brand";
import { ThemeSwitch } from "@/components/theme-switch";
import { portalLoginUrl, siteConfig } from "@/config/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // El header gana sombra y se compacta al hacer scroll.
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 8);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cierra el menú móvil al cambiar de página.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Cierra con Escape.
  useEffect(() => {
    if (!isMenuOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        isScrolled || isMenuOpen
          ? "border-border/75 bg-background/90 shadow-sm shadow-brand-700/5 backdrop-blur-xl"
          : "border-transparent bg-background/60 backdrop-blur-md"
      }`}
    >
      {/* Línea de marca en verde */}
      <div
        aria-hidden="true"
        className="h-0.5 w-full bg-gradient-to-r from-brand-700 via-[#B7F5A2] to-brand-600"
      />

      <div
        className={`site-container flex items-center justify-between gap-5 transition-all duration-300 ${
          isScrolled ? "h-16" : "h-[72px]"
        }`}
      >
        <SiteBrand />

        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-1 rounded-full border border-border/70 bg-surface/70 p-1 lg:flex"
        >
          {siteConfig.nav.map(({ href, label }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                aria-current={isActive ? "page" : undefined}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  isActive
                    ? "text-brand-700 dark:text-brand-400"
                    : "text-muted hover:bg-brand-50/70 hover:text-foreground dark:hover:bg-brand-700/10"
                }`}
                href={href}
              >
                {isActive ? (
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-brand-50 ring-1 ring-brand-600/25 dark:bg-brand-700/25"
                    layoutId="nav-active-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : null}
                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <ThemeSwitch className="!size-10 border border-border" />
          {portalLoginUrl ? (
            <a
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-brand-50/70 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:hover:bg-brand-700/10"
              href={portalLoginUrl}
            >
              <FiLogIn aria-hidden="true" className="size-4" />
              Ingresar
            </a>
          ) : null}
          <Link
            className="site-button site-button-primary !px-4 !py-2.5 text-sm shadow-md shadow-brand-700/20"
            href="/solicitar-acceso"
          >
            Solicitar acceso
            <FiArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeSwitch className="!size-10 border border-border" />
          <Button
            isIconOnly
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            className="size-10 rounded-xl"
            size="md"
            variant="outline"
            onPress={() => setIsMenuOpen((previous) => !previous)}
          >
            {isMenuOpen ? (
              <FiX aria-hidden="true" className="size-5" />
            ) : (
              <FiMenu aria-hidden="true" className="size-5" />
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.nav
            id="mobile-navigation"
            animate={{ opacity: 1, y: 0 }}
            aria-label="Navegación móvil"
            className="border-t border-border bg-background px-5 py-4 shadow-xl shadow-brand-700/10 lg:hidden"
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="mx-auto flex max-w-lg flex-col gap-1">
              {siteConfig.nav.map(({ href, label }) => {
                const isActive = pathname === href;

                return (
                  <Link
                    key={href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-brand-50 text-brand-700 ring-1 ring-brand-600/25 dark:bg-brand-700/25 dark:text-brand-400"
                        : "text-foreground hover:bg-brand-50/70 dark:hover:bg-brand-700/10"
                    }`}
                    href={href}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                    {isActive ? (
                      <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
                    ) : null}
                  </Link>
                );
              })}
              {portalLoginUrl ? (
                <a
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-brand-50/70 dark:hover:bg-brand-700/10"
                  href={portalLoginUrl}
                >
                  <FiLogIn aria-hidden="true" className="size-4" />
                  Ingresar al portal
                </a>
              ) : null}
              <Link
                className="site-button site-button-primary mt-3 text-center"
                href="/solicitar-acceso"
                onClick={() => setIsMenuOpen(false)}
              >
                Solicitar acceso
                <FiArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
