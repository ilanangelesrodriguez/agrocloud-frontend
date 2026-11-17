# Despliegue

## Frontend: Vercel

El despliegue unificado usa un proyecto Vercel:

| Proyecto | Root Directory | Uso |
| --- | --- | --- |
| AgroCloud | `apps/portal` | Sitio público, autenticación y plataforma agrícola |

Vercel debe detectar Next.js; comprobar que el proyecto reconoce el workspace npm y ejecuta la instalación desde el monorepo. Conservar `package-lock.json` en la raíz. No fijar un directorio de salida manual para Next.js.

Para reducir la construcción por workspace, usar los filtros de Turborepo o la detección de monorepo de Vercel conforme a la configuración elegida.

## Variables de entorno

- `AGROCLOUD_GATEWAY_URL`: URL del Gateway en el servidor del portal; no debe ser un secreto mostrado por `NEXT_PUBLIC_*`.
- `NEXT_PUBLIC_SITE_URL`: URL canónica del despliegue unificado, utilizada para SEO y validación de origen.
- `IDENTITY_PRIVACY_VERSION`: versión del aviso publicado, coincidente con Identity.
- `AGROCLOUD_PUBLIC_ONBOARDING_ENABLED`: habilitación del formulario empresarial.

El proyecto anterior con raíz `apps/web` puede mantenerse durante la validación
de la migración. Apunta el dominio público al proyecto unificado cuando completes
las comprobaciones de landing, solicitud, login, sesión, suscripciones y operaciones
agrícolas. Las rutas de autenticación y las áreas privadas declaran `noindex`.

Configurar entornos Preview y Production por separado. En el API Gateway configurar CORS si corresponde a los flujos navegador-servidor; no asumir que CORS sustituye la autorización.

## CI

`.github/workflows/ci.yml` valida lint, TypeScript y build con `npm ci`. Es obligatorio subir el `package-lock.json` de la raíz antes del primer CI exitoso.

## Backend

Los microservicios continúan desplegados independientemente en Google Cloud Run. No moverlos a Vercel solo por adoptar Next.js.
