"use client";

import { useState } from "react";
import { AgroPagination, AgroScrollArea, StatusBadge } from "@agrocloud/ui";
import {
  Accordion,
  Button,
  ButtonGroup,
  Description,
  Label,
  Link,
  ListBox,
  ScrollShadow,
  Separator,
  Surface,
  Table,
} from "@heroui/react";
import { DemoLabel, DemoSection } from "./demo-section";

const lots = [
  { id: "LOTE-001", producer: "Fundo Los Olivos", status: "Pendiente", tone: "warning" as const },
  { id: "LOTE-002", producer: "Agro Norte", status: "Aprobado", tone: "success" as const },
  { id: "LOTE-003", producer: "Fundo Santa Ana", status: "En revisión", tone: "info" as const },
  { id: "LOTE-004", producer: "Valle Verde", status: "Aprobado", tone: "success" as const },
  { id: "LOTE-005", producer: "Agro Perú", status: "Rechazado", tone: "danger" as const },
  { id: "LOTE-006", producer: "Fundo La Luz", status: "Pendiente", tone: "warning" as const },
  { id: "LOTE-007", producer: "Valle Norte", status: "Aprobado", tone: "success" as const },
];

export function NavigationDemo() {
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"table" | "cards">("table");
  const perPage = 3;
  const currentLots = lots.slice((page - 1) * perPage, page * perPage);

  return (
    <DemoSection
      title="Navegación, listados y desplazamiento"
      description="ScrollShadow · Pagination · Table · ListBox · Link · Accordion · ButtonGroup · Surface · Separator"
    >
      <div className="grid gap-3">
        <DemoLabel>ScrollShadow sin barra visual</DemoLabel>
        <p className="text-xs text-muted">El desvanecimiento marca el contenido oculto. El scroll continúa funcionando con rueda, trackpad, táctil y flechas tras enfocar un elemento.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <AgroScrollArea className="h-44 rounded-xl border border-border bg-background p-3">
            <div className="grid gap-2">
              {Array.from({ length: 12 }, (_, index) => (
                <a key={index} href={`#lot-list`} className="rounded-lg bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-focus">
                  Etapa {index + 1} · Inspección y trazabilidad
                </a>
              ))}
            </div>
          </AgroScrollArea>
          <div className="min-w-0 rounded-xl border border-border bg-background p-3">
            <p className="mb-3 text-sm font-medium">Lista horizontal</p>
            <ScrollShadow hideScrollBar orientation="horizontal" size={24} className="agro-scroll-area w-full">
              <div className="flex w-max gap-2 pb-2">
                {Array.from({ length: 10 }, (_, index) => (
                  <span key={index} className="shrink-0 rounded-lg border border-border bg-surface px-4 py-2 text-sm">
                    Semana {index + 1}
                  </span>
                ))}
              </div>
            </ScrollShadow>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid gap-3" id="lot-list">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <DemoLabel>Table y Pagination controlada</DemoLabel>
          <ButtonGroup size="sm" variant="secondary">
            <Button aria-pressed={view === "table"} onPress={() => setView("table")}>Tabla</Button>
            <Button aria-pressed={view === "cards"} onPress={() => setView("cards")}><ButtonGroup.Separator /> Tarjetas</Button>
          </ButtonGroup>
        </div>
        {view === "table" ? (
          <Table>
            <Table.ScrollContainer className="agro-hide-scrollbar">
              <Table.Content aria-label="Lotes de demostración">
                <Table.Header>
                  <Table.Column isRowHeader>Identificador</Table.Column>
                  <Table.Column>Productor</Table.Column>
                  <Table.Column>Estado</Table.Column>
                </Table.Header>
                <Table.Body items={currentLots}>
                  {(lot) => (
                    <Table.Row id={lot.id} key={lot.id}>
                      <Table.Cell className="font-mono text-xs">{lot.id}</Table.Cell>
                      <Table.Cell>{lot.producer}</Table.Cell>
                      <Table.Cell><StatusBadge tone={lot.tone}>{lot.status}</StatusBadge></Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        ) : (
          <div className="grid gap-2 sm:grid-cols-3">
            {currentLots.map((lot) => (
              <Surface className="rounded-xl border border-border p-4" key={lot.id}>
                <p className="font-mono text-sm font-semibold">{lot.id}</p>
                <p className="my-2 text-sm">{lot.producer}</p>
                <StatusBadge tone={lot.tone}>{lot.status}</StatusBadge>
              </Surface>
            ))}
          </div>
        )}
        <AgroPagination page={page} pageSize={perPage} total={lots.length} onPageChange={setPage} />
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <DemoLabel>ListBox (selección accesible)</DemoLabel>
          <ListBox aria-label="Etapas de calidad" selectionMode="single" className="rounded-lg border border-border p-2">
            <ListBox.Item id="recepcion" textValue="Recepción">
              <Label>Recepción</Label>
              <Description>Confirmación del ingreso del lote</Description>
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="muestreo" textValue="Muestreo">
              <Label>Muestreo</Label>
              <Description>Selección e identificación de frutos</Description>
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="inspeccion" textValue="Inspección">
              <Label>Inspección</Label>
              <Description>Evaluación y evidencias</Description>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          </ListBox>
        </div>
        <div className="grid content-start gap-3">
          <DemoLabel>Accordion y Link</DemoLabel>
          <Accordion>
            <Accordion.Item id="faq-a">
              <Accordion.Heading>
                <Accordion.Trigger>¿Cómo funciona el dictamen?<Accordion.Indicator /></Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel><Accordion.Body>El supervisor registra una decisión después de validar las evidencias.</Accordion.Body></Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item id="faq-b">
              <Accordion.Heading>
                <Accordion.Trigger>¿La IA decide automáticamente?<Accordion.Indicator /></Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel><Accordion.Body>No. Los hallazgos requieren revisión humana.</Accordion.Body></Accordion.Panel>
            </Accordion.Item>
          </Accordion>
          <Link href="/design-system" className="text-accent">Volver a la galería principal <Link.Icon /></Link>
        </div>
      </div>
    </DemoSection>
  );
}
