# Desarrollo local

## Requisitos

Node.js 22, npm 10+. Un solo `package-lock.json` en la raíz.

## Migración inicial desde las dos plantillas

1. Extrae el ZIP **en la raíz del repositorio** `agrocloud-frontend`.
2. Conserva el código existente de `apps/portal` y `apps/web` (esta entrega actualiza solo sus manifiestos, configuraciones Next y README).
3. Elimina `apps/portal/pnpm-workspace.yaml` y `apps/web/pnpm-workspace.yaml` (archivos heredados de la plantilla, no usados por npm).
4. Si existen `node_modules/`, `package-lock.json` individuales o `pnpm-lock.yaml` dentro de las apps, elimínalos antes de instalar, sin tocar el código fuente.
5. Ejecuta en la raíz `npm install`. Agrega el `package-lock.json` **raíz** al repositorio.

No se incluye `package-lock.json`: solo npm con acceso al registro puede resolver de forma fiable las versiones y generar el lockfile de este proyecto.

## Comandos

```bash
npm install
npm run dev           # portal localhost:3000
npm run dev:web       # web localhost:3001
npm run dev:all       # ambas aplicaciones
npm run lint
npm run typecheck
npm run build
```

Para trabajar en un workspace:

```bash
npm run dev -w @agrocloud/portal
npm run typecheck -w @agrocloud/api-client
```

## Variables de entorno

Copia `apps/portal/.env.example` a `apps/portal/.env.local` y ajusta `AGROCLOUD_GATEWAY_URL` para requests ejecutados en el servidor Next.js. No antepongas `NEXT_PUBLIC_` a secretos o URLs privadas de infraestructura.

## Consideraciones

- `apps/portal` y `apps/web` todavía contienen vistas y textos de ejemplo de HeroUI.
- `apps/web` usa el puerto 3001 para evitar colisión con el portal.
- No ejecutar `npm install` por separado en cada app: mantén un lockfile único.
- GitHub Actions ejecuta `npm ci`, por lo que el lockfile raíz debe estar versionado.
