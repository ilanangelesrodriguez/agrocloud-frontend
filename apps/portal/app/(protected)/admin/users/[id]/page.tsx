import { notFound } from "next/navigation";

import { AdminUserDetails } from "@/features/admin/users/components";
import { positiveInteger } from "@/lib/auth/admin-route";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!positiveInteger(id)) notFound();

  return <AdminUserDetails id={id} />;
}
