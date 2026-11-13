import { UserForm } from "@/features/company/components/users";
export default function Page() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">Invitar usuario a una empresa</h1>
      <UserForm admin />
    </section>
  );
}
