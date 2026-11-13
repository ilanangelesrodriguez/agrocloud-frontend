"use client";

import type { FormEvent } from "react";
import type { CompanyUser } from "../schema";

import { useState } from "react";
import { Button, Checkbox, Input, Label, ListBox, Select, TextField, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AdminError, AdminPagination } from "@/features/admin/components/admin-ui";
import { adminRequest } from "@/features/admin/api";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

import { canManageCompany } from "../navigation";
import { editUserSchema, invitationSchema, inviteUserSchema, rolesSchema, userSchema, usersSchema } from "../schema";

function userStatus(user: CompanyUser) {
  if (user.pending_activation) return "Invitación pendiente";
  return user.estado ? "Activo" : "Inactivo";
}

export function Users() {
  const [page, setPage] = useState(1);
  const { data: actor } = useCurrentUser();
  const users = useQuery({
    queryKey: ["company", "users", page],
    queryFn: ({ signal }) => adminRequest("users?page=" + page, usersSchema, { signal }, "company"),
    retry: false,
  });

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">Usuarios de la empresa</h1>
      {canManageCompany(actor, "usuarios.crear") ? (
        <Link className="inline-block text-accent underline" href="/settings/users/new">Invitar usuario</Link>
      ) : null}
      {users.isPending ? <p role="status">Cargando usuarios…</p> : users.isError ? (
        <AdminError error={users.error} retry={() => { void users.refetch(); }} />
      ) : (
        <>
          {users.data.data.length ? (
            <ul className="divide-y divide-border rounded-card border border-border bg-surface">
              {users.data.data.map((user) => (
                <li key={user.id_usuario} className="space-y-1 p-4">
                  <Link className="font-semibold text-accent underline" href={"/settings/users/" + user.id_usuario}>
                    {user.nombre} {user.apellido}
                  </Link>
                  <p className="break-words text-sm text-muted">{user.correo} · {user.rol?.nombre ?? "Sin rol"} · {userStatus(user)}</p>
                </li>
              ))}
            </ul>
          ) : <p>No hay usuarios en esta página.</p>}
          <AdminPagination last={users.data.meta.last_page} page={page} onChange={setPage} />
        </>
      )}
    </section>
  );
}

