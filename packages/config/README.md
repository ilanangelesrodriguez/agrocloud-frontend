# @agrocloud/config

Configuraciones compartidas para evitar divergencia entre aplicaciones.

- `typescript/base.json`: reglas TypeScript generales.
- `typescript/next.json`: extensión para Next.js.
- `eslint/rules.mjs`: reglas comunes para incorporar progresivamente.

Las aplicaciones existentes mantienen sus archivos `tsconfig.json` y `eslint.config.mjs` hasta su adopción controlada. No se fuerza una migración automática.
