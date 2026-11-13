# Fase 3: Layout y navegación responsive del Portal AgroCloud

## Qué cambia

- Todas las rutas protegidas comparten AppShell, AppSidebar y AppTopbar.
- El menú se deriva del usuario autenticado y sus permisos; no hay rutas ficticias.
- La navegación de plataforma aparece exclusivamente para SUPERADMIN.
- Configuración conserva su protección; el sidebar secundario antiguo se retira.
- En móvil se utiliza Sheet de HeroUI v3; en escritorio se puede reducir la barra lateral.
- Las preferencias del sidebar se guardan solo en localStorage, nunca tokens o secretos.
- Los breadcrumbs no incluyen enlaces hacia índices inexistentes de muestreos o inspecciones.
- Se conserva AuthGate, AdminGate, el BFF, el catálogo HeroUI y las pantallas de negocio.

## Archivos obsoletos

Se retiran `features/auth/components/portal-header.tsx` y
`features/admin/components/admin-navigation.tsx`. Sus funciones se sustituyen
por AppTopbar/UserMenu y AppSidebar, respectivamente. No elimines otros archivos.

## Diseño responsive

| Pantalla | Interacción |
| --- | --- |
| Móvil (< 1024 px) | Sheet lateral que se cierra al elegir una ruta, soporte Escape/foco |
| Escritorio (>= 1024 px) | Sidebar sticky con ancho 264 px o 76 px |
| Todas | Breadcrumbs, tema claro/oscuro, menú de usuario y contenido min-w-0 |

## Permisos

El frontend filtra enlaces mediante `permissions` e `id_empresa` de Identity.
Las comprobaciones en los Route Handlers / backend son la autoridad:
ocultar un enlace **no equivale a autorizar una petición**.

## Pruebas antes de fusionar

1. Ejecutar `npm ci && npm run format:check && npm run lint && npm run typecheck && npm run build`.
2. Iniciar sesión como SUPERADMIN y verificar que solo muestra Plataforma y Mi perfil.
3. Iniciar como usuario de empresa con permisos limitados: no deben aparecer enlaces no autorizados.
4. Comprobar la ruta directa `/admin` como usuario normal: AdminGate debe bloquearla.
5. Abrir Sheet en móvil, navegar, cerrarlo con Escape y verificar el foco.
6. Probar reducción del sidebar y persistencia tras recarga en escritorio.
7. Verificar breadcrumbs en `/lots/1`, `/producers/1/edit`, `/admin/plans/new`,
   `/samplings/1` y `/settings/profile`.
8. Confirmar que logout elimina la sesión y vuelve al login; si la red falla muestra toast.
9. Revisar modo claro/oscuro, 320 px, 375 px, 768 px, 1024 px y 1440 px.
10. No desplegar sin revisar la CI y los permisos del backend.

Notas: La fase no agrega una bandeja de notificaciones inexistente ni modifica
las reglas de negocio, las cuotas y los cobros.
