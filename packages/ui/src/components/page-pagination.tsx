"use client";

import { Pagination } from "@heroui/react";

type PagePaginationProps = {
  page: number;
  last: number;
  onChange: (page: number) => void;
  label?: string;
};

/**
 * Paginación para respuestas que incluyen `last_page` pero no `total`.
 * No estima un total de registros inexistente en la API.
 */
export function PagePagination({
  page,
  last,
  onChange,
  label = "Paginación",
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

  return (
    <div aria-label={label} role="navigation">
      <Pagination className="flex flex-wrap items-center justify-between gap-3" size="sm">
        <Pagination.Summary>
          Página {current} de {pageCount}
        </Pagination.Summary>
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.Previous
              isDisabled={current === 1}
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
              gap={index > 0 && value > visible[index - 1] + 1}
              onPress={() => onChange(value)}
              page={value}
            />
          ))}
          <Pagination.Item>
            <Pagination.Next
              isDisabled={current === pageCount}
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
  gap,
  onPress,
}: {
  page: number;
  current: number;
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
        <Pagination.Link isActive={page === current} onPress={onPress}>
          {page}
        </Pagination.Link>
      </Pagination.Item>
    </>
  );
}
