import { notFound } from "next/navigation";

import { UserDetails } from "@/features/company/components/users";
import { positiveInteger } from "@/lib/auth/authorized-identity";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!positiveInteger(id)) notFound();

  return <UserDetails id={id} />;
}
