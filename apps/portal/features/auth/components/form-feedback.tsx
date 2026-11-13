import { FormNotice } from "@agrocloud/ui";

/** Adaptador para conservar los formularios de autenticación existentes. */
export function FormFeedback({
  message,
  success = false,
}: {
  message?: string | null;
  success?: boolean;
}) {
  return <FormNotice className="my-4" message={message} success={success} />;
}
