"use client";

import type { StatusTone } from "@agrocloud/ui";

import { useState } from "react";
import {
  EmptyState,
  InlineNotice,
  LoadingState,
  MetricCard,
  PageHeader,
  StatusBadge,
} from "@agrocloud/ui";
import {
  AlertDialog,
  Button,
  Card,
  Chip,
  Input,
  Label,
  Modal,
  Skeleton,
  Spinner,
  Table,
  TextField,
  Typography,
  toast,
} from "@heroui/react";
import { motion } from "motion/react";

type SampleLot = { id: string; weight: string; status: string; tone: StatusTone };

const sampleLots: SampleLot[] = [
  { id: "LOTE-001", weight: "1 250,50 kg", status: "Aprobado", tone: "success" },
  { id: "LOTE-002", weight: "480,00 kg", status: "Pendiente", tone: "warning" },
  { id: "LOTE-003", weight: "320,00 kg", status: "Rechazado", tone: "danger" },
  { id: "LOTE-004", weight: "760,25 kg", status: "Análisis en curso", tone: "info" },
  { id: "LOTE-005", weight: "125,00 kg", status: "Cancelado", tone: "neutral" },
];

function DemoSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid min-w-0 gap-4 rounded-card border border-border bg-surface p-5 sm:p-6">
      <div className="grid gap-1">
        <Typography.Heading className="text-xl" level={2}>
          {title}
        </Typography.Heading>
        <Typography.Paragraph color="muted" size="sm">
          {description}
        </Typography.Paragraph>
      </div>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  const [showLoading, setShowLoading] = useState(false);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto grid w-full max-w-6xl gap-6 pb-12"
      initial={{ opacity: 0, y: 8 }}
      lang="es"
      transition={{ duration: 0.22 }}
    >
      <div className="rounded-lg border border-warning/30 bg-warning-soft/40 px-4 py-3 text-sm text-foreground">
        <strong>Entorno de demostración.</strong> Los lotes, indicadores y confirmaciones de esta
        página son ejemplos visuales: no se crean, actualizan ni cancelan registros reales.
      </div>

      <PageHeader
        actions={
          <Modal>
            <Button className="h-10 rounded-control" variant="primary">
              Nuevo lote (demo)
            </Button>
            <Modal.Backdrop isDismissable>
              <Modal.Container>
                <Modal.Dialog className="rounded-dialog">
                  <Modal.CloseTrigger aria-label="Cerrar" />
                  <Modal.Header>
                    <Modal.Heading>Nuevo lote · Demostración</Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    <TextField>
                      <Label>Código del lote</Label>
                      <Input className="min-h-10" placeholder="LOTE-006" />
                    </TextField>
                    <p className="text-xs text-muted">
                      Este formulario no envía información al backend.
                    </p>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button slot="close" variant="secondary">
                      Cerrar
                    </Button>
                  </Modal.Footer>
                </Modal.Dialog>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>
        }
        description="Catálogo de componentes de HeroUI v3 adaptados a la identidad AgroCloud."
        title="AgroCloud · Sistema de diseño"
      />

      <DemoSection
        description="Jerarquía tipográfica semántica, texto de apoyo e identificadores técnicos."
        title="Typography"
      >
        <div className="flex flex-col gap-3">
          <Typography.Heading level={3}>Inspecciones de calidad</Typography.Heading>
          <Typography.Heading level={4}>Evidencias pendientes de revisión</Typography.Heading>
          <Typography.Paragraph color="muted" size="sm">
            Cada hallazgo se vincula con un fruto, una inspección y un lote.
          </Typography.Paragraph>
          <p className="text-sm">
            Referencia de lote: <Typography.Code>LOTE-2026-001</Typography.Code>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        description="Resumen de métricas y agrupación de información, con valores ficticios."
        title="Card"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard description="Ejemplo de contador" title="Lotes activos" value="18" />
          <MetricCard
            description="Ejemplo de contador"
            title="Pendientes de inspección"
            value="6"
          />
          <MetricCard description="No es un indicador real" title="Tasa ilustrativa" value="82 %" />
        </div>
        <Card className="border border-border bg-surface">
          <Card.Header>
            <Card.Title>Resumen operativo</Card.Title>
            <Card.Description>Composición estándar para tarjetas con contenido.</Card.Description>
          </Card.Header>
          <Card.Content>
            <Typography.Paragraph size="sm">
              Las tarjetas deben reunir información relacionada y acciones concretas.
            </Typography.Paragraph>
          </Card.Content>
        </Card>
      </DemoSection>

      <DemoSection
        description="Estados semánticos consistentes para tablas y fichas agrícolas."
        title="Chip y estados"
      >
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="success">Aprobado</StatusBadge>
          <StatusBadge tone="warning">Pendiente</StatusBadge>
          <StatusBadge tone="danger">Rechazado</StatusBadge>
          <StatusBadge tone="info">Análisis en curso</StatusBadge>
          <StatusBadge tone="neutral">Cancelado</StatusBadge>
          <Chip color="accent" size="sm" variant="soft">
            AgroCloud
          </Chip>
        </div>
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Lotes de ejemplo">
              <Table.Header>
                <Table.Column isRowHeader>Lote</Table.Column>
                <Table.Column>Peso</Table.Column>
                <Table.Column>Estado</Table.Column>
              </Table.Header>
              <Table.Body items={sampleLots}>
                {(lot) => (
                  <Table.Row className="h-12" id={lot.id}>
                    <Table.Cell className="whitespace-nowrap font-mono">{lot.id}</Table.Cell>
                    <Table.Cell className="whitespace-nowrap tabular-nums">{lot.weight}</Table.Cell>
                    <Table.Cell>
                      <StatusBadge tone={lot.tone}>{lot.status}</StatusBadge>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </DemoSection>

      <DemoSection
        description="Notificaciones temporales, alineadas abajo a la derecha; máximo tres a la vez."
        title="Toast"
      >
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onPress={() =>
              toast.success("Ejemplo de éxito", {
                description: "No se guardó ningún registro real.",
              })
            }
          >
            Mostrar éxito
          </Button>
          <Button
            variant="secondary"
            onPress={() =>
              toast.warning("Ejemplo de advertencia", {
                description: "Una inspección ficticia necesita revisión.",
              })
            }
          >
            Mostrar advertencia
          </Button>
          <Button
            variant="danger-soft"
            onPress={() =>
              toast.danger("Ejemplo de error", {
                description: "Solo se demuestra el mensaje visual.",
              })
            }
          >
            Mostrar error
          </Button>
        </div>
      </DemoSection>

      <DemoSection
        description="Spinner para operaciones breves; Skeleton para conservar la forma de la interfaz durante la carga."
        title="Spinner y Skeleton"
      >
        <div className="flex flex-wrap items-center gap-5 rounded-lg border border-border bg-background p-4">
          <Spinner color="accent" size="sm" />
          <Spinner color="accent" size="md" />
          <Spinner color="success" size="lg" />
          <Button isPending variant="secondary">
            Guardando (ejemplo)
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={showLoading ? "secondary" : "primary"}
            onPress={() => setShowLoading(true)}
          >
            Ver carga
          </Button>
          <Button
            variant={!showLoading ? "secondary" : "primary"}
            onPress={() => setShowLoading(false)}
          >
            Ver contenido
          </Button>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          {showLoading ? (
            <LoadingState label="Cargando lotes de ejemplo" lines={4} />
          ) : (
            <div className="grid gap-3">
              <p className="font-medium">Lotes disponibles (demostración)</p>
              <p className="text-sm text-muted">LOTE-001 · LOTE-002 · LOTE-003</p>
            </div>
          )}
        </div>
        <div aria-label="Ejemplo adicional de skeleton" className="grid gap-2">
          <Skeleton animationType="pulse" className="h-4 w-1/4 rounded-md" />
          <Skeleton animationType="pulse" className="h-4 w-3/4 rounded-md" />
        </div>
      </DemoSection>

      <DemoSection
        description="Avisos persistentes dentro del contexto de una página; no sustituyen las notificaciones temporales."
        title="Alert"
      >
        <div className="grid gap-3">
          <InlineNotice
            description="Los resultados de IA son una ayuda y requieren verificación de un inspector."
            status="warning"
            title="Revisión humana necesaria"
          />
          <InlineNotice
            description="Esta pantalla usa datos ficticios para validar los estilos de AgroCloud."
            status="accent"
            title="Información de demostración"
          />
        </div>
      </DemoSection>

      <DemoSection
        description="Confirmación explícita para acciones que pueden tener consecuencias importantes."
        title="AlertDialog"
      >
        <div className="flex flex-wrap items-center gap-3">
          <AlertDialog>
            <Button variant="danger-soft">Probar confirmación</Button>
            <AlertDialog.Backdrop>
              <AlertDialog.Container placement="center" size="sm">
                <AlertDialog.Dialog className="rounded-dialog">
                  {({ close }) => (
                    <>
                      <AlertDialog.Header>
                        <AlertDialog.Icon status="danger" />
                        <AlertDialog.Heading>¿Cancelar este lote de ejemplo?</AlertDialog.Heading>
                      </AlertDialog.Header>
                      <AlertDialog.Body>
                        Esta acción es una demostración. No afectará ningún registro ni enviará
                        solicitudes.
                      </AlertDialog.Body>
                      <AlertDialog.Footer>
                        <Button slot="close" variant="secondary">
                          Volver
                        </Button>
                        <Button
                          variant="danger"
                          onPress={() => {
                            close();
                            toast.warning("Confirmación demostrada", {
                              description: "Ningún lote real fue cancelado.",
                            });
                          }}
                        >
                          Confirmar demostración
                        </Button>
                      </AlertDialog.Footer>
                    </>
                  )}
                </AlertDialog.Dialog>
              </AlertDialog.Container>
            </AlertDialog.Backdrop>
          </AlertDialog>
          <p className="text-xs text-muted">
            Comprueba el foco, Tab y los botones de confirmación/cancelación.
          </p>
        </div>
      </DemoSection>

      <DemoSection
        description="Patrón compartido para listas o búsquedas sin resultados."
        title="Estados vacíos"
      >
        <EmptyState
          description="Este es un ejemplo de estado vacío. Al integrar la API se mostrará la acción correspondiente."
          title="No hay registros para mostrar"
        />
      </DemoSection>
    </motion.div>
  );
}
