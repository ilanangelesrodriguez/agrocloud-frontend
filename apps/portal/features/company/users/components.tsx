"use client";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { tenantUserPolicy } from "@/features/users/policy";
import { SharedUsersList } from "@/features/users/components/user-list";
import { SharedUserDetails } from "@/features/users/components/user-detail";
import { SharedUserForm } from "@/features/users/components/user-form";

/** Portal empresarial: solo permisos del tenant, sin administración global. */
export function CompanyUsersList() {
  const { data } = useCurrentUser();
  return <SharedUsersList policy={tenantUserPolicy(data)} />;
}
export function CompanyUserDetails({ id }: { id: string }) {
  const { data } = useCurrentUser();
  return <SharedUserDetails id={id} policy={tenantUserPolicy(data)} />;
}
export function CompanyUserForm() {
  const { data } = useCurrentUser();
  return <SharedUserForm policy={tenantUserPolicy(data)} />;
}
