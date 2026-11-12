# AgroCloud Web

Aplicación Next.js con HeroUI v3 dentro del monorepo AgroCloud.

- Carpeta: `apps/web`.
- Workspace: `@agrocloud/web`.
- Puerto local: `3001`.
- Dependencias: instaladas **desde la raíz** con `npm install`.

```bash
npm run dev -w @agrocloud/web
```

Documentación principal: [`../../README.md`](../../README.md).

Para el formulario empresarial, configura `AGROCLOUD_GATEWAY_URL` e
`IDENTITY_PRIVACY_VERSION` en `apps/web/.env.local`. La versión debe coincidir con la de
Identity y con la del aviso publicado. Si falta la versión, la web deja el formulario fuera
de servicio. Completa el aviso de privacidad antes de recibir solicitudes reales.

La consulta de RUC y el catálogo de planes pasan por el Gateway. Si Identity todavía no
tiene ofertas públicas vigentes, la página de planes muestra el acceso gratuito y un
aviso de que no hay ofertas empresariales publicadas.
