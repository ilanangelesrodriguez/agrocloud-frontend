# Integración API

## Punto de entrada

El frontend utiliza el [Gateway de AgroCloud](https://github.com/ilanangelesrodriguez/agrocloud-backend), no las URLs privadas de cada microservicio.

En local: `http://localhost:4000` (ajustable). Contrato agregado: `GET /openapi.json`; documentación: `GET /docs`.

| Dominio | Prefijo de ejemplo |
| --- | --- |
| Identity | `/api/v1/identity` |
| Agricultural | `/api/v1/agricultural` |
| Notifications | `/api/v1/notifications` |

Verifica la especificación agregada antes de integrar cada endpoint. Los contratos de Billing/AI expuestos al navegador deben ser una lista explícita de operaciones autorizadas.

## Estrategia recomendada

1. Consumir OpenAPI generado desde Gateway y crear tipos.
2. Crear una sesión servidor/BFF en Next.js (cookies HttpOnly y Secure en producción).
3. Adjuntar el JWT de usuario desde el servidor; no persistirlo en localStorage.
4. Manejar `401`, `403`, `422`, `429`, `5xx` y `204` de manera diferenciada.
5. No asumir que todas las respuestas ya usan el mismo envelope; revisar el contrato de cada operación.
6. Permisos, empresas y cupos: siempre validar en backend además de la UI.

## Seguridad pendiente antes de usuarios reales

La documentación de Gateway advierte que algunas rutas de Billing y AI requieren allowlist/validación adicional. No exponer rutas internas ni claves de Cloud Run, Culqi o IA desde Next.js.
