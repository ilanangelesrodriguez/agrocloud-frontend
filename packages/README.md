# Paquetes compartidos

| Paquete | Función | Estado |
| --- | --- | --- |
| `@agrocloud/ui` | Componentes de presentación propios. | Base disponible |
| `@agrocloud/api-client` | HTTP y errores para Gateway. | Base disponible |
| `@agrocloud/config` | Reglas reutilizables. | Base disponible |

Las aplicaciones consumen los paquetes mediante **npm Workspaces**. No hagas `npm install` dentro de cada paquete: ejecuta `npm install` en la raíz.

No crear paquetes `types`, `validations` o `utils` hasta que haya reutilización real. Los contratos TypeScript de la API deberán generarse a partir de OpenAPI.
