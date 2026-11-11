"use client";

import { Pagination } from "@heroui/react";

type AgroPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

/** Controlled pagination. Pass the backend total and keep the page in URL or state. */
export function AgroPagination({ page, pageSize, total, onPageChange }: AgroPaginationProps) {
  const safeSize = Math.max(1, Math.floor(pageSize));
  const totalItems = Math.max(0, Math.floor(total));
  const totalPages = Math.max(1, Math.ceil(totalItems / safeSize));
  const current = Math.min(totalPages, Math.max(1, Math.floor(page)));
  const first = totalItems === 0 ? 0 : (current - 1) * safeSize + 1;
  const last = totalItems === 0 ? 0 : Math.min(current * safeSize, totalItems);
  const visible = Array.from(
    new Set([1, current - 1, current, current + 1, totalPages].filter((p) => p >= 1 && p <= totalPages)),
  ).sort((a, b) => a - b);

  return (
    <Pagination size="sm" className="flex flex-wrap items-center justify-between gap-3">
      <Pagination.Summary>
        Mostrando {first}–{last} de {totalItems} registros
      </Pagination.Summary>
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous isDisabled={current === 1} onPress={() => onPageChange(current - 1)}>
            <Pagination.PreviousIcon />
            <span className="sr-only sm:not-sr-only">Anterior</span>
          </Pagination.Previous>
        </Pagination.Item>
        {visible.map((p, index) => (
          <FragmentPage
            key={p}
            page={p}
            gap={index > 0 && p > visible[index - 1] + 1}
            current={current}
            onPress={() => onPageChange(p)}
          />
        ))}
        <Pagination.Item>
          <Pagination.Next isDisabled={current === totalPages} onPress={() => onPageChange(current + 1)}>
            <span className="sr-only sm:not-sr-only">Siguiente</span>
            <Pagination.NextIcon />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}

function FragmentPage({ page, gap, current, onPress }: {
  page: number;
  gap: boolean;
  current: number;
  onPress: () => void;
}) {
  return (
    <>
      {gap && (
        <Pagination.Item>
          <Pagination.Ellipsis />
        </Pagination.Item>
      )}
      <Pagination.Item>
        <Pagination.Link isActive={page === current} onPress={onPress}>
          {page}
        </Pagination.Link>
      </Pagination.Item>
    </>
  );
}
