import { notFound } from "next/navigation";

import { InspectionDetails } from "@/features/inspections/components/inspection-details";
import { positiveInteger } from "@/lib/auth/authorized-identity";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!positiveInteger(id)) notFound();

  return <InspectionDetails id={id} />;
}
