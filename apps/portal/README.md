# AgroCloud Portal

Aplicación Next.js 16 con React 19 y HeroUI v3 en el monorepo de AgroCloud.

- Carpeta: `apps/portal`.
- Workspace: `@agrocloud/portal`.
- Puerto local: `3000`.
- Instalación: desde la raíz, `npm ci` (o `npm install` si actualizas dependencias).
- Autenticación: sesión mediante BFF de Next.js (`app/api`) y servicios del Gateway.
- Pantallas existentes: administración global y empresarial, planes y operaciones agrícolas.

```bash
npm run dev:portal
```

**Fase 1 (limpieza e indentación):** sigue el [`README-FASE1.md`](../../README-FASE1.md) de la raíz. Allí se detallan las rutas de plantilla que pueden eliminarse y los comandos de formato.

Convenciones técnicas: [`docs/frontend-conventions.md`](../../docs/frontend-conventions.md). La galería `/design-system` es una herramienta de desarrollo, no la carpeta donde deben implementarse los módulos de negocio.
