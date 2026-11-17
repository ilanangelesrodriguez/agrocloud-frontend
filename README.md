<div align="center">

# 🌱 AgroCloud Frontend

**Portal agrícola y sitio público en un monorepo Next.js.**

Next.js 16 · React 19 · TypeScript · HeroUI v3 · Tailwind CSS 4 · **npm Workspaces** · Turborepo

[Arquitectura](docs/architecture.md) · [Desarrollo](docs/development.md) · [API](docs/api-integration.md) · [Despliegue](docs/deployment.md)

</div>

## Estructura

| Ruta | Responsabilidad |
| --- | --- |
| `apps/portal` | Aplicación principal con sitio público, autenticación y plataforma agrícola. |
| `apps/web` | Referencia de la aplicación pública anterior durante la validación de la migración. |
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
npm run dev           # Aplicación unificada: http://localhost:3000
```

**Importante:** las dependencias se instalan una sola vez desde la raíz, donde está `package-lock.json`. Usa `npm install` si necesitas cambiar dependencias; CI utiliza `npm ci`.

La landing se encuentra en `/`, el inicio de sesión en `/login` y la entrada con
verificación de sesión en `/portal`. Las rutas públicas pertenecen a
`app/(marketing)`, las de acceso a `app/(auth)` y las privadas a
`app/(protected)`. El código público se distribuye por responsabilidad en
`apps/portal/components/marketing`, `apps/portal/features/marketing`,
`apps/portal/lib/marketing` y `apps/portal/config/marketing`.

Los formularios del Portal usan `components/date-input.tsx` para fechas y horas
con HeroUI. La paginación compartida aparece solo cuando hay más de una página.
Las invitaciones se pueden completar desde el drawer del listado de usuarios;
los errores de las mutaciones se notifican desde el proveedor de consultas,
salvo los flujos que presentan su propio toast.

Configura las variables públicas y de privacidad en `apps/portal/.env.local`,
tomando como referencia `apps/portal/.env.example`. El sitio y el portal comparten
el mismo origen. Los comandos raíz de desarrollo, lint, tipos y build trabajan con
la aplicación unificada. `apps/web` permanece como referencia hasta completar la
validación de navegación, solicitudes, autenticación y operaciones agrícolas.

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
