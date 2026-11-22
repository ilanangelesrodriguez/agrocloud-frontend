"use client";

import { Avatar, Tooltip } from "@heroui/react";
import { FiShield } from "react-icons/fi";
import type { CompanyBrand } from "@/features/company/profile/use-company-brand";

export function OrganizationBadge({
  brand,
  collapsed = false,
}: {
  brand: CompanyBrand;
  collapsed?: boolean;
}) {
  const initials = brand.available
    ? brand.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : "ORG";
  const content = (
    <div
      className={
        "flex min-w-0 items-center gap-3 rounded-xl border border-border bg-surface-secondary/60 p-3 " +
        (collapsed ? "justify-center p-2" : "")
      }
    >
      <Avatar className="size-10 shrink-0 rounded-xl bg-accent/10 text-xs text-accent">
        {brand.logoUrl ? (
          <Avatar.Image
            src={brand.logoUrl}
            alt={"Logo de " + brand.name}
            className="object-contain"
          />
        ) : null}
        <Avatar.Fallback>
          {brand.platform ? <FiShield aria-hidden="true" className="size-5" /> : initials}
        </Avatar.Fallback>
      </Avatar>
      {!collapsed ? (
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
            {brand.platform ? "Plataforma" : "Mi organización"}
          </p>
          <p className="mt-1 truncate text-xs font-semibold" title={brand.name}>
            {brand.name}
          </p>
        </div>
      ) : null}
    </div>
  );
  return collapsed ? (
    <Tooltip>
      <Tooltip.Trigger>
        <button
          aria-label={brand.name}
          className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          type="button"
        >
          {content}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Content>{brand.name}</Tooltip.Content>
    </Tooltip>
  ) : (
    content
  );
}
