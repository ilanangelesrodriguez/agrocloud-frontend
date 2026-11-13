import { notFound } from "next/navigation";

import { CompanyUserDetails } from "@/features/company/users/components";
import { positiveInteger } from "@/lib/auth/authorized-identity";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!positiveInteger(id)) notFound();

  return <CompanyUserDetails id={id} />;
}
