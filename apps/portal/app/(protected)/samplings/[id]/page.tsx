import { notFound } from "next/navigation";

import { SamplingDetails } from "@/features/samplings/components/sampling-details";
import { positiveInteger } from "@/lib/auth/authorized-identity";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!positiveInteger(id)) notFound();

  return <SamplingDetails id={id} />;
}
