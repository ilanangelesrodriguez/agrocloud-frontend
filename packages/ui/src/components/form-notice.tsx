import { InlineNotice } from "./inline-notice";

type FormNoticeProps = {
  message?: string | null;
  success?: boolean;
  className?: string;
};

/** Errores persistentes de formulario; los toasts se reservan para confirmaciones breves. */
export function FormNotice({ message, success = false, className = "" }: FormNoticeProps) {
  if (!message) return null;

  return (
    <InlineNotice
      className={className}
      description={message}
      status={success ? "success" : "danger"}
      title={success ? "Operación completada" : "Revisa la información"}
    />
  );
}