export function UserDetails({ id }: { id: string }) {
  const { data: actor } = useCurrentUser();
  const user = useQuery({
    queryKey: ["company", "user", id],
    queryFn: ({ signal }) => adminRequest("users/" + id, userSchema, { signal }, "company"),
    retry: false,
  });
  const record = user.data?.data;

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">Detalle de usuario</h1>
      <Link className="text-accent underline" href="/settings/users">Volver a usuarios</Link>
      {user.isPending ? <p role="status">Cargando usuario…</p> : user.isError ? (
        <AdminError error={user.error} retry={() => { void user.refetch(); }} />
      ) : record ? (
        <div className="space-y-4 rounded-card border border-border bg-surface p-5">
          <h2 className="text-xl font-semibold">{record.nombre} {record.apellido}</h2>
          <dl className="space-y-1 text-sm">
            <div><dt className="inline font-semibold">Correo </dt><dd className="inline break-words">{record.correo}</dd></div>
            <div><dt className="inline font-semibold">Rol </dt><dd className="inline">{record.rol?.nombre ?? "Sin rol"}</dd></div>
            <div><dt className="inline font-semibold">Estado </dt><dd className="inline">{userStatus(record)}</dd></div>
            {record.cargo ? <div><dt className="inline font-semibold">Cargo </dt><dd className="inline">{record.cargo}</dd></div> : null}
            {record.telefono ? <div><dt className="inline font-semibold">Teléfono </dt><dd className="inline">{record.telefono}</dd></div> : null}
          </dl>
          {canManageCompany(actor, "usuarios.editar") ? (
            <UserForm key={JSON.stringify([id, record.rol?.id_rol, record.estado, record.pending_activation])} user={record} />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function UserField({ name, label, maxLength, required = false, type = "text" }: {
  name: string; label: string; maxLength: number; required?: boolean; type?: "text" | "email" | "tel";
}) {
  return (
    <TextField isRequired={required} name={name} type={type}>
      <Label>{label}</Label>
      <Input className="w-full" maxLength={maxLength} />
    </TextField>
  );
}

export function UserForm({ user }: { user?: CompanyUser }) {
  const router = useRouter();
  const cache = useQueryClient();
  const { data: actor } = useCurrentUser();
  const [role, setRole] = useState(user?.rol?.id_rol ?? null);
  const [active, setActive] = useState(user?.estado ?? false);
  const [error, setError] = useState("");
  const [action, setAction] = useState<"save" | "resend">("save");
  const canEditStatus = Boolean(user && actor?.id_usuario !== user.id_usuario &&
    !user.pending_activation && canManageCompany(actor, "usuarios.estado"));
  const canSubmit = canManageCompany(actor, user ? "usuarios.editar" : "usuarios.crear");
  const roles = useQuery({
    enabled: canSubmit,
    queryKey: ["company", "roles"],
    queryFn: ({ signal }) => adminRequest("roles", rolesSchema, { signal }, "company"),
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: async (operation: { kind: "save" | "resend"; body: object }) => {
      const headers = { "Content-Type": "application/json" };
      const body = JSON.stringify(operation.body);
      if (operation.kind === "resend" && user) {
        await adminRequest("users/" + user.id_usuario + "/invitation", invitationSchema, { method: "POST", headers, body }, "company");
        return;
      }

      await adminRequest(user ? "users/" + user.id_usuario : "users", userSchema, { method: user ? "PATCH" : "POST", headers, body }, "company");
    },
    onSuccess: (_, operation) => {
      toast.success(operation.kind === "resend" || !user ? "Invitación en cola" : "Usuario actualizado");
      void cache.invalidateQueries({ queryKey: ["company"] });
      if (!user) router.push("/settings/users");
    },
    retry: false,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending) return;
    const data = new FormData(event.currentTarget);
    const optional = (field: string) => String(data.get(field) ?? "").trim() || null;
    const parsed = user ? editUserSchema.safeParse({
      id_rol: role !== null && role !== user.rol?.id_rol ? role : undefined,
      estado: canEditStatus && active !== user.estado ? active : undefined,
    }) : inviteUserSchema.safeParse({
      nombre: data.get("nombre"), apellido: optional("apellido"),
      correo: String(data.get("correo") ?? "").trim(), id_rol: role,
      cargo: optional("cargo"), telefono: optional("telefono"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa los datos.");
      return;
    }
    setError("");
    setAction("save");
    mutation.mutate({ kind: "save", body: parsed.data });
  }

  if (!canSubmit) {
    return <p role="alert">No tienes permiso para gestionar este usuario.</p>;
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <fieldset className="grid gap-4" disabled={mutation.isPending}>
        <legend className="mb-2 font-semibold">{user ? "Editar usuario" : "Datos de la invitación"}</legend>
        {user ? null : (
          <div className="grid gap-4 sm:grid-cols-2">
            <UserField required label="Nombre" maxLength={150} name="nombre" />
            <UserField label="Apellido" maxLength={150} name="apellido" />
            <UserField required label="Correo" maxLength={255} name="correo" type="email" />
            <UserField label="Teléfono" maxLength={30} name="telefono" type="tel" />
            <UserField label="Cargo" maxLength={120} name="cargo" />
          </div>
        )}
        {roles.isError ? (
          <div className="space-y-2">
            <p role="alert">{roles.error.message}</p>
            <Button type="button" variant="secondary" onPress={() => { void roles.refetch(); }}>
              Reintentar cargar roles
            </Button>
          </div>
        ) : (
          <Select isDisabled={roles.isPending || mutation.isPending} placeholder="Selecciona un rol"
            value={role === null ? null : String(role)} onChange={(value) => setRole(value ? Number(value) : null)}>
            <Label>Rol</Label>
            <Select.Trigger className="min-h-11 w-full"><Select.Value /><Select.Indicator /></Select.Trigger>
            <Select.Popover>
              <ListBox aria-label="Roles disponibles">
                {(roles.data?.data ?? []).map((option) => (
                  <ListBox.Item key={option.id_rol} id={String(option.id_rol)} textValue={option.nombre}>{option.nombre}</ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        )}
        {canEditStatus ? (
          <Checkbox isSelected={active} onChange={setActive}>
            <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
            <Checkbox.Content>Cuenta activa</Checkbox.Content>
          </Checkbox>
        ) : null}
      </fieldset>
      {error || mutation.error ? <p role="alert">{error || mutation.error?.message}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button isDisabled={mutation.isPending || (!user && !role)} type="submit" variant="primary">
          {mutation.isPending && action === "save" ? "Guardando…" : user ? "Guardar cambios" : "Enviar invitación"}
        </Button>
        {user?.pending_activation ? (
          <Button isDisabled={mutation.isPending} type="button" variant="secondary" onPress={() => {
            setError("");
            setAction("resend");
            mutation.mutate({ kind: "resend", body: {} });
          }}>
            {mutation.isPending && action === "resend" ? "Enviando…" : "Reenviar invitación"}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
