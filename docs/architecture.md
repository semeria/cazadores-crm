# Arquitectura

**Resumen:** Aplicación Laravel organizada en una capa HTTP que sirve páginas React a través de Inertia. Eloquent y las migraciones gestionan persistencia; middleware, policies y scopes participan en el acceso y aislamiento por organización.

## Índice

- [Vista general](#vista-general)
- [Capas y flujo de página](#capas-y-flujo-de-página)
- [Módulos backend](#módulos-backend)
- [Cliente web](#cliente-web)
- [Multitenencia y autorización](#multitenencia-y-autorización)
- [Pendientes de documentar](#pendientes-de-documentar)

## Vista general

Laravel 13 ejecuta la aplicación PHP. `routes/web.php` enruta solicitudes a controladores; estos validan, autorizan y consultan modelos Eloquent, y devuelven redirecciones, JSON o páginas Inertia. El cliente React resuelve los componentes en `resources/js/Pages/`. Vite compila `resources/css/app.css` y `resources/js/app.jsx`.

## Capas y flujo de página

1. `bootstrap/app.php` configura rutas y aliases de middleware `organization` y `role`; también agrega middleware Inertia y de usuario activo al grupo web.
2. Las rutas web combinan middleware `guest`, `auth` y roles.
3. Controladores usan `FormRequest` o validación de Laravel, `Gate`, modelos y servicios.
4. Los controladores de páginas renderizan con `Inertia::render()` y envían props; `HandleInertiaRequests` comparte el usuario y mensajes flash.
5. El resolutor de `resources/js/app.jsx` mapea nombres de página a archivos JSX bajo `Pages`.

## Módulos backend

- **Actividades:** `ActivityController` implementa lista, Kanban, alta, edición, eliminación y reordenamiento. `ActivityService` calcula posición al crear y actualiza estado/posición en el reordenamiento. `DashboardController` consulta indicadores y próximas actividades.
- **Comentarios:** `CommentController` crea comentarios dentro de una transacción y consulta `ActivityCommentPolicy`.
- **Agentes:** `AgentController` administra registros `Agent` y también crea o actualiza una cuenta `User` asociada al flujo de agente.
- **Miembros:** `MemberController` gestiona cuentas `User` con rol member y permite generar una contraseña temporal o restablecerla.
- **Equipo unificado:** `TeamController` administra cuentas con rol member/agent desde una pantalla. Al guardar agentes, sincroniza `users.manager_id` y `agents.supervisor_id`, y actualiza la ficha operativa existente sin migraciones de esquema.
- **Cotizaciones:** `QuoteController` sirve listado, creación, detalle, edición, vista previa y descarga PDF; `QuoteSettingsController` administra prefijo, padding de folio y logo por organización. `QuoteService` coordina folios y persistencia transaccional, y `QuoteCalculationService` calcula importes de líneas, descuento, IVA y total. Dompdf genera el PDF desde una plantilla Blade.
- **Clientes:** `ClientController` ofrece búsqueda limitada a la organización. El modelo `Client` es un catálogo compartido por tenant; la creación durante una cotización se coordina dentro de `QuoteService`.
- **Monetización SaaS:** `PlanController` y `CouponController` administran el catálogo; `SubscriptionController` crea solicitudes del owner; `SubscriptionPaymentController` aprueba/rechaza transferencias; `SubscriptionReportController` lista, filtra y exporta pagos, suscripciones y redenciones; `SubscriptionService` calcula importes, reservas, vencimientos y activaciones. `SubscriptionAccessService` decide acceso heredado, activo o en gracia; `EnsureSubscriptionAccess` protege las rutas operativas. Una futura pasarela podrá incorporarse como proveedor de pagos sin alterar snapshots comerciales.
- **Autenticación:** `AuthController` procesa registro, inicio y cierre de sesión.
- **Permisos:** policies `ActivityPolicy`, `ActivityCommentPolicy`, `AgentPolicy`, `OrganizationPolicy` y `UserPolicy`.

## Cliente web

Las páginas se organizan por módulo: `Auth`, `Activities`, `Agents`, `Members`, `Quotes`, `Team` y `Dashboard`. `AuthenticatedLayout` provee navegación, menú móvil y modo oscuro. Los componentes compartidos incluyen elementos UI, `CommentTimeline` y `KpiCard`. Kanban utiliza `@hello-pangea/dnd`; gráficos del panel usan Recharts.

## Multitenencia y autorización

Los modelos Activity, Agent, ActivityComment y Quote usan `TenantScoped`, que agrega scope por `organization_id` y asigna la organización al crear si hay usuario autenticado. `User` deliberadamente no usa este trait; por ejemplo, el listado de miembros filtra usuarios manualmente por organización. `Activity::visibleToUser()` añade filtro por usuario para roles que no sean owner. Quote aplica además visibilidad por `created_by` para usuarios que no sean owner. La autorización se expresa en middleware de rol y en policies invocadas mediante `Gate`. Las rutas operativas requieren `organization` y `subscription`; la pantalla `/subscription` queda accesible para que owners gestionen el alta aunque el tenant aún no tenga acceso comercial.

## Pendientes de documentar

- Diagrama de despliegue, límites de confianza y arquitectura de producción: **Pendiente de documentar**.
- Colas funcionales, eventos, integraciones externas y tareas programadas: **Pendiente de documentar**; el código inspeccionado no acredita flujos funcionales de estos tipos.
