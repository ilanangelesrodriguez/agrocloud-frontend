import type { Metadata } from "next";

import { RequestSuccessContent } from "@/features/marketing/access-requests/components/request-success-content";
import { accessRequestReferenceSchema } from "@/features/marketing/access-requests/schema";

export const metadata: Metadata = {
  title: "Solicitud registrada",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ reference?: string | string[] }> };

export default async function Page({ searchParams }: Props) {
  const { reference } = await searchParams;
  const parsed = accessRequestReferenceSchema.safeParse(reference);

  return <RequestSuccessContent reference={parsed.data} />;
}
