"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertDialog, Avatar, Button, Form, toast } from "@heroui/react";
import {
  FiBriefcase,
  FiCheckCircle,
  FiKey,
  FiLogOut,
  FiMail,
  FiPhone,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { PageHeader, LoadingState, StatusBadge } from "@agrocloud/ui";
import type { z } from "zod";
import { CreationDrawer } from "@/components/creation-drawer";
import { changeEmailSchema } from "@/lib/auth/schemas";
import { useCurrentUser } from "../hooks/use-current-user";
import { postAuth } from "../request";
import { AuthField } from "./auth-field";
import { FormFeedback } from "./form-feedback";
import { SubmitButton } from "./submit-button";

export function AccountProfile() {
  const { data: user } = useCurrentUser();
  const cache = useQueryClient();
  const router = useRouter();
  const [emailOpen, setEmailOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; success: boolean } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof changeEmailSchema>>({ resolver: zodResolver(changeEmailSchema) });
  const submit = handleSubmit(async (data) => {
    if (pending) return;
    setPending(true);
    setFeedback(null);
    try {
      await postAuth("/api/auth/change-email", data);
      toast.success("Confirma tu nuevo correo", {
        description:
          "Se enviará un enlace a la nueva dirección. Tu correo actual seguirá activo hasta confirmarlo.",
      });
      reset();
      setEmailOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo solicitar el cambio.";
      setFeedback({ message, success: false });
      toast.danger("No se pudo cambiar el correo", { description: message });
    } finally {
      setPending(false);
    }
  });
  async function recoverPassword() {
    if (!user || recovering || recoverySent) return;
    setRecovering(true);
    try {
      await postAuth("/api/auth/forgot-password", { correo: user.correo });
      setRecoverySent(true);
      toast.success("Solicitud registrada", {
        description:
          "Si tu cuenta puede recuperar el acceso, recibirás un enlace para definir una nueva contraseña.",
      });
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : "No se pudo solicitar el enlace.");
    } finally {
      setRecovering(false);
    }
  }
  async function closeAll() {
    if (closing) return;
    setClosing(true);
    try {
      await postAuth("/api/auth/logout-all");
      toast.success("Se cerraron todas las sesiones", {
        description: "Inicia sesión nuevamente para acceder.",
      });
      cache.clear();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : "No se pudieron cerrar las sesiones.");
      setClosing(false);
    }
  }
  if (!user) return <LoadingState label="Cargando tu cuenta" />;
  const initials = [user.nombre, user.apellido]
    .filter(Boolean)
    .map((value) => value!.trim()[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <section className="min-w-0 space-y-6">
      <PageHeader
        title="Mi perfil"
        description="Consulta tus datos y administra la seguridad de tu cuenta."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <aside className="min-w-0 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <Avatar className="mb-5 size-20 text-2xl">
            <Avatar.Fallback>{initials}</Avatar.Fallback>
          </Avatar>
          <h2 className="break-words text-xl font-semibold [overflow-wrap:anywhere]">
            {user.nombre} {user.apellido}
          </h2>
          <p className="mt-2 break-all text-sm text-muted">{user.correo}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge tone="info">{user.rol?.nombre ?? "Sin rol"}</StatusBadge>
            <StatusBadge tone={user.estado ? "success" : "neutral"}>
              {user.estado ? "Cuenta activa" : "Cuenta inactiva"}
            </StatusBadge>
          </div>
          <dl className="mt-6 space-y-5 border-t border-border pt-6 text-sm">
            <div>
              <dt className="flex items-center gap-2 text-muted">
                <FiUser aria-hidden="true" /> Identificador
              </dt>
              <dd className="mt-1 break-words font-medium [overflow-wrap:anywhere]">
                #{user.id_usuario}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-muted">
                <FiBriefcase aria-hidden="true" /> Cargo
              </dt>
              <dd className="mt-1 font-medium">{user.cargo || "Sin cargo registrado"}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-muted">
                <FiPhone aria-hidden="true" /> Teléfono
              </dt>
              <dd className="mt-1 font-medium">{user.telefono || "Sin teléfono registrado"}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-muted">
                <FiBriefcase aria-hidden="true" /> Empresa
              </dt>
              <dd className="mt-1 font-medium">
                {user.id_empresa ? "Empresa #" + user.id_empresa : "Administración de plataforma"}
              </dd>
            </div>
          </dl>
        </aside>
        <div className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="rounded-xl bg-accent/10 p-3 text-accent">
                <FiShield aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Acceso y seguridad</h2>
                <p className="mt-1 text-sm text-muted">Mantén actualizados tus medios de acceso.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex min-w-0 flex-col flex-wrap justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <h3 className="flex items-center gap-2 font-medium">
                    <FiMail aria-hidden="true" /> Correo electrónico
                  </h3>
                  <p className="mt-2 break-all text-sm text-muted">{user.correo}</p>
                </div>
                <CreationDrawer
                  open={emailOpen}
                  onOpenChange={(open) => {
                    if (!pending) {
                      setEmailOpen(open);
                      reset();
                      setFeedback(null);
                    }
                  }}
                  busy={pending}
                  title="Cambiar correo"
                  description="Confirma tu contraseña actual. Enviaremos un enlace de verificación a la nueva dirección."
                  trigger={
                    <Button
                      className="max-w-full shrink-0"
                      variant="secondary"
                      onPress={() => setEmailOpen(true)}
                    >
                      <FiMail aria-hidden="true" /> Cambiar correo
                    </Button>
                  }
                >
                  <Form className="space-y-5" validationBehavior="aria" onSubmit={submit}>
                    <AuthField
                      autoComplete="email"
                      label="Nuevo correo"
                      type="email"
                      {...register("correo")}
                      error={errors.correo?.message}
                    />
                    <AuthField
                      passwordToggle
                      autoComplete="current-password"
                      label="Contraseña actual"
                      {...register("current_password")}
                      error={errors.current_password?.message}
                    />
                    <FormFeedback message={feedback?.message} success={feedback?.success} />
                    <SubmitButton pending={pending}>Solicitar cambio</SubmitButton>
                  </Form>
                </CreationDrawer>
              </div>
              <div className="flex min-w-0 flex-col flex-wrap justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="flex items-center gap-2 font-medium">
                    <FiKey aria-hidden="true" /> Contraseña
                  </h3>
                  <p className="mt-2 max-w-md break-words text-sm text-muted">
                    Solicita un enlace a tu correo para definir una nueva contraseña de forma
                    segura.
                  </p>
                </div>
                <Button
                  isDisabled={recovering || recoverySent}
                  className="max-w-full shrink-0 whitespace-normal"
                  variant="secondary"
                  onPress={() => void recoverPassword()}
                >
                  {recoverySent ? (
                    <FiCheckCircle aria-hidden="true" />
                  ) : (
                    <FiKey aria-hidden="true" />
                  )}
                  {recovering
                    ? "Solicitando…"
                    : recoverySent
                      ? "Enlace solicitado"
                      : "Renovar contraseña"}
                </Button>
              </div>
            </div>
          </section>
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <FiLogOut aria-hidden="true" /> Cerrar todas las sesiones
            </h2>
            <p className="mb-5 mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Revoca el acceso en todos los dispositivos, incluido este. Necesitarás iniciar sesión
              nuevamente.
            </p>
            <AlertDialog
              isOpen={confirmLogout}
              onOpenChange={(open) => {
                if (!closing) setConfirmLogout(open);
              }}
            >
              <Button variant="danger-soft" onPress={() => setConfirmLogout(true)}>
                <FiLogOut aria-hidden="true" /> Cerrar todas las sesiones
              </Button>
              <AlertDialog.Backdrop isDismissable={!closing} isKeyboardDismissDisabled={closing}>
                <AlertDialog.Container placement="center" size="sm">
                  <AlertDialog.Dialog>
                    <AlertDialog.Header>
                      <AlertDialog.Icon status="danger" />
                      <AlertDialog.Heading>¿Cerrar todas las sesiones?</AlertDialog.Heading>
                    </AlertDialog.Header>
                    <AlertDialog.Body>
                      También se cerrará tu sesión actual. Confirma que recuerdas tus credenciales
                      antes de continuar.
                    </AlertDialog.Body>
                    <AlertDialog.Footer>
                      <Button isDisabled={closing} slot="close" variant="secondary">
                        Cancelar
                      </Button>
                      <Button isDisabled={closing} variant="danger" onPress={() => void closeAll()}>
                        <FiLogOut aria-hidden="true" />
                        {closing ? "Cerrando…" : "Cerrar sesiones"}
                      </Button>
                    </AlertDialog.Footer>
                  </AlertDialog.Dialog>
                </AlertDialog.Container>
              </AlertDialog.Backdrop>
            </AlertDialog>
          </section>
        </div>
      </div>
    </section>
  );
}
