import { notFound } from "next/navigation";

import { CompanyDetails } from "@/features/admin/companies/components/company-details";
import { positiveInteger } from "@/lib/auth/admin-route";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!positiveInteger(id)) notFound();

  return <CompanyDetails id={id} />;
}
