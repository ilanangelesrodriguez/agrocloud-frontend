"use client";

import { PagePagination } from "./page-pagination";

type AgroPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function AgroPagination({ page, pageSize, total, onPageChange }: AgroPaginationProps) {
  const safeSize = Math.max(1, Math.floor(Number.isFinite(pageSize) ? pageSize : 1));
  const totalItems = Math.max(0, Math.floor(Number.isFinite(total) ? total : 0));
  const totalPages = Math.max(1, Math.ceil(totalItems / safeSize));
  const current = Math.min(totalPages, Math.max(1, Math.floor(Number.isFinite(page) ? page : 1)));
  const first = totalItems === 0 ? 0 : (current - 1) * safeSize + 1;
  const last = Math.min(current * safeSize, totalItems);
  return (
    <PagePagination
      alwaysVisible
      page={current}
      last={totalPages}
      onChange={onPageChange}
      summary={
        <>
          Mostrando{" "}
          <strong>
            {first}–{last}
          </strong>{" "}
          de {totalItems} registros
        </>
      }
    />
  );
}
