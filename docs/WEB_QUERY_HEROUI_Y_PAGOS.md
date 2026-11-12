# AgroCloud · Web pública, TanStack Query, RUC y pagos

## Alcance de este parche

- `apps/web`: TanStack Query, refactor por componente y tipografía HeroUI v3.
- No cambia `apps/portal`, Gateway ni los microservicios.
- Preserva el formulario público `POST /api/access-requests` de Next.js, que envía a
  `POST /api/v1/identity/access-requests` por el Gateway configurado.
- No habilita un cobro ni la consulta tributaria mientras no exista una ruta autorizada.

## Endpoints comprobados en `agrocloud-backend/main`

| Operación | Servicio / ruta del Gateway | Autenticación | Destino correcto |
|---|---|---|---|
| Solicitud empresarial | `POST /api/v1/identity/access-requests` | Pública; rate limit de Identity | **Web** |
| Consulta RUC/SUNAT | **No existe ruta HTTP pública declarada** | Servicios PHP internos implementados | Web cuando exista endpoint controlado |
| Suscripción actual | `GET /api/v1/identity/subscription` | JWT + permiso `suscripciones.ver` | **Portal** |
| Generar orden | `POST /api/v1/identity/subscription/orders` (`offer_key`) | JWT + permiso `suscripciones.gestionar` | **Portal** |
| Crear cargo con Culqi | Billing `POST /api/v1/payments/charges` | `X-API-Key` de servicio | **Backend, nunca navegador** |
| Verificación de webhook | Billing `POST /api/v1/webhooks/culqi/:token` | Token privado y verificación del cargo | **Backend** |

### Sobre SUNAT

- Existen `services/ms-identity/app/Services/SunatRucService.php` y
  `services/ms-agricultural/app/Integrations/Sunat/SunatRucClient.php`.
- Ambos dependen de un proveedor intermedio configurado, no de una API pública directa de SUNAT.
- `services/ms-identity/routes/api.php` no registra una ruta de consulta RUC pública.
- Antes de activar la autocompletación: ruta POST pública controlada, limitación agresiva por
  IP/RUC, verificación de origen, protección antiabuso, respuesta sin datos innecesarios,
  contrato OpenAPI y pruebas. NO usar las claves del proveedor en Next.js.
- La ausencia de respuesta o la indisponibilidad del proveedor no debe bloquear la solicitud.

### Planes y Culqi

- En web: explicación pública de modalidades, condiciones verificadas y CTA a solicitar acceso.
- En portal: ver suscripción, elegir una oferta válida, abrir orden en Identity y lanzar
  checkout de Culqi con tokenización del lado del proveedor.
- Identity usa `IDENTITY_BILLING_OFFERS` para ofertas privadas y devuelve referencia,
  importe y moneda; no hay catálogo público documentado de planes/precios.
- Las claves secretas, API key de Billing, verificación del cargo y webhooks permanecen
  exclusivamente en los servicios de backend.
- El navegador **no debe llamar directamente** a la ruta protegida de cargos con clave de servicio.
- No conceder derechos por una redirección o respuesta optimista del checkout; esperar
  confirmación verificada y aplicar eventos idempotentes en Identity.
- Actualmente NO se implementa el checkout frontend; hace falta una operación autenticada
  segura que transforme el token de Culqi en un intento de cargo backend.

## Arquitectura del formulario

`AccessRequestForm` coordina React Hook Form + Zod y `useSubmitAccessRequest` (TanStack
`useMutation`). `api.ts` encapsula la petición HTTP; los componentes de cada bloque de formulario
se separan en `features/access-requests/components/`. El estado de submit y de error pertenece
al hook de mutación. No se reintenta automáticamente una operación que crea registros.

## Contratos y publicación

- El backend todavía no incluye persistencia del consentimiento de la solicitud: agregar
  auditoría de versión, fecha y base legal antes de recibir información personal real.
- Las páginas legales permanecen provisionales.
- La protección contra bots del BFF es básica; para producción se necesita rate limit
  distribuido (por ejemplo, servicio de cuotas compartido) y revisión de seguridad.
- No usar `NEXT_PUBLIC_` para claves de Billing, Culqi o proveedor tributario.
