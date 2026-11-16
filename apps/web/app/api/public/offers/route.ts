import { publicOffersSchema } from "@/features/plans/schema";
import { publicReply, requestIdentity } from "@/lib/api/public-gateway";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await requestIdentity("/public/offers");

    if (!response || response.status === 503) {
      return publicReply({ message: "El catálogo está temporalmente indisponible." }, 503);
    }
    if (response.status === 429) {
      return publicReply({ message: "Alcanzaste el límite de consultas. Intenta más tarde." }, 429);
    }
    if (response.ok) {
      const result = publicOffersSchema.safeParse(await response.json());

      if (result.success) return publicReply(result.data);
    }
  } catch {
    // Se devuelve un mensaje público sin detalles de la infraestructura.
  }

  return publicReply({ message: "No se pudieron cargar los planes en este momento." }, 502);
}
