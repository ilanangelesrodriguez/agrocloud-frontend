import { RouteDrawer } from "@/components/route-drawer";
import { AdminUsersList } from "@/features/admin/users/components";
import { notFound } from "next/navigation";

import { AdminUserDetails } from "@/features/admin/users/components";
import { positiveInteger } from "@/lib/auth/admin-route";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!positiveInteger(id)) notFound();

  return (
    <RouteDrawer
      title="Usuario y permisos"
      description="Consulta la información y completa las acciones disponibles sin salir del listado."
      back="/admin/users"
      background={<AdminUsersList />}
    >
      <AdminUserDetails id={id} />
    </RouteDrawer>
  );
}
