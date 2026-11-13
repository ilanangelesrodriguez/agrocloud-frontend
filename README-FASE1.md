# AgroCloud — Fase 1: limpieza, indentación y convenciones

**Ámbito:** `agrocloud-frontend`, rama `main` revisada el 13/11/2026. Este ZIP es un **parche incremental**, no una copia completa del repositorio. Mantiene las pantallas agrícolas, autenticación y pagos existentes.

## Qué cambia con el ZIP

1. `package.json` (raíz): incorpora los comandos `format:portal`, `format:portal:check`, `cleanup:portal:check` y `cleanup:portal:apply`, sin agregar dependencias.
2. `.github/workflows/ci.yml`: valida el formato del portal **antes** de lint, TypeScript y build.
3. `apps/portal/eslint.config.mjs`: se ordena e indenta el archivo de configuración, **sin cambiar las reglas de lint**.
4. `apps/portal/types/index.ts`: usa `import type` para un import que solo define un tipo.
5. `apps/portal/README.md` y `README.md` de raíz: corrigen el texto heredado de la plantilla que decía que no había módulos de negocio.
6. `docs/frontend-conventions.md`: reglas de carpetas, nombres, indentación, HeroUI y límites entre UI y negocio.
7. `scripts/phase1-cleanup.mjs`: eliminador **opcional**, limitado a archivos de demostración exactos. Solo borra al pasar `--apply` y verificar hashes de Git.

> El ZIP no sobrescribe módulos agrícolas, autenticación, facturación, clientes API ni estilos existentes. No incluye archivos de dependencias ni modifica `package-lock.json`.

## Qué archivos eliminar (SOLO de apps/portal)

Se confirmaron como archivos de la plantilla inicial en el estado revisado:

| Ruta relativa a `apps/portal/` | Motivo |
| --- | --- |
| `app/about/layout.tsx` | Layout de página “About” de la plantilla |
| `app/about/page.tsx` | Página “About” de muestra |
| `app/blog/layout.tsx` | Layout de “Blog” de muestra |
| `app/blog/page.tsx` | Página “Blog” de muestra |
| `app/docs/layout.tsx` | Layout de “Docs” de muestra, **no** la carpeta `docs/` del monorepo |
| `app/docs/page.tsx` | Página “Docs” de muestra |
| `app/pricing/layout.tsx` | Layout de “Pricing” de muestra, **no** `apps/web/app/planes` |
| `app/pricing/page.tsx` | Página “Pricing” de muestra |
| `components/navbar.tsx` | Navegación de la plantilla, con enlaces a HeroUI/Sponsor no usados por el portal |
| `components/counter.tsx` | Botón contador de ejemplo |
| `components/primitives.ts` | Funciones decorativas empleadas por las páginas de plantilla anteriores |
| `config/site.ts` | Navegación original de la plantilla, consumida por `components/navbar.tsx` |

**Cómo borrarlos con seguridad:** usa `npm run cleanup:portal:check` para simular y después `npm run cleanup:portal:apply`. El script verifica el hash Git de cada archivo. Si editaste alguno, **no lo borra**; en ese caso compara sus cambios antes de eliminarlo manualmente. Ninguna operación del script borra la carpeta `apps/web`.

**NO eliminar:** `components/icons.tsx`, `types/index.ts` ni `components/theme-switch.tsx` (hay dependencias entre ellos), `app/design-system`, `packages/ui`, `lib/auth`, `app/api`, `app/(auth)`, `app/(protected)`, archivos de configuración de fuentes y todos los módulos de `features/`.

## Instrucciones de aplicación (Windows / Codespaces / terminal)

**1. Crea una rama ANTES de colocar el ZIP.** Desde la raíz del repositorio:

```bash
git switch main
git pull
git switch -c refactor/portal-phase-1
```

Si tienes cambios sin confirmar, guárdalos primero en un commit o rama; evita mezclar trabajo de otras fases.

