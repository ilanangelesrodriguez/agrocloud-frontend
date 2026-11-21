"use client";

import Link from "next/link";
import clsx from "clsx";
import {
  FiBriefcase,
  FiCheckCircle,
  FiBarChart2,
  FiTruck,
  FiCpu,
  FiAlertCircle,
  FiBell,
  FiClipboard,
  FiCreditCard,
  FiGrid,
  FiLayers,
  FiPackage,
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
  profile: FiUser,
  roles: FiShield,
  subscription: FiLayers,
  notifications: FiBell,
  sampling: FiLayers,
  inspection: FiClipboard,
  quality: FiCheckCircle,
  reports: FiBarChart2,
  production: FiTruck,
  ai: FiCpu,
  incidents: FiAlertCircle,
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
        "group relative flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        active
          ? "bg-accent/10 text-accent ring-1 ring-inset ring-accent/15 after:absolute after:inset-y-2.5 after:left-0 after:w-0.5 after:rounded-full after:bg-accent"
          : "text-muted hover:bg-surface-secondary hover:text-foreground",
        collapsed && "justify-center px-2",
      )}
      href={item.href}
      title={item.label}
      onClick={onNavigate}
    >
      <Icon
        aria-hidden="true"
        className={clsx(
          "size-[18px] shrink-0",
          active ? "text-accent" : "text-muted/80 group-hover:text-foreground",
        )}
      />
      {!collapsed ? <span className="min-w-0 truncate">{item.label}</span> : null}
    </Link>
  );
}
