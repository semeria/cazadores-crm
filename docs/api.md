# Rutas HTTP

**Resumen:** Las interfaces HTTP se declaran en `routes/web.php`. Son rutas web Laravel con sesión/CSRF y en su mayoría entregan páginas Inertia o redirecciones; el reordenamiento Kanban es una operación JSON mediante Axios.

## Índice

- [Convenciones](#convenciones)
- [Rutas de invitado](#rutas-de-invitado)
- [Rutas directivas](#rutas-directivas)
- [Gestión unificada del equipo](#gestión-unificada-del-equipo)
- [Clientes](#clientes)
- [Cotizaciones](#cotizaciones)
- [Rutas de agente](#rutas-de-agente)
- [Contratos de formulario observados](#contratos-de-formulario-observados)
- [Pendientes de documentar](#pendientes-de-documentar)

## Convenciones

Los verbos y URI son los declarados en `routes/web.php`. Las rutas de registro/login usan `guest`; las rutas de gestión usan `auth` y middleware de rol. Las policies pueden añadir denegaciones a nivel de operación. Para cambios de API, validar las reglas actuales de `FormRequest` y controlador.

## Rutas de invitado

| Método | URI | Nombre/controlador | Resultado |
|---|---|---|---|
| GET | `/` | Anónima | Redirige a `login`. |
| GET | `/register` | `register` / `AuthController@showRegister` | Página `Auth/Register`. |
| POST | `/register` | `AuthController@register` | Crea organización y owner; redirige a dashboard. |
| GET | `/login` | `login` / `AuthController@showLogin` | Página `Auth/Login`. |
| POST | `/login` | `AuthController@login` | Autentica y redirige según rol/estado. |

## Rutas directivas

Todas requieren `auth` y `role:owner,member`.

| Método | URI | Nombre/controlador | Uso |
|---|---|---|---|
| POST | `/logout` | `logout` / `AuthController@logout` | Finaliza sesión. |
| GET | `/dashboard` | `dashboard` / `DashboardController@index` | Indicadores y actividades próximas. |
| GET | `/members` | Resource `members.index` | Lista miembros. |
| POST | `/members` | Resource `members.store` | Crea miembro. |
| PUT/PATCH | `/members/{member}` | Resource `members.update` | Actualiza miembro. |
| POST | `/members/{member}/reset-password` | `members.reset-password` | Restablece contraseña. |
| Resource | `/agents` | `AgentController` | CRUD resource completo. |
| GET | `/activities` | `activities.index` | Lista paginada y filtros. |
| GET | `/activities/kanban` | `activities.kanban` | Tablero Kanban. |
| POST | `/activities` | `activities.store` | Crea actividad. |
| PUT | `/activities/reorder` | `activities.reorder` | Actualiza posiciones; responde JSON. |
| PUT | `/activities/{activity}` | `activities.update` | Actualiza actividad. |
| DELETE | `/activities/{activity}` | `activities.destroy` | Elimina actividad. |
| POST | `/activities/{activity}/comments` | `comments.store` | Crea comentario. |

## Gestión unificada del equipo

Estas rutas requieren autenticación y rol owner.

| Método | URI | Nombre/controlador | Uso |
|---|---|---|---|
| GET | `/team` | `team.index` / `TeamController@index` | Lista usuarios member/agent de la organización; admite filtro `search` y `role`. |
| POST | `/team` | `team.store` / `TeamController@store` | Crea cuenta member o agent; para agent sincroniza ficha operativa y encargado. |
| PUT | `/team/{teamMember}` | `team.update` / `TeamController@update` | Actualiza datos y rol; un agente que pasa a member conserva ficha inactiva. |
| POST | `/team/{teamMember}/reset-password` | `team.reset-password` / `TeamController@resetPassword` | Genera contraseña temporal. |

La lista de encargados solo incluye usuarios activos owner/member de la misma organización. No se permite asignar rol owner desde este módulo. Las rutas `/members` y `/agents` existentes continúan registradas.

## Clientes

Las búsquedas requieren autenticación y devuelven únicamente clientes de la organización del usuario.

| Método | URI | Nombre | Uso |
|---|---|---|---|
| GET | `/clients/search?q={texto}` | `clients.search` | Busca por nombre, correo o teléfono; requiere al menos dos caracteres. |

La creación desde la cotización forma parte de la misma operación transaccional; no hay todavía una pantalla CRUD independiente de clientes.

## Cotizaciones

Todas las rutas requieren autenticación. Owner, member y agent pueden crear y consultar sus cotizaciones; el owner también consulta las cotizaciones creadas por los demás usuarios de su organización.

| Método | URI | Nombre | Acceso/uso |
|---|---|---|---|
| GET | `/quotes` | `quotes.index` | Listado según autor y rol; búsqueda `search`. |
| GET | `/quotes/create` | `quotes.create` | Formulario de cotización. |
| POST | `/quotes` | `quotes.store` | Crea cotización y conceptos; folio automático o personalizado. |
| GET | `/quotes/settings` | `quotes.settings.edit` | Owner; configuración de logo y folio. |
| PUT | `/quotes/settings` | `quotes.settings.update` | Owner; actualiza prefijo, padding y logo. |
| GET | `/quotes/organization-logo` | `quotes.organization-logo` | Sirve el logo vigente de la organización autenticada. |
| GET | `/quotes/{quote}` | `quotes.show` | Owner o autor, dentro de la organización. |
| GET | `/quotes/{quote}/edit` | `quotes.edit` | Owner o autor. |
| PUT | `/quotes/{quote}` | `quotes.update` | Owner o autor; actualiza datos y recalcula importes. |
| GET | `/quotes/{quote}/pdf` | `quotes.pdf` | Owner o autor; descarga PDF generado con `application/pdf`. |
| GET | `/quotes/{quote}/pdf/preview` | `quotes.pdf.preview` | Owner o autor; transmite PDF en línea para vista previa. |
| DELETE | `/quotes/{quote}` | `quotes.destroy` | Owner o autor; elimina permanentemente la cotización y sus conceptos. |

El cálculo del servidor deriva importes de conceptos, descuento e IVA. El PDF se genera bajo demanda para vista previa o descarga y no se guarda en la base de datos ni en una carpeta pública.

El formulario envía `recipient_name`, `recipient_email`, `recipient_phone`, `recipient_address`, `client_id` opcional, `save_client`, `issued_at`, `valid_until`, `currency` (`MXN` o `USD`), `discount_type` (`none`, `percent` o `fixed`), `discount_value`, `tax_rate`, `items[]` (`description`, `quantity`, `unit_price`) y `notes`. Al crear incluye `folio_mode` (`auto` o `custom`) y `custom_folio` cuando corresponda. Configuración recibe `quote_prefix`, `number_padding`, un archivo `logo` opcional y `remove_logo` opcional. `save_client` permite guardar los datos del destinatario como cliente reutilizable; una coincidencia de correo exige seleccionar el registro existente.

## Rutas de agente

Requieren `auth` y `role:agent`, bajo prefijo `/agent`.

| Método | URI | Nombre/controlador | Uso |
|---|---|---|---|
| GET | `/agent` | Sin nombre | Redirige a `/agent/kanban`. |
| GET | `/agent/kanban` | `agent.kanban` | Kanban compartiendo `ActivityController@kanban`. |
| GET | `/agent/activities` | Actualmente nombre `activities.index` | Lista compartiendo `ActivityController@index`. |
| POST | `/agent/activities` | `ActivityController@store` | Alta de actividad. |
| PUT | `/agent/activities/{activity}` | `ActivityController@update` | Actualización de actividad. |
| PUT | `/agent/activities/reorder` | `ActivityController@updatePosition` | Reordenamiento JSON. |

La ruta de comentarios del grupo agente está comentada y no está registrada. Hay nombres de ruta de actividades potencialmente duplicados; verificar el registro efectivo antes de depender de ellos.

## Contratos de formulario observados

- Alta de actividad: `title`, `description`, `status`, `priority`, `assigned_user_id`, `agent_id`, `due_date`; estado y prioridad tienen conjuntos permitidos explícitos en `StoreActivityRequest`.
- Comentario: `body` de 2 a 2000 caracteres y `is_internal` booleano opcional.
- Alta de agente: datos de contacto, especialidad, estado, supervisor y notas; validaciones en `StoreAgentRequest`.
- `PUT /activities/reorder`: objeto con `items[]`, cada uno con `id`, `status` y `position`; la validación verifica existencia del ID, pero no expresa reglas permitidas para el estado.

## Pendientes de documentar

- Especificación OpenAPI, formatos de error/éxito y contratos completos de props: **Pendiente de documentar**.
- Autenticación de clientes externos y API versionada: **Pendiente de documentar**; no se observa API externa versionada.
