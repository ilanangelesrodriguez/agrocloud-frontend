import { notFound } from "next/navigation";
import { catalogType } from "@/features/agricultural/schema";
import { CatalogManager } from "@/features/company/agricultural/components/catalog-manager";

export default async function Page({ params }: { params: Promise<{ type: string }> }) {
  const parsed = catalogType.safeParse((await params).type);
  if (!parsed.success) notFound();
  return <CatalogManager key={parsed.data} type={parsed.data} />;
}
