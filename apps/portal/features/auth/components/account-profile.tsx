"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertDialog, Button, Form, Tabs, toast } from "@heroui/react";
import { FiCheckCircle, FiKey, FiLogOut, FiMail, FiShield, FiUser } from "react-icons/fi";
import { PageHeader, LoadingState, StatusBadge } from "@agrocloud/ui";
import type { z } from "zod";
import { CreationDrawer } from "@/components/creation-drawer";
import { changeEmailSchema } from "@/lib/auth/schemas";
import { useCurrentUser } from "../hooks/use-current-user";
import { postAuth } from "../request";
import { AuthField } from "./auth-field";
import { FormFeedback } from "./form-feedback";
import { SubmitButton } from "./submit-button";
import { ImageEditor } from "@/components/image-editor";
import { OrganizationBadge } from "@/components/layout/organization-badge";
import { useCompanyBrand } from "@/features/company/profile/use-company-brand";
import { motion, useReducedMotion } from "motion/react";
import { authRequest } from "../request";
import { ProfileEditor } from "./profile-editor";
import { PasswordEditor } from "./password-editor";

export function AccountProfile() {
  const { data: user } = useCurrentUser();
  const brand = useCompanyBrand(user);
  const reducedMotion = useReducedMotion();
  const [tab, setTab] = useState<"personal" | "security">("personal");
  const [dataDirty, setDataDirty] = useState(false);
  const [photoDirty, setPhotoDirty] = useState(false);
  const [dataBusy, setDataBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [leave, setLeave] = useState<{ tab?: "personal" | "security"; href?: string } | null>(null);
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
  const dirty = dataDirty || photoDirty;
  const busy = dataBusy || photoBusy || pending || closing;
  useEffect(() => {
    if (!dirty && !busy) return;
    function beforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    function beforeNavigate(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      )
        return;
      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self"))
        return;
      const url = new URL(link.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        (url.pathname === window.location.pathname && url.search === window.location.search)
      )
        return;
      event.preventDefault();
      setLeave({ href: url.pathname + url.search + url.hash });
    }
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", beforeNavigate, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", beforeNavigate, true);
    };
  }, [dirty, busy]);
  function changeTab(next: "personal" | "security") {
    if (next === tab) return;
    if (dirty || busy) setLeave({ tab: next });
    else setTab(next);
  }
  function discardAndContinue() {
    if (busy || !leave) return;
    const next = leave;
    setLeave(null);
    setDataDirty(false);
    setPhotoDirty(false);
    setRevision((value) => value + 1);
    if (next.tab) setTab(next.tab);
    if (next.href) router.push(next.href);
  }
  if (!user) return <LoadingState label="Cargando tu cuenta" />;
  const initials = [user.nombre, user.apellido]
    .filter(Boolean)
    .map((value) => value!.trim()[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <motion.section
      className="mx-auto w-full max-w-6xl min-w-0 space-y-6"
      initial={reducedMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
    >
      <PageHeader
        title="Mi perfil"
        description="Tu información personal y la seguridad de tu cuenta, en un solo lugar."
      />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(15rem,0.85fr)_minmax(0,2fr)]">
        <aside className="min-w-0 space-y-5 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <ImageEditor
            key={user.id_usuario + ":" + revision}
            imageUrl={user.foto_perfil_url}
            label="Fotografía de perfil"
            initials={initials}
            maxBytes={2 * 1024 * 1024}
            onDirtyChange={setPhotoDirty}
            onBusyChange={setPhotoBusy}
            onSave={async (file) => {
              const body = new FormData();
              body.append("avatar", file);
              await authRequest("/api/auth/avatar", { method: "POST", body });
              await cache.invalidateQueries({ queryKey: ["auth", "me"] });
            }}
            onRemove={async () => {
              await authRequest("/api/auth/avatar", { method: "DELETE" });
              await cache.invalidateQueries({ queryKey: ["auth", "me"] });
            }}
          />
          <div>
            <h2 className="break-words text-xl font-semibold">
              {user.nombre} {user.apellido}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {user.cargo || user.rol?.nombre || "Cuenta AgroCloud"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={user.estado ? "success" : "neutral"}>
              {user.estado ? "Cuenta activa" : "Cuenta inactiva"}
            </StatusBadge>
            {user.rol?.nombre ? <StatusBadge tone="info">{user.rol.nombre}</StatusBadge> : null}
          </div>
          <div className="space-y-3 border-t border-border pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Información de cuenta
            </h3>
            <OrganizationBadge brand={brand} />
            {!brand.available && brand.companyId ? (
              <p className="text-xs text-muted">Identificador de organización #{brand.companyId}</p>
            ) : null}
            <p className="flex items-center gap-2 text-xs text-muted">
              <FiUser aria-hidden="true" />
              ID de cuenta #{user.id_usuario}
            </p>
          </div>
        </aside>
        <Tabs
          variant="secondary"
          selectedKey={tab}
          onSelectionChange={(key) => changeTab(key === "security" ? "security" : "personal")}
          className="min-w-0 space-y-5"
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="Configuración de la cuenta">
              <Tabs.Tab id="personal">
                Datos personales
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="security">
                Seguridad
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
          <Tabs.Panel id="personal">
            <motion.div
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <ProfileEditor
                key={user.id_usuario + ":" + revision}
                user={user}
                onDirtyChange={setDataDirty}
                onBusyChange={setDataBusy}
              />
            </motion.div>
          </Tabs.Panel>
          <Tabs.Panel id="security">
            <div className="space-y-5">
              <PasswordEditor />
              <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <span className="rounded-xl bg-accent/10 p-3 text-accent">
                    <FiShield aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold">Acceso y seguridad</h2>
                    <p className="mt-1 text-sm text-muted">
                      Mantén actualizados tus medios de acceso.
                    </p>
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
                  Revoca el acceso en todos los dispositivos, incluido este. Necesitarás iniciar
                  sesión nuevamente.
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
                  <AlertDialog.Backdrop
                    isDismissable={!closing}
                    isKeyboardDismissDisabled={closing}
                  >
                    <AlertDialog.Container placement="center" size="sm">
                      <AlertDialog.Dialog>
                        <AlertDialog.Header>
                          <AlertDialog.Icon status="danger" />
                          <AlertDialog.Heading>¿Cerrar todas las sesiones?</AlertDialog.Heading>
                        </AlertDialog.Header>
                        <AlertDialog.Body>
                          También se cerrará tu sesión actual. Confirma que recuerdas tus
                          credenciales antes de continuar.
                        </AlertDialog.Body>
                        <AlertDialog.Footer>
                          <Button isDisabled={closing} slot="close" variant="secondary">
                            Cancelar
                          </Button>
                          <Button
                            isDisabled={closing}
                            variant="danger"
                            onPress={() => void closeAll()}
                          >
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
          </Tabs.Panel>
        </Tabs>
      </div>
      <AlertDialog
        isOpen={leave !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setLeave(null);
        }}
      >
        <AlertDialog.Backdrop isDismissable={!busy} isKeyboardDismissDisabled={busy}>
          <AlertDialog.Container placement="center" size="sm">
            <AlertDialog.Dialog>
              <AlertDialog.Header>
                <AlertDialog.Icon status="warning" />
                <AlertDialog.Heading>
                  {busy ? "Hay una operación en curso" : "Tienes cambios sin guardar"}
                </AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                {busy
                  ? "Espera a que termine antes de salir de esta vista."
                  : "Si continúas, se descartarán los datos o la imagen que todavía no guardaste."}
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button variant="secondary" isDisabled={busy} onPress={() => setLeave(null)}>
                  Seguir editando
                </Button>
                <Button variant="danger" isDisabled={busy} onPress={discardAndContinue}>
                  Descartar y continuar
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </motion.section>
  );
}
