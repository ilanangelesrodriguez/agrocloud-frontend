import { QualityPage } from "@/features/quality/components/quality-page";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const status = (await searchParams).status;
  return (
    <QualityPage
      initialStatus={status === "OBSERVED" || status === "COMPLETED" ? status : "PENDING"}
    />
  );
}
