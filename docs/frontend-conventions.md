# Convenciones de frontend — AgroCloud

Estas convenciones se aplican en `apps/portal` y se adoptan progresivamente, sin alterar la API del backend.

## Formato y nombres

- Usar **dos espacios**, UTF-8, LF, comillas dobles, punto y coma y ancho máximo objetivo de 100 caracteres.
- Prettier es la fuente de verdad para el formato. Evitar JSX comprimido en una sola línea si contiene múltiples nodos.
- Nombrar archivos de componentes, hooks y utilidades en **kebab-case** (`producer-form.tsx`, `use-producers.ts`).
- Componentes React y tipos: **PascalCase**; variables, funciones y hooks: **camelCase**; constantes inmutables globales: nombres expresivos.
- Usar `import type` para tipos puros; separar imports de paquetes, alias `@/` e imports relativos. Dejar que ESLint guíe el orden final.
- Evitar imports sin usar, código comentado muerto y funciones demasiado grandes. No solucionar advertencias ocultándolas indiscriminadamente.

## Responsabilidades

| Ubicación | Debe contener | No debe contener |
| --- | --- | --- |
| `app/` | `page.tsx`, `layout.tsx`, `loading.tsx`, rutas BFF en `api/` | Formularios y consultas enormes acopladas a páginas |
| `features/<dominio>/components` | Interfaz ligada al dominio | Clientes HTTP genéricos para todo el sistema |
| `features/<dominio>/hooks` | TanStack Query, mutaciones y hooks de dominio | Comportamiento de otros dominios sin abstracción |
| `features/<dominio>/schema.ts` | Validación Zod del dominio | Copias incompatibles de contratos compartidos |
| `lib/api` | Transporte y errores reutilizables | Componentes de presentación |
| `packages/ui` | Patrones visuales reutilizables sin negocio | Llamadas a Identity, Agricultural, Billing ni acceso a sesiones |
| `design-system` | Demostraciones visuales con datos ficticios | Pantallas operativas o fuentes de verdad del negocio |

## HeroUI v3

- Respetar las APIs de la versión instalada y sus componentes accesibles (`Form`, `Input`, `Table`, `Modal`, `Sheet`, etc.).
- Priorizar componentes de HeroUI y los componentes compartidos de `@agrocloud/ui` frente a controles nativos custom.
- No introducir una segunda biblioteca de UI para resolver componentes que HeroUI ya ofrece.
- Incluir estados de carga, error, sin registros, sin permisos y operación completada cuando correspondan.
- No mostrar porcentajes inventados para procesos de duración desconocida; usar un estado indeterminado.

## Seguridad y calidad

- El navegador debe hablar con el BFF, no con microservicios privados ni secretos.
- Los permisos de UI mejoran navegación, pero **la autorización real se mantiene en el servidor/backend**.
- Mantener rutas actuales de negocio hasta las fases posteriores; no refactorizar y cambiar endpoints a la vez.
- Probar cada módulo tanto en pantallas pequeñas como grandes y con teclado.
- Ejecutar antes de cada PR: `npm run format:portal:check`, `npm run lint`, `npm run typecheck`, `npm run build`.
- Si el formateo modifica decenas de archivos, separarlo en un commit propio para que futuros PRs sean fáciles de revisar.

## Límites de la Fase 1

Esta fase cubre limpieza de plantilla, formato, configuración y convenciones. **No** implementa el nuevo sidebar, layouts, servicios por dominio, ni rehace páginas de negocio. Esos cambios se harán en fases posteriores.
