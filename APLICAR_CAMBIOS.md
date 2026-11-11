# Aplicar ZIP · AgroCloud Advanced UI

Este archivo es un **parche aditivo** para `ilanangelesrodriguez/agrocloud-frontend` (rama `main` revisada el 11/11/2026). No incluye `node_modules` ni `package-lock.json` porque **no cambia dependencias**.

## Instrucciones

1. Guarda o confirma tus cambios locales (`git status`).
2. Descomprime el ZIP **dentro de la raíz** del repositorio `agrocloud-frontend/`.
3. Acepta **reemplazar solo** los archivos incluidos en el ZIP: `packages/ui/src/index.ts` y `apps/{portal,web}/styles/globals.css`. Los restantes se crean sin sustituir archivos previos.
4. En PowerShell, en la raíz:

```powershell
npm install
npm run lint
npm run typecheck
npm run build
npm run dev:portal
```

5. Abre `http://localhost:3000/design-system/advanced` y comprueba interacción en móvil, modo claro/oscuro, tabulador y Escape.

> Las demostraciones usan registros ficticios y **no llaman al Gateway**. El parche no modifica autenticación, rutas del negocio ni microservicios.

## Añade

- `AgroScrollArea` → ScrollShadow con `hideScrollBar` y clase `agro-scroll-area`.
- `AgroPagination` → Pagination HeroUI controlada, con resumen y anterior/siguiente.
- `QuotaMeter` → cupos empresariales con colores de advertencia.
- `apps/portal/app/design-system/layout.tsx` → navegación entre galerías.
- `apps/portal/app/design-system/advanced/` → demostraciones temáticas de más de 25 componentes HeroUI v3.
- `docs/ui-advanced-patterns.md` → criterios y recomendaciones.

## Importante

- No ocultar scroll de toda la página: la clase aplica solo a contenedores que realmente desplazan contenido.
- Se validó la sintaxis de los archivos TSX generados, pero **no pudo ejecutarse npm ci/build completo** por falta de acceso al registro de paquetes desde el entorno de preparación.
- Si el CI informa incompatibilidad de tipos, usa la documentación v3.2.7 de HeroUI antes de cambiar versiones.
- No mezclar ejemplos de HeroUI v2 con esta galería.
