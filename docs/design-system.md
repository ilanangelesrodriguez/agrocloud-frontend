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
