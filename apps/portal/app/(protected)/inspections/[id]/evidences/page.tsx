import { notFound } from "next/navigation";
import { positiveInteger } from "@/lib/auth/authorized-identity";
import { InspectionDetails } from "@/features/inspections/components/inspection-details";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!positiveInteger(id)) notFound();
  return <InspectionDetails id={id} view="evidences" />;
}
