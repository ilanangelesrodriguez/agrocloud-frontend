"use client";

import { FiSave } from "react-icons/fi";

import type { FormEvent } from "react";
import type { CompanyUser } from "@/features/company/users/schema";
import { useState } from "react";
import { usePanelBusy } from "@/components/route-drawer";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Checkbox, Label, ListBox, Select, toast } from "@heroui/react";
import { EmptyState, FormNotice, InlineNotice, PagePagination } from "@agrocloud/ui";
import { editUserSchema, inviteUserSchema } from "@/features/company/users/schema";
import type { UserPolicy } from "../policy";
import { useAdminCompanyOptions, useUserRoleOptions } from "../hooks";
import { saveUserOperation } from "../api";
import { UserField } from "./user-field";

export function SharedUserForm({
  user,
  policy,
  onSaved,
  onBusyChange,
}: {
  user?: CompanyUser;
  policy: UserPolicy;
  onSaved?: () => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const router = useRouter();
  const panelBusy = usePanelBusy();
  const reportBusy = (busy: boolean) => {
    onBusyChange?.(busy);
    if (panelBusy !== onBusyChange) panelBusy?.(busy);
  };
  const cache = useQueryClient();
  const { scope, base } = policy;
  const [role, setRole] = useState(user?.rol?.id_rol ?? null);
  const [active, setActive] = useState(user?.estado ?? false);
  const [error, setError] = useState("");
  const [action, setAction] = useState<"save" | "resend">("save");
  const canEditStatus = Boolean(
    user &&
    policy.actorId !== user.id_usuario &&
    !user.pending_activation &&
    policy.canChangeStatus,
  );
  const canSubmit = user ? policy.canEdit : policy.canInvite;
  const [companyPage, setCompanyPage] = useState(1);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const companies = useAdminCompanyOptions(
    policy.requireCompanyForInvitation && !user,
    companyPage,
  );
  const roles = useUserRoleOptions(scope, canSubmit);
  const mutation = useMutation({
    mutationFn: (operation: { kind: "save" | "resend"; body: object }) =>
      saveUserOperation(scope, user?.id_usuario, operation),
    onMutate: () => reportBusy?.(true),
    onSettled: () => reportBusy?.(false),
    onSuccess: (_, operation) => {
      toast.success(
        operation.kind === "resend" || !user ? "Invitación en cola" : "Usuario actualizado",
      );
      void cache.invalidateQueries({ queryKey: [scope] });
      if (onSaved) onSaved();
      else if (!user) router.push(base);
    },
    retry: false,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending) return;
    if (policy.requireCompanyForInvitation && !user && !companyId) {
      setError("Selecciona una empresa.");

      return;
    }
    const data = new FormData(event.currentTarget);
    const optional = (field: string) => String(data.get(field) ?? "").trim() || null;
    const profile = {
      nombre: String(data.get("nombre") ?? "").trim(),
      apellido: optional("apellido"),
      telefono: optional("telefono"),
      cargo: optional("cargo"),
    };
    const changedProfile = user
      ? Object.fromEntries(
          Object.entries(profile).filter(
            ([key, value]) => value !== (user[key as keyof typeof profile] ?? null),
          ),
        )
      : profile;
    const parsed = user
      ? editUserSchema.safeParse({
          ...changedProfile,
          id_rol: role !== null && role !== user.rol?.id_rol ? role : undefined,
          estado: canEditStatus && active !== user.estado ? active : undefined,
        })
      : inviteUserSchema.safeParse({
          ...profile,
          correo: String(data.get("correo") ?? "").trim(),
          id_rol: role,
        });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa los datos.");

      return;
    }
    if (
      user?.estado &&
      "estado" in parsed.data &&
      parsed.data.estado === false &&
      !window.confirm(
        "¿Desactivar esta cuenta? Se cerrarán sus sesiones y no podrá iniciar sesión hasta reactivarla.",
      )
    )
      return;
    setError("");
    setAction("save");
    mutation.mutate({
      kind: "save",
      body:
        policy.requireCompanyForInvitation && !user
          ? { ...parsed.data, id_empresa: companyId }
          : parsed.data,
    });
  }

  if (!canSubmit) {
    return (
      <InlineNotice
        status="warning"
        title="Acceso restringido"
        description="No tienes permiso para gestionar este usuario."
      />
    );
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <fieldset className="grid gap-4" disabled={mutation.isPending}>
        <legend className="mb-2 font-semibold">
          {user ? "Editar usuario" : "Datos de la invitación"}
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <UserField required initial={user?.nombre} label="Nombre" maxLength={150} name="nombre" />
          <UserField initial={user?.apellido} label="Apellido" maxLength={150} name="apellido" />
          {user ? null : (
            <UserField required label="Correo" maxLength={255} name="correo" type="email" />
          )}
          <UserField
            initial={user?.telefono}
            label="Teléfono"
            maxLength={30}
            name="telefono"
            type="tel"
          />
          <UserField initial={user?.cargo} label="Cargo" maxLength={120} name="cargo" />
        </div>
        {policy.requireCompanyForInvitation && !user ? (
          <div className="space-y-2">
            <Select
              isDisabled={mutation.isPending || companies.isPending}
              placeholder="Selecciona una empresa"
              value={companyId === null ? null : String(companyId)}
              onChange={(value) => setCompanyId(value ? Number(value) : null)}
            >
              <Label>Empresa</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox aria-label="Empresas">
                  {(companies.data?.data ?? [])
                    .filter((item) => item.estado === true)
                    .map((item) => (
                      <ListBox.Item
                        key={item.id_empresa}
                        id={String(item.id_empresa)}
                        textValue={item.razon_social}
                      >
                        {item.razon_social} · {item.ruc}
                      </ListBox.Item>
                    ))}
                </ListBox>
              </Select.Popover>
            </Select>
            {companies.isError ? (
              <div className="space-y-2">
                <FormNotice message={companies.error.message} />
                <Button
                  type="button"
                  variant="secondary"
                  onPress={() => {
                    void companies.refetch();
                  }}
                >
                  Reintentar cargar empresas
                </Button>
              </div>
            ) : null}
            {companies.data ? (
              <PagePagination
                last={companies.data.meta.last_page}
                page={companyPage}
                onChange={(page) => {
                  setCompanyId(null);
                  setCompanyPage(page);
                }}
              />
            ) : null}
            {companies.data && !companies.data.data.some((item) => item.estado === true) ? (
              <EmptyState
                title="No hay empresas activas"
                description="Comprueba los permisos y el estado de las empresas disponibles."
              />
            ) : null}
          </div>
        ) : null}
        {roles.isError ? (
          <div className="space-y-2">
            <FormNotice message={roles.error.message} />
            <Button
              type="button"
              variant="secondary"
              onPress={() => {
                void roles.refetch();
              }}
            >
              Reintentar cargar roles
            </Button>
          </div>
        ) : (
          <Select
            isDisabled={roles.isPending || mutation.isPending}
            placeholder="Selecciona un rol"
            value={role === null ? null : String(role)}
            onChange={(value) => setRole(value ? Number(value) : null)}
          >
            <Label>Rol</Label>
            <Select.Trigger className="min-h-11 w-full">
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox aria-label="Roles disponibles">
                {(roles.data?.data ?? [])
                  .filter((option) => option.codigo !== "SUPERADMIN")
                  .map((option) => (
                    <ListBox.Item
                      key={option.id_rol}
                      id={String(option.id_rol)}
                      textValue={option.nombre}
                    >
                      {option.nombre}
                    </ListBox.Item>
                  ))}
              </ListBox>
            </Select.Popover>
          </Select>
        )}
        {canEditStatus ? (
          <Checkbox isSelected={active} onChange={setActive}>
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Label>Cuenta activa</Label>
            </Checkbox.Content>
          </Checkbox>
        ) : null}
      </fieldset>
      {error || mutation.error ? <FormNotice message={error || mutation.error?.message} /> : null}
      <div className="flex flex-wrap gap-2">
        <Button
          isDisabled={
            mutation.isPending ||
            (!user && (!role || (policy.requireCompanyForInvitation && !companyId)))
          }
          type="submit"
          variant="primary"
        >
          <FiSave aria-hidden="true" />
          {mutation.isPending && action === "save"
            ? "Guardando…"
            : user
              ? "Guardar cambios"
              : "Enviar invitación"}
        </Button>
        {user?.pending_activation ? (
          <Button
            isDisabled={mutation.isPending}
            type="button"
            variant="secondary"
            onPress={() => {
              setError("");
              setAction("resend");
              mutation.mutate({ kind: "resend", body: {} });
            }}
          >
            {mutation.isPending && action === "resend" ? "Enviando…" : "Reenviar invitación"}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
