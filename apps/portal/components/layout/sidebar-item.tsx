"use client";

import Link from "next/link";
import clsx from "clsx";
import {
  FiBriefcase,
  FiClipboard,
  FiCreditCard,
  FiGrid,
  FiLayers,
  FiPackage,
  FiSettings,
  FiShield,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import { isActiveRoute } from "@/config/navigation";
import type { NavigationIcon, NavigationItem } from "@/config/navigation";

const iconMap = {
  dashboard: FiGrid,
  producers: FiUsers,
  lots: FiPackage,
  requests: FiClipboard,
  companies: FiBriefcase,
  users: FiUser,
  plans: FiCreditCard,
  profile: FiSettings,
  roles: FiShield,
  subscription: FiLayers,
} satisfies Record<NavigationIcon, typeof FiGrid>;

export function SidebarItem({
  item,
  pathname,
  collapsed = false,
  onNavigate,
}: {
  item: NavigationItem;
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = iconMap[item.icon];
  const active = isActiveRoute(pathname, item.href);

  return (
    <Link
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={clsx(
        "group flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        active
          ? "bg-surface-secondary text-accent"
          : "text-muted hover:bg-surface-secondary hover:text-foreground",
        collapsed && "justify-center px-2",
      )}
      href={item.href}
      title={collapsed ? item.label : undefined}
      onClick={onNavigate}
    >
      <Icon aria-hidden="true" className="size-5 shrink-0" />
      {!collapsed ? <span className="min-w-0 truncate">{item.label}</span> : null}
    </Link>
  );
}
