import type { NextRequest } from "next/server";
import { z } from "zod";
import { authorizedIdentity } from "@/lib/auth/authorized-identity";
import { identityUserSchema } from "@/lib/auth/schemas";
import { isAllowedOrigin, reply } from "@/lib/auth/route-utils";

export const runtime = "nodejs";
const userResponse = z.object({ data: identityUserSchema });

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return reply({ message: "Origen no permitido." }, 403);
  if (Number(request.headers.get("content-length") || "0") > 2_500_000) return reply({ message: "Archivo demasiado grande." }, 413);
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data")) return reply({ message: "Solo imágenes." }, 415);
  try {
    const fields = await request.formData();
    const photo = fields.get("avatar");
    if (!(photo instanceof File) || photo.size === 0 || photo.size > 2 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
      return reply({ message: "Selecciona JPG, PNG o WebP de hasta 2 MB." }, 422);
    }
    const upload = new FormData();
    upload.append("avatar", photo, photo.name);
    return authorizedIdentity(request, () => "/auth/me/avatar", userResponse, {
      method: "POST", body: upload, operation: "profile.avatar.upload",
    });
  } catch {
    return reply({ message: "No se pudo leer la imagen." }, 400);
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAllowedOrigin(request)) return reply({ message: "Origen no permitido." }, 403);
  return authorizedIdentity(request, () => "/auth/me/avatar", z.object({ deleted: z.literal(true) }), {
    method: "DELETE", operation: "profile.avatar.remove",
  });
}
