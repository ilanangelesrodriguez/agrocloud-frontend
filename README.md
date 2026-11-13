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
| `packages/api-client` | Cliente HTTP y tipos para el API Gateway. |
| `packages/config` | Configuración compartida de TypeScript y lint. |
| `.github/workflows` | Verificaciones automáticas. |
| `docs` | Decisiones técnicas y guías operativas. |

## Requisitos

- Node.js 22 y npm 10 o superior.
- Para probar integración: AgroCloud API Gateway disponible.

## Instalación

```bash
npm ci
npm run dev           # Portal: http://localhost:3000
npm run dev:web       # Web: http://localhost:3001
```

**Importante:** las dependencias se instalan una sola vez desde la raíz, donde está `package-lock.json`. Usa `npm install` si necesitas cambiar dependencias; CI utiliza `npm ci`.

Verificación:

```bash
npm run format:portal:check
npm run lint
npm run typecheck
npm run build
```

## Integración con el backend

AgroCloud Frontend se conecta al [API Gateway](https://github.com/ilanangelesrodriguez/agrocloud-backend), que enruta hacia Identity, Agricultural, Notifications, Billing y AI. El navegador no debe almacenar tokens ni credenciales de los microservicios. Consulta [Integración API](docs/api-integration.md).

## Estado

`apps/portal` ya incluye rutas y pantallas para autenticación, administración de empresas y usuarios, ofertas/suscripciones y procesos agrícolas, aunque varios módulos continúan en evolución. La reorganización visual y de carpetas se planifica por fases; no deben confundirse las galerías del design system con pantallas de producción.

## Reestructuración gradual

- [Fase 1 — Limpieza, indentación y convenciones](README-FASE1.md)
- [Convenciones de frontend](docs/frontend-conventions.md)
- [Biblioteca visual y temas](docs/design-system.md)

La Fase 1 no modifica los contratos HTTP ni el flujo de negocio.

## Documentación

Consulta [`docs/README.md`](docs/README.md) para el índice completo.
