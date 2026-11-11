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

Usar tonos agrícolas moderados, superficies neutras y colores semánticos consistentes. Centralizar decisiones de marca en tokens de tema cuando se definan; no codificar colores aislados por módulo.

Referencia: https://heroui.com/en/docs/react/components
