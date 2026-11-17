"use client";

import { ErrorState, PageHeader, PagePagination } from "@agrocloud/ui";

/**
 * Adaptadores temporales. Se conservan los nombres antiguos para que los módulos
 * existentes puedan adoptar @agrocloud/ui sin romper imports en la Fase 2.
 * Los imports se migrarán por dominio durante las Fases 4 y 5.
 */
export function AdminPagination({
  page,
  last,
  onChange,
}: {
  page: number;
  last: number;
  onChange: (page: number) => void;
}) {
  return <PagePagination last={last} onChange={onChange} page={page} />;
}

export function AdminHeading({ title }: { title: string }) {
  return (
    <div className="space-y-2">
      <PageHeader title={title} />
    </div>
  );
}

export function AdminError({ error, retry }: { error: Error; retry: () => void }) {
  return <ErrorState error={error} retry={retry} />;
}
