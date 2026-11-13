import { notFound } from "next/navigation";

import { SamplingDetails } from "@/features/agricultural/components/inspection-pages";
import { positiveInteger } from "@/lib/auth/authorized-identity";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!positiveInteger(id)) notFound();

  return <SamplingDetails id={id} />;
}
