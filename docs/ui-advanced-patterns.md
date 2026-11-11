# Componentes avanzados · AgroCloud

**Stack:** HeroUI **v3.2.7**, Tailwind CSS 4, React 19, Next.js 16 y Motion.

## Demostración

- `/design-system` conserva la biblioteca de fundamentos.
- `/design-system/advanced` añade ejemplos de interacción con **datos ficticios**, sin peticiones al backend.
- Ambas pantallas funcionan con los temas claro/oscuro de `packages/ui/src/styles/tokens.css`.

## Componentes cubiertos

| Área | HeroUI | Patrón AgroCloud |
| --- | --- | --- |
| Desplazamiento | `ScrollShadow` | `AgroScrollArea`, sin barra visible, manteniendo desplazamiento |
| Listados | `Pagination`, `Table`, `ListBox` | `AgroPagination`, paginación controlada y tabla accesible |
| Navegación | `Link`, `Accordion`, `ButtonGroup`, `Button` | Ayuda contextual y elección de vista |
| Contenedores | `Surface`, `Separator` | Superficies y divisores semánticos |
| Capas | `Sheet`, `Modal`, `AlertDialog` | Ficha rápida, edición y confirmación destructiva |
| Indicadores | `Meter` | `QuotaMeter` para cupos de planes |
| Personas | `Avatar`, `AvatarGroup` | Iniciales y equipo de inspección |
| Formularios | `Form`, `Fieldset`, `FieldError`, `ErrorMessage` | Validación y organización de campos |
| Entrada | `Input`, `InputGroup`, `ComboBox`, `Autocomplete` | Texto, unidades y selección de productor |
| Selección | `Checkbox`, `CheckboxGroup`, `RadioGroup`, `Switch` | Preferencias y filtros |
| Fechas | `Calendar`, `RangeCalendar` | Fecha y rango de informes |

## ScrollShadow sin barras

HeroUI ya ofrece `hideScrollBar`. Para zonas que sí necesiten scroll, utiliza:

```tsx
import { AgroScrollArea } from "@agrocloud/ui";

<AgroScrollArea className="h-72 rounded-xl p-3">
  {items.map(item => <a key={item.id} href={item.href}>{item.name}</a>)}
</AgroScrollArea>
```

- **No** aplicar `overflow: hidden` a `body`, `html` ni a la aplicación completa.
- Mantener la navegación por teclado, trackpad, rueda y táctil.
- Añadir un `height` o `max-height` explícito para desplazamiento vertical.
- Las listas muy largas deben paginarse, no introducir scroll infinito sin justificación.
- `agro-hide-scrollbar` sirve para contenedores específicos, por ejemplo `Table.ScrollContainer`.
- No aplicar `animate-*` de Tailwind sobre el mismo ScrollShadow: sustituye su animación CSS de desvanecimiento.

## Paginación

```tsx
import { AgroPagination } from "@agrocloud/ui";

<AgroPagination
  page={page}
  pageSize={10}
  total={response.meta.total}
  onPageChange={setPage}
/>
```

La paginación es **controlada**. No carga datos por sí sola: al conectarla con la API, sincroniza página y filtros con los parámetros de URL, solicita la página correcta y muestra el total informado por el backend. La demostración presenta siete lotes ficticios y tres elementos por página.

## Cuotas y progreso

- `Meter` sirve para **cantidad conocida respecto de un máximo**: 42 lotes utilizados de 50 disponibles.
- Para análisis IA sin duración conocida, usa `Spinner`, no un porcentaje ficticio de `Meter`.
- En límites excedidos muestra el valor real en el texto y limita el relleno al 100%.

## Paneles

- `Sheet`: detalles breves en pantalla pequeña, filtros y selecciones; al cerrar restaura el foco.
- `Modal`: formularios o tareas completas, con encabezado, cuerpo y pie.
- `AlertDialog`: operaciones con consecuencias, con botones separados de cancelar y confirmar.
- Evita aplicar Motion adicionalmente a los paneles que HeroUI ya anima.

## Formulario y validaciones

- Agrupa campos relacionados con `Fieldset`; utiliza `Form` para validación y envío.
- `FieldError` acompaña `TextField` y se muestra si `isInvalid=true`.
- `ErrorMessage` corresponde a errores de componentes no asociados a un campo, como colecciones.
- Valida tanto en el frontend como en el backend; los permisos y cupos solo se validan de forma autoritativa en el servidor.
- Separa el `ComboBox` (entrada editable) del `Autocomplete` (selección y filtrado).

## Accesibilidad y criterios de entrega

1. Con Tab el foco recorre todos los botones y campos en orden.
2. El tema claro y oscuro conserva contrastes en paneles, tablas y errores.
3. Las barras ocultas no impiden llegar a los elementos situados fuera del contenedor visible.
4. Los formularios explican la causa del error, sin borrar los campos ingresados.
5. La confirmación de cancelación no envía ninguna petición en la galería.
6. En móvil, los paneles no sobrepasan la altura disponible y se pueden cerrar.
7. Ejecutar `npm run lint`, `npm run typecheck` y `npm run build` antes del push.

### Documentación HeroUI

[ScrollShadow](https://heroui.com/en/docs/react/components/scroll-shadow) · [Pagination](https://heroui.com/en/docs/react/components/pagination) · [Sheet](https://heroui.com/en/docs/react/components/sheet) · [FieldError](https://heroui.com/en/docs/react/components/field-error) · [Calendar](https://heroui.com/en/docs/react/components/calendar)
