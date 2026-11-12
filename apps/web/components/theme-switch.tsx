"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@heroui/react";
import { useTheme } from "next-themes";
import clsx from "clsx";
import { FiMoon, FiSun } from "react-icons/fi";

const subscribe = () => () => {};

export function ThemeSwitch({ className }: { className?: string }) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const { resolvedTheme, setTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  if (!mounted) {
    return <span aria-hidden="true" className="inline-block size-10" />;
  }

  return (
    <Button
      type="button"
      variant="tertiary"
      isIconOnly
      aria-label={isLight ? "Cambiar a tema oscuro" : "Cambiar a tema claro"}
      className={clsx("size-10 rounded-xl text-muted", className)}
      onPress={() => setTheme(isLight ? "dark" : "light")}
    >
      {isLight ? (
        <FiSun aria-hidden="true" className="size-5" />
      ) : (
        <FiMoon aria-hidden="true" className="size-5" />
      )}
    </Button>
  );
}
