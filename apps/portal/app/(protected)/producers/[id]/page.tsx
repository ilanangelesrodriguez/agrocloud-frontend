import { notFound } from "next/navigation";

import { ProducerPage } from "@/features/producers/components/producer-page";
import { positiveInteger } from "@/lib/auth/authorized-identity";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!positiveInteger(id)) notFound();

  return <ProducerPage id={id} mode="detail" />;
}
