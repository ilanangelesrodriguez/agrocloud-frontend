"use client";

import { Button } from "@heroui/react";
import Link from "next/link";

export function AdminPagination({ page, last, onChange }: { page: number; last: number; onChange: (page: number) => void }) {
  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center gap-3">
      <Button isDisabled={page <= 1} variant="secondary" onPress={() => onChange(page - 1)}>Anterior</Button>
      <span>Página {page} de {last}</span>
      <Button isDisabled={page >= last} variant="secondary" onPress={() => onChange(page + 1)}>Siguiente</Button>
    </nav>
  );
}

export function AdminHeading({ title }: { title: string }) {
  return (
    <header className="space-y-2">
      <Link className="text-accent underline" href="/admin">Panel de plataforma</Link>
      <h1 className="text-3xl font-semibold">{title}</h1>
    </header>
  );
}

export function AdminError({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="space-y-3">
      <p role="alert">{error.message}</p>
      <Button variant="secondary" onPress={retry}>Reintentar</Button>
    </div>
  );
}
