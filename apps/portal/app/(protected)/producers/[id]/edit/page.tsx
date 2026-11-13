import { notFound } from "next/navigation";

import { AgriculturalPage } from "@/features/agricultural/components/agricultural-page";
import { positiveInteger } from "@/lib/auth/authorized-identity";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!positiveInteger(id)) notFound();

  return <AgriculturalPage id={id} mode="edit" resource="producers" />;
}
