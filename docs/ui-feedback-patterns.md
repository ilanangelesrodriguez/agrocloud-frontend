# AgroCloud · Patrones de interfaz y retroalimentación

**Base:** HeroUI v3, Tailwind CSS 4, Motion 14, Instrument Sans y Geist Mono. Los tokens de marca originales siguen en `packages/ui/src/styles/tokens.css`.

## Uso de componentes

| Componente | Cuándo usarlo | Regla |
| --- | --- | --- |
| `Typography` | Títulos, descripciones y texto de ayuda | Jerarquía semántica H1 → H2 → H3. |
| `Toast` | Confirmación o error temporal de una operación | Aparece abajo a la derecha; máximo 3. Solo mostrar éxito después de respuesta real positiva. |
| `Spinner` | Guardados, validaciones y acciones breves | Bloquear múltiples envíos mientras se procesa. |
| `Skeleton` | Carga de tablas, fichas y paneles | Mantener la forma del contenido; no animar con movimiento reducido. |
| `Chip` | Estado de lotes, evidencias, dictámenes | Usar `StatusBadge` y tonos semánticos; acompañar con texto. |
| `Card` | Grupos e indicadores | Para métricas usar `MetricCard`; tablas largas siguen siendo tablas. |
| `Alert` | Aviso persistente contextual | `InlineNotice`; mantenerlo visible mientras la condición exista. |
| `AlertDialog` | Cancelar o realizar una acción sensible | Explicar consecuencias; confirmar explícitamente; nunca confundir con Modal de formulario. |

## Componentes propios

- `StatusBadge`: unifica estados (`neutral`, `success`, `warning`, `danger`, `info`) sobre HeroUI `Chip`.
- `LoadingState`: muestra Spinner o Skeleton.
- `MetricCard`: tarjeta de métricas, cifras tabulares.
- `InlineNotice`: Alert accesible para advertencias persistentes.
- `PageHeader` y `EmptyState` permanecen disponibles.

## Proveedores

En cada app, `app/providers.tsx` monta un **solo** `ThemeProvider`, `MotionConfig reducedMotion="user"` y `Toast.Provider placement="bottom end" maxVisibleToasts={3}`.

Para resultados de acciones reales:

```tsx
import { toast } from "@heroui/react";

try {
  await api.save(payload);
  toast.success("Registro guardado");
} catch {
  toast.danger("No se pudo guardar el registro");
}
```

El código anterior es ilustrativo; `api.save` representa tu servicio real, que todavía debes implementar.

## Seguridad y accesibilidad

- No mostrar un Toast de éxito antes de confirmar la operación en el backend.
- La vista `/design-system` contiene exclusivamente datos simulados y lo indica explícitamente.
- En un `AlertDialog` crítico, mantener el diálogo abierto y las acciones bloqueadas durante una solicitud pendiente.
- Probar `Tab`, retorno del foco, temas claro/oscuro, resolución móvil y preferencia de movimiento reducido.
- En módulos nuevos, manejar `401`, `403`, `409`, `422`, `429` y fallos de red con mensajes comprensibles y sin revelar información privada.

## Documentación oficial

- https://heroui.com/en/docs/react/components/toast
- https://heroui.com/en/docs/react/components/spinner
- https://heroui.com/en/docs/react/components/skeleton
- https://heroui.com/en/docs/react/components/chip
- https://heroui.com/en/docs/react/components/card
- https://heroui.com/en/docs/react/components/alert
- https://heroui.com/en/docs/react/components/alert-dialog
- https://heroui.com/en/docs/react/components/typography
- https://motion.dev/docs/react-motion-config
