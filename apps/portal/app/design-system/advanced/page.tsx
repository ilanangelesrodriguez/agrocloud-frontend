"use client";

import { PageHeader } from "@agrocloud/ui";
import { Typography } from "@heroui/react";

import { DatesDemo } from "./_components/dates-demo";
import { FeedbackDemo } from "./_components/feedback-demo";
import { FormPatternDemo } from "./_components/form-pattern-demo";
import { FormsDemo } from "./_components/forms-demo";
import { NavigationDemo } from "./_components/navigation-demo";
import { OverlaysDemo } from "./_components/overlays-demo";

export default function AdvancedDesignSystemPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 pb-14" lang="es">
      <div className="rounded-xl border border-warning/30 bg-warning-soft/40 p-4 text-sm">
        <strong>Biblioteca de demostración:</strong> todas las cifras, registros y acciones son
        ficticias. Ninguna operación de esta página modifica la base de datos.
      </div>
      <PageHeader
        description="Patrones HeroUI v3 para navegación, formularios, fechas, ventanas y estados empresariales."
        title="AgroCloud · Componentes avanzados"
      />
      <Typography.Paragraph color="muted" size="sm">
        Los componentes utilizan los mismos tokens de marca que el portal. Prueba también modo
        oscuro, teclado y tamaño móvil. Las zonas con sombra permiten desplazarse sin mostrar la
        barra de scroll nativa.
      </Typography.Paragraph>
      <FeedbackDemo />
      <FormPatternDemo />
      <NavigationDemo />
      <OverlaysDemo />
      <FormsDemo />
      <DatesDemo />
    </div>
  );
}
