# @agrocloud/api-client

Cliente HTTP tipado y reutilizable para **AgroCloud API Gateway**. No se conecta a las URLs privadas de microservicios.

```ts
import { createApiClient } from "@agrocloud/api-client";

// Crear en código del servidor Next.js, usando sesión segura.
const client = createApiClient({
  baseUrl: process.env.AGROCLOUD_GATEWAY_URL!,
  getAccessToken: async () => /* token del servidor */ null,
});

const lots = await client.get<unknown>("/api/v1/agricultural/lots");
```

El cliente deja el cuerpo de `POST`/`PATCH` bajo control de `RequestInit` (usa `JSON.stringify()` y `Content-Type` adecuados). Las peticiones multipart usan `FormData` sin establecer `Content-Type` manualmente.

El ejemplo es ilustrativo: falta implementar el mecanismo de sesión BFF, autorización y refresh antes de su uso real. Las estructuras de respuestas pueden variar entre endpoints; valida el OpenAPI agregado.
