import { notFound } from "next/navigation";
import { positiveInteger } from "@/lib/auth/authorized-identity";
import { ProcedureManager } from "@/features/company/agricultural/components/procedure-manager";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!positiveInteger(id)) notFound();
  return <ProcedureManager id={id} />;
}
