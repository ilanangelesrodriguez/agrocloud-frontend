"use client";

import { useState } from "react";
import Image from "next/image";
import { Button, Sheet, ScrollShadow } from "@heroui/react";
import { FiMenu } from "react-icons/fi";

import type { CompanyBrand } from "@/features/company/profile/use-company-brand";
import type { NavigationSection } from "@/config/navigation";

import { OrganizationBadge } from "./organization-badge";
import { NavigationList } from "./navigation-list";

export function MobileNavigation({
  sections,
  brand,
  pathname,
}: {
  sections: NavigationSection[];
  brand: CompanyBrand;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet isOpen={open} onOpenChange={setOpen} placement="left">
        <Sheet.Trigger>
          <Button
            aria-label="Abrir menú de navegación"
            className="shrink-0"
            isIconOnly
            size="sm"
            variant="tertiary"
          >
            <FiMenu aria-hidden="true" className="size-5" />
          </Button>
        </Sheet.Trigger>
        <Sheet.Backdrop>
          <Sheet.Content className="w-[min(19rem,92vw)] max-w-none">
            <Sheet.Dialog className="h-full border-r border-border bg-surface">
              <Sheet.CloseTrigger aria-label="Cerrar menú de navegación" />
              <Sheet.Header>
                <Sheet.Heading className="flex items-center gap-3">
                  <Image alt="" height={30} src="/agrocloud/logo-mark.svg" width={30} />
                  AgroCloud AI
                </Sheet.Heading>
              </Sheet.Header>
              <div className="shrink-0 px-3 pb-4">
                <OrganizationBadge brand={brand} />
              </div>
              <Sheet.Body className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
                <ScrollShadow
                  size={24}
                  className="min-h-0 flex-1 overscroll-contain px-3 pb-6"
                  aria-label="Módulos disponibles"
                >
                  <NavigationList
                    onNavigate={() => setOpen(false)}
                    pathname={pathname}
                    sections={sections}
                  />
                </ScrollShadow>
              </Sheet.Body>
            </Sheet.Dialog>
          </Sheet.Content>
        </Sheet.Backdrop>
      </Sheet>
    </div>
  );
}
