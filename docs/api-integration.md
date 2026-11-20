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

## Maestros y procedimientos agrícolas

La configuración empresarial incluye `/settings/catalogs`, `/settings/catalogs/[type]`
y `/settings/sampling-procedures` con rutas `/new` y `/[id]`. Los formularios y detalles
reutilizan el panel lateral del portal, HeroUI v3, Zod y React Query.

El BFF de Agricultural integra GET/POST de `catalogs` y `sampling-procedures`, y PATCH
por ID para disponibilidad. Las escrituras requieren rol `ADMIN`, empresa y permiso
`empresa.editar`. Los procedimientos pueden consultarse con `empresa.editar`,
`muestreos.ver` o `muestreos.crear`. La autorización se comprueba nuevamente en el BFF.

Límites del contrato actual, sin cambios al backend:

- `catalogs?tipo=...` solo devuelve valores habilitados. Los deshabilitados durante
  la visita se conservan en memoria para permitir recuperarlos hasta salir de la vista;
  no constituye un listado completo de deshabilitados ni persiste entre visitas.
- Se crean productos, variedades con producto padre, métodos, defectos, categorías
  y motivos. Las unidades solo admiten consulta y cambio de disponibilidad.
- El catálogo global no tiene administración disponible para SUPERADMIN.
- Los procedimientos no admiten edición de instrucciones: una nueva versión se crea
  con POST, conservando la anterior y su estado. Nombre y versión deben ser únicos.
- No existen endpoints para plantillas ni filtros de procedimientos por producto.
  El cliente reúne todas las páginas antes de aplicar búsqueda, filtros y paginación.
  El formulario operativo de muestreo usa también la colección completa y selecciona
  únicamente procedimientos activos del producto o sin producto específico.
- El límite de frutos configurado en el servicio sigue siendo la autoridad; sus
  validaciones se muestran en el formulario. No se crean datos iniciales automáticamente.

## Notificaciones empresariales

`/notifications` ofrece la bandeja paginada por cursor, filtros de lectura y marcado
individual o completo. La campana del navbar consulta el contador cada 30 segundos,
sin polling en segundo plano. `/settings/notifications` permite guardar preferencias
de avisos opcionales y correo; los avisos críticos y de seguridad no se silencian.
El BFF `/api/notifications/[[...resource]]` utiliza la misma sesión renovable y el
Gateway, con una lista cerrada de operaciones, UUID y paginación validados.

Los destinos históricos `/lotes/{id}`, `/notificaciones` y `/suscripcion` se adaptan
a rutas del portal al abrir el aviso. Solo se aceptan destinos internos conocidos.
No se exponen endpoints internos de eventos ni credenciales de SMTP o de servicios.
La emisión de eventos, los workers y la entrega SMTP siguen dependiendo de la
configuración existente del backend; esta integración no los cambia ni genera avisos ficticios.

## Revisión humana, IA y dictamen

La vista de evidencias conserva resultados IA, regiones de detección, confianza,
validaciones humanas y hallazgos manuales. Integra las acciones de decidir detecciones,
guardar revisión, descartar evidencia y cancelar análisis pendientes con justificación.
Las regiones se dibujan sobre la fotografía original; el listado permite recorrer
todas las detecciones conservando su índice original.

El inspector asignado con `inspecciones.validar` puede registrar hallazgos de maestros,
revisar las imágenes y validar la inspección. Se muestra cobertura de frutos y revisión
de evidencias; el backend verifica el cierre y la vigencia de cada revisión.
El supervisor independiente con `calidad.clasificar` puede emitir el dictamen desde
el resumen de la inspección: aprobar, rechazar u observar, con protocolo y fundamento.
Las correcciones documentales referencian el último dictamen. La reinspección creada
por el backend se continúa desde el muestreo; los dictámenes finales no se sobrescriben.
Las mutaciones invalidan las consultas afectadas para reflejar estados y revisiones.
