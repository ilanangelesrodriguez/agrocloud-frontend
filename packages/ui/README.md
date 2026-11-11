# @agrocloud/ui

Componentes de presentación propios del producto; **no reemplazan a HeroUI**.

```tsx
import { PageHeader, EmptyState } from "@agrocloud/ui";
```

Se incluyen `PageHeader`, `EmptyState` y `StatusBadge`. Componentes específicos de lotes, inspecciones y usuarios deben permanecer en `apps/portal/features/` cuando esos módulos se implementen.

Las apps importan `@heroui/styles` en su CSS global. Next.js transpila este workspace desde `next.config.mjs`.
