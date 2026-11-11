# Despliegue

## Frontend: Vercel

Crear dos proyectos Vercel apuntando al **mismo repositorio**:

| Proyecto | Root Directory | Uso |
| --- | --- | --- |
| AgroCloud Portal | `apps/portal` | Portal autenticado |
| AgroCloud Web | `apps/web` | Sitio público |

Vercel debe detectar Next.js; comprobar que el proyecto reconoce el workspace npm y ejecuta la instalación desde el monorepo. Conservar `package-lock.json` en la raíz. No fijar un directorio de salida manual para Next.js.

Para reducir la construcción por workspace, usar los filtros de Turborepo o la detección de monorepo de Vercel conforme a la configuración elegida.

## Variables de entorno

- `AGROCLOUD_GATEWAY_URL`: URL del Gateway en el servidor del portal; no debe ser un secreto mostrado por `NEXT_PUBLIC_*`.
- `NEXT_PUBLIC_APP_URL`: URL pública del portal (sin credenciales).

Configurar entornos Preview y Production por separado. En el API Gateway configurar CORS si corresponde a los flujos navegador-servidor; no asumir que CORS sustituye la autorización.

## CI

`.github/workflows/ci.yml` valida lint, TypeScript y build con `npm ci`. Es obligatorio subir el `package-lock.json` de la raíz antes del primer CI exitoso.

## Backend

Los microservicios continúan desplegados independientemente en Google Cloud Run. No moverlos a Vercel solo por adoptar Next.js.
