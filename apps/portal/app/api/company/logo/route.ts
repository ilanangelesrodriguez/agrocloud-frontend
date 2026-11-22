import type { NextRequest } from "next/server";
import { z } from "zod";
import { authorizedIdentity } from "@/lib/auth/authorized-identity";
import { companyResponseSchema } from "@/features/company/profile/schema";
import { canManageCompany } from "@/features/company/navigation";
import { isAllowedOrigin, reply } from "@/lib/auth/route-utils";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return reply({ message: "Origen no permitido." }, 403);
  if (Number(request.headers.get("content-length") || "0") > 4_600_000)
    return reply({ message: "Archivo demasiado grande." }, 413);
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data"))
    return reply({ message: "Solo imágenes." }, 415);
  try {
    const input = await request.formData();
    const logo = input.get("logo");
    if (
      !(logo instanceof File) ||
      logo.size === 0 ||
      logo.size > 4 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp"].includes(logo.type)
    ) {
      return reply({ message: "Selecciona JPG, PNG o WebP de hasta 4 MB." }, 422);
    }
    const body = new FormData();
    body.append("logo", logo, logo.name);
    return authorizedIdentity(
      request,
      (user) =>
        user.id_empresa && canManageCompany(user, "empresa.editar")
          ? "/companies/" + user.id_empresa + "/logo"
          : null,
      companyResponseSchema,
      { method: "POST", body, operation: "company.logo.upload" },
    );
  } catch {
    return reply({ message: "No se pudo leer el logo." }, 400);
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAllowedOrigin(request)) return reply({ message: "Origen no permitido." }, 403);
  return authorizedIdentity(
    request,
    (user) =>
      user.id_empresa && canManageCompany(user, "empresa.editar")
        ? "/companies/" + user.id_empresa + "/logo"
        : null,
    z.object({ deleted: z.literal(true) }),
    { method: "DELETE", operation: "company.logo.delete" },
  );
}
