<div align="center">

# 🌱 AgroCloud Frontend

**Portal agrícola y sitio público en un monorepo Next.js.**

Next.js 16 · React 19 · TypeScript · HeroUI v3 · Tailwind CSS 4 · **npm Workspaces** · Turborepo

[Arquitectura](docs/architecture.md) · [Desarrollo](docs/development.md) · [API](docs/api-integration.md) · [Despliegue](docs/deployment.md)

</div>

## Estructura

| Ruta | Responsabilidad |
| --- | --- |
| `apps/portal` | Operaciones agrícolas y administración autenticada. |
| `apps/web` | Sitio público y comercial. |
| `packages/ui` | Componentes y patrones visuales reutilizables. |
| `packages/api-client` | Cliente HTTP tipado para el API Gateway. |
| `packages/config` | Configuración compartida de TypeScript y lint. |
| `.github/workflows` | Verificaciones automáticas. |
| `docs` | Decisiones técnicas y guías operativas. |

## Requisitos

- Node.js 22 y npm 10 o superior.
- Para probar integración: AgroCloud API Gateway disponible.

## Instalación

```bash
npm install
npm run dev           # Portal: http://localhost:3000
npm run dev:web       # Web: http://localhost:3001
```

**Importante:** `npm install` se ejecuta **una sola vez desde la raíz** y genera `package-lock.json`. Agrégalo a Git; CI usa `npm ci`.

Verificación:

```bash
npm run lint
npm run typecheck
npm run build
```

## Integración con el backend

AgroCloud Frontend se conecta al [API Gateway](https://github.com/ilanangelesrodriguez/agrocloud-backend) que enruta solicitudes hacia Identity, Agricultural, Notifications, Billing y AI. El navegador no debe almacenar tokens ni credenciales de los microservicios. Consulta [Integración API](docs/api-integration.md).

## Estado

La base actual de `apps/portal` y `apps/web` parte de la plantilla HeroUI/Next.js. **Este paquete organiza infraestructura, automatización y paquetes compartidos; no implementa aún los módulos de negocio ni la autenticación real.**

## Documentación

Consulta [`docs/README.md`](docs/README.md) para el índice completo.
