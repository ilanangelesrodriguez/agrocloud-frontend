import { notFound } from "next/navigation";
import { positiveInteger } from "@/lib/auth/authorized-identity";
import { LotPage } from "@/features/lots/components/lot-page";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!positiveInteger(id)) notFound();
  return <LotPage id={id} mode="detail" stage="reception" />;
}