**2. Extrae el ZIP en la raíz del repositorio** (`agrocloud-frontend/`). Sobrescribe **solo** los archivos que trae el ZIP, manteniendo sus rutas. No pegues la carpeta `agrocloud_fase1_patch` dentro de `apps/portal`.

**3. Instala dependencias en la raíz** y revisa las eliminaciones **antes de formatear**:

```bash
npm ci
npm run cleanup:portal:check
npm run cleanup:portal:apply
```

> Importante: ejecuta la limpieza ANTES de Prettier. Si formateas primero, los hashes de los archivos heredados pueden cambiar y el script bloqueará su borrado, por seguridad.

**4. Normaliza indentación, JSX, comillas y saltos de línea del portal:**

```bash
npm run format:portal
```

Esto recorre `apps/portal` y sí modifica archivos `.ts`, `.tsx`, `.js`, `.mjs`, `.json`, `.css` y `.md` mediante la configuración Prettier **que ya estaba en el repositorio**: dos espacios, comillas dobles, ancho objetivo 100 y LF. No hace refactor de lógica ni cambia el comportamiento intencionadamente.

**5. Revisa los cambios y las advertencias de lint:**

```bash
npm run format:portal:check
npm run lint
npm run typecheck
npm run build
git diff --stat
git diff --check
```

Para intentar corregir advertencias autocorregibles de ESLint en el portal:

```bash
npm run lint:fix -w @agrocloud/portal
npm run format:portal
npm run lint
```

**No aceptes automáticamente correcciones de ESLint sin revisar `git diff`:** el formateo no garantiza resolver todos los avisos de imports, accesibilidad o hooks. Las advertencias no autocorregibles necesitan corrección manual. No silencies reglas de seguridad o accesibilidad para que pase CI.

**6. Comprueba manualmente:** login, cierre de sesión, navegación `/dashboard` y `/admin`, productores, lotes, muestreos, inspecciones, `/settings/subscription`, tema claro/oscuro y ambas galerías `/design-system`. Estas páginas deben comportarse como antes.

**7. Confirma y abre PR:**

```bash
git status --short
git add -A
git commit -m "refactor(portal): cleanup template and normalize formatting"
git push -u origin refactor/portal-phase-1
```

Si Git muestra archivos ajenos a la Fase 1, no uses `git add -A` hasta haberlos separado.

## ¿Qué NO se hace todavía?

- **Sin cambios de layout:** no se agrega sidebar, navbar corporativa, breadcrumbs ni responsive global (Fase 3).
- **Sin cambios de estructura de dominio:** no se mueven productores, lotes, inspecciones, usuarios, planes ni formularios (Fases 4 y 5).
- **Sin cambios de contratos HTTP:** no se cambia el BFF ni el API Gateway.
- **Sin nuevas dependencias:** HeroUI, React, Next.js y Prettier siguen en sus versiones actuales.
- **Sin prometer CI verde:** el ZIP se ha comprobado estructuralmente, pero debes ejecutar la instalación, Prettier, lint, TypeScript y build en el repositorio completo, porque este paquete es incremental.

## Cómo revertir si algo sale mal

Antes de confirmar el commit, usa `git diff` para identificar cambios y `git restore <ruta>` solo sobre los archivos que quieras recuperar. Para las páginas eliminadas, usa `git restore apps/portal/app/about apps/portal/app/blog apps/portal/app/docs apps/portal/app/pricing` (o los otros archivos concretos). Si ya confirmaste los cambios, crea un commit de reversión mediante `git revert <hash-del-commit>` en vez de borrar el historial compartido.

## Próxima fase

En la Fase 2 se normalizarán los componentes UI existentes en pantallas reales (`PageHeader`, `AgroPagination`, `EmptyState`, `StatusBadge`); en la Fase 3 se introducirá el `AppShell` con sidebar, topbar y responsive. Mantén esta Fase 1 como PR independiente para facilitar su revisión.
