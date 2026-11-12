import type { Metadata } from "next";

import { HomeContent } from "@/features/home/components/home-content";

export const metadata: Metadata = {
  title: "Calidad y trazabilidad agrícola en una plataforma",
  alternates: { canonical: "/" },
};

export default function Page() {
  return <HomeContent />;
}
