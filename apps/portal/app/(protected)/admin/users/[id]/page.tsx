import { notFound } from "next/navigation";
import { UserDetails } from "@/features/company/components/users";
import { positiveInteger } from "@/lib/auth/admin-route";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!positiveInteger(id)) notFound();
  return <UserDetails admin id={id} />;
}
