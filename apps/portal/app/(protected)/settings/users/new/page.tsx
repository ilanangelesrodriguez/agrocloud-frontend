import Link from "next/link";

import { CompanyUserForm } from "@/features/company/users/components";

export default function Page() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">Invitar usuario</h1>
      <Link className="text-accent underline" href="/settings/users">
        Volver a usuarios
      </Link>
      <CompanyUserForm />
    </section>
  );
}
