# Diseño UI

**Stack:** HeroUI v3, Tailwind CSS 4 y React 19.

Las plantillas actuales ya importan correctamente en `styles/globals.css`:

```css
@import "tailwindcss";
@import "@heroui/styles";
```

## Convenciones

- Componentes HeroUI directos para formularios, menús, diálogos y controles.
- `packages/ui`: patrones propios compartidos (`PageHeader`, `EmptyState`, `StatusBadge`).
- `apps/portal/features/<módulo>/components`: componentes de negocio específicos.
- Diseñar estados de carga, error, vacío, éxito y sin permisos por pantalla.
- Respetar navegación por teclado, contraste suficiente y responsive.
- Usar la API de componentes **v3**, no copiar ejemplos de HeroUI v2.

## Vistas del flujo agrícola

El flujo operativo usa páginas completas: listado y alta de lotes, detalle del lote,
recepción (`/lots/[id]/reception`), registro de muestreo (`/lots/[id]/sampling`),
detalle de muestra (`/samplings/[id]`), inspección (`/inspections/[id]`) y evidencias
(`/inspections/[id]/evidences`). Los drawers quedan para operaciones breves fuera
de este flujo. Cada vista mantiene un encabezado, contexto del registro, navegación
de regreso, permisos y estados de carga, error y ausencia de datos.

`OperationNavigation` comparte la navegación entre muestra, inspección y evidencias.
Solo enlaza relaciones conocidas y acciones consultables por la cuenta actual.
El resumen del lote no deduce inspecciones ni evidencias de su estado: se accede a
ellas a través del muestreo correspondiente.

`ErrorState`, exportado por `@agrocloud/ui`, es el patrón genérico para errores de
API, conexión, carga de imágenes y otros fallos. Acepta `error: unknown`, título y
descripción opcionales, `retry`, acciones adicionales y `size="page" | "compact"`.
La variante de página reserva al menos 24 rem, igual que el skeleton compartido;
la compacta reserva 12 rem. Los reintentos asíncronos muestran estado ocupado.
El BFF conserva el estado HTTP mediante `ApiError` para distinguir sesión, permisos,
registro inexistente y exceso de solicitudes. Las rutas operativas cuentan además
con un límite de error de React que permite reintentar o volver a los lotes.

## Identidad visual

En pantallas pequeñas la barra muestra el emblema de AgroCloud. Desde el breakpoint `md` usa el logotipo completo con la variante del tema activo. El favicon y el icono de iOS proceden del AgroCloud original.

El portal y la web importan los tokens de `packages/ui/src/styles/tokens.css` después de Tailwind y HeroUI. El tema inicial sigue al sistema operativo. El botón de sol y luna alterna entre Claro y Oscuro y guarda la selección en el navegador.

| Uso | Claro | Oscuro |
| --- | --- | --- |
| Fondo | `#F7FAF8` | `#0F172A` |
| Tarjetas y modales | `#FFFFFF` | `#162437` |
| Superficie secundaria | `#F1F6F2` | `#1D3140` |
| Texto principal | `#172923` | `#EAF4EF` |
| Texto secundario | `#556B62` | `#A9C0B7` |
| Acción principal | `#146F47` | `#45C987` |
| Bordes | `#E0EAE3` | `#304257` |

Usa `accent` para acciones y `success`, `warning`, `danger` e `info` para estados. Acompaña cada estado con un texto que indique su significado. Usa Instrument Sans en la interfaz, Geist Mono en identificadores técnicos y `tabular-nums` para alinear cifras.

| Elemento | Medida |
| --- | --- |
| Título de página | 28–30 px |
| Título de sección | 20–24 px |
| Título de tarjeta | 16–18 px |
| Texto de interfaz | 14–16 px |
| Texto de tabla | 13–14 px |
| Separación entre secciones | 24–32 px |
| Relleno de tarjetas | 20–24 px |
| Botones e inputs | 40–44 px |
| Filas de tabla | 48–56 px |
| Radios de controles, tarjetas y diálogos | 12, 16 y 20 px |
| Sidebar expandido y reducido | 264 y 76 px |

Abre `/design-system` en el portal para revisar los temas, los estados de la tabla, el campo y el diálogo. Recorre los controles con Tab y verifica que Escape cierre el diálogo y devuelva el foco a «Nuevo lote».

Para integrar Motion, instala la dependencia desde la raíz con `npm install motion -w @agrocloud/portal -w @agrocloud/web`. Después importa `MotionConfig` desde `motion/react` y envuelve los hijos de cada proveedor con `<MotionConfig reducedMotion="user">`.

[Documentación de temas de HeroUI](https://heroui.com/en/docs/react/getting-started/theming) · [MotionConfig](https://motion.dev/docs/react-motion-config)
