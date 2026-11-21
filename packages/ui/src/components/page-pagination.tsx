"use client";

import type { ReactNode } from "react";
import { Pagination } from "@heroui/react";

type PagePaginationProps = {
  page: number;
  last: number;
  onChange: (page: number) => void;
  label?: string;
  summary?: ReactNode;
  alwaysVisible?: boolean;
  isDisabled?: boolean;
};

export function PagePagination({
  page,
  last,
  onChange,
  label = "Paginación",
  summary,
  alwaysVisible = false,
  isDisabled = false,
}: PagePaginationProps) {
  const pageCount = Math.max(1, Math.floor(Number.isFinite(last) ? last : 1));
  const current = Math.min(pageCount, Math.max(1, Math.floor(Number.isFinite(page) ? page : 1)));
  const visible = Array.from(
    new Set(
      [1, current - 1, current, current + 1, pageCount].filter(
        (value) => value >= 1 && value <= pageCount,
      ),
    ),
  ).sort((a, b) => a - b);

  if (pageCount <= 1 && !alwaysVisible) return null;

  return (
    <div className="pagination-footer mt-auto shrink-0 rounded-xl border border-border bg-surface px-4 py-4 shadow-sm">
      <Pagination
        aria-label={label}
        className="flex flex-wrap items-center justify-between gap-3"
        size="sm"
      >
        <Pagination.Summary>
          {summary ?? (
            <>
              Página <strong>{current}</strong> de {pageCount}
            </>
          )}
        </Pagination.Summary>
        <Pagination.Content className="flex-wrap justify-center gap-1">
          <Pagination.Item>
            <Pagination.Previous
              isDisabled={isDisabled || current === 1}
              onPress={() => onChange(current - 1)}
            >
              <Pagination.PreviousIcon />
              <span className="sr-only sm:not-sr-only">Anterior</span>
            </Pagination.Previous>
          </Pagination.Item>
          {visible.map((value, index) => (
            <PaginationPage
              key={value}
              current={current}
              isDisabled={isDisabled}
              gap={index > 0 && value > visible[index - 1] + 1}
              onPress={() => onChange(value)}
              page={value}
            />
          ))}
          <Pagination.Item>
            <Pagination.Next
              isDisabled={isDisabled || current === pageCount}
              onPress={() => onChange(current + 1)}
            >
              <span className="sr-only sm:not-sr-only">Siguiente</span>
              <Pagination.NextIcon />
            </Pagination.Next>
          </Pagination.Item>
        </Pagination.Content>
      </Pagination>
    </div>
  );
}

function PaginationPage({
  page,
  current,
  isDisabled,
  gap,
  onPress,
}: {
  page: number;
  current: number;
  isDisabled: boolean;
  gap: boolean;
  onPress: () => void;
}) {
  return (
    <>
      {gap ? (
        <Pagination.Item>
          <Pagination.Ellipsis />
        </Pagination.Item>
      ) : null}
      <Pagination.Item>
        <Pagination.Link
          aria-label={`Ir a la página ${page}`}
          isActive={page === current}
          isDisabled={isDisabled}
          onPress={onPress}
        >
          {page}
        </Pagination.Link>
      </Pagination.Item>
    </>
  );
}
