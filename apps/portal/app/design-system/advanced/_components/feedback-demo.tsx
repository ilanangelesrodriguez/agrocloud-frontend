"use client";

import { useState } from "react";
import {
  EmptyState,
  ErrorState,
  FormNotice,
  InlineNotice,
  LoadingState,
  PagePagination,
  StatusBadge,
} from "@agrocloud/ui";
import { Button, toast } from "@heroui/react";

import { DemoLabel, DemoSection } from "./demo-section";

export function FeedbackDemo() {
  const [page, setPage] = useState(2);
  const [retryCount, setRetryCount] = useState(0);

  return (
    <DemoSection
      description="Componentes reutilizables para estados de consulta, formularios, registros y notificaciones."
      title="Estados comunes y retroalimentación"
    >
      <div className="grid gap-3">
        <DemoLabel>Indicadores de estado</DemoLabel>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="success">Aprobado</StatusBadge>
          <StatusBadge tone="warning">Pendiente</StatusBadge>
          <StatusBadge tone="danger">Rechazado</StatusBadge>
          <StatusBadge tone="info">En revisión</StatusBadge>
          <StatusBadge tone="neutral">Sin iniciar</StatusBadge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid content-start gap-2">
          <DemoLabel>Carga con estructura</DemoLabel>
          <LoadingState label="Cargando registros de ejemplo" lines={3} />
        </div>
        <div className="grid content-start gap-2">
          <DemoLabel>Lista vacía</DemoLabel>
          <EmptyState
            description="Cuando la API responde sin registros, se explica qué significa."
            title="No hay registros en esta página"
          />
        </div>
      </div>

      <div className="grid gap-3">
        <DemoLabel>Error con reintento</DemoLabel>
        <ErrorState
          error={`Error ilustrativo de conexión · reintentos: ${retryCount}`}
          retry={() => setRetryCount((value) => value + 1)}
          title="No se pudo consultar el listado"
        />
      </div>

      <div className="grid gap-3">
        <DemoLabel>Aviso persistente y validación</DemoLabel>
        <InlineNotice
          description="Esta demostración no envía solicitudes a ninguna API."
          status="accent"
          title="Entorno de demostración"
        />
        <FormNotice message="Revisa los campos marcados antes de continuar." />
      </div>

      <div className="grid gap-3">
        <DemoLabel>Paginación cuando solo existe last_page</DemoLabel>
        <PagePagination last={8} onChange={setPage} page={page} />
      </div>

      <div className="grid gap-3">
        <DemoLabel>Toasts breves (proveedor global existente)</DemoLabel>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onPress={() => toast.success("Operación de ejemplo completada")}
          >
            Éxito
          </Button>
          <Button
            variant="secondary"
            onPress={() => toast.warning("Operación de ejemplo pendiente")}
          >
            Advertencia
          </Button>
          <Button
            variant="danger-soft"
            onPress={() => toast.danger("Error de ejemplo, sin llamadas reales")}
          >
            Error
          </Button>
        </div>
      </div>
    </DemoSection>
  );
}
