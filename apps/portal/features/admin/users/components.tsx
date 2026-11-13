"use client";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { globalUserPolicy } from "@/features/users/policy";
import { SharedUsersList } from "@/features/users/components/user-list";
import { SharedUserDetails } from "@/features/users/components/user-detail";
import { SharedUserForm } from "@/features/users/components/user-form";

/** Administración global: una entrada explícita y su política SUPERADMIN. */
export function AdminUsersList() {
  const { data } = useCurrentUser();
  return <SharedUsersList policy={globalUserPolicy(data)} />;
}
export function AdminUserDetails({ id }: { id: string }) {
  const { data } = useCurrentUser();
  return <SharedUserDetails id={id} policy={globalUserPolicy(data)} />;
}
export function AdminUserForm() {
  const { data } = useCurrentUser();
  return <SharedUserForm policy={globalUserPolicy(data)} />;
}
