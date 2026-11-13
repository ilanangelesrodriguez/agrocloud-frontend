"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import clsx from "clsx";

import { MoonFilledIcon, SunFilledIcon } from "@/components/icons";

const subscribe = () => () => {};

export function ThemeSwitch({ className }: { className?: string }) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const { resolvedTheme, setTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  if (!mounted) return <span aria-hidden className="inline-block h-6 w-6" />;

  return (
    <button
      aria-label={isLight ? "Cambiar a tema oscuro" : "Cambiar a tema claro"}
      className={clsx(
        "inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg",
        "bg-transparent text-muted transition-opacity hover:opacity-80",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        className,
      )}
      type="button"
      onClick={() => setTheme(isLight ? "dark" : "light")}
    >
      {isLight ? <SunFilledIcon size={22} /> : <MoonFilledIcon size={22} />}
    </button>
  );
}
