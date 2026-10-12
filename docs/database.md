# Base de datos

**Resumen:** El esquema se define por migraciones Laravel. Docker y `.env.example` usan MySQL 8.4; PHPUnit fuerza SQLite en memoria. Las entidades principales pertenecen a organizaciones, aunque la forma de aplicar scopes varía por modelo.

## Índice

- [Motores y configuración](#motores-y-configuración)
- [Colecciones/tablas](#coleccionestablas)
- [Relaciones observadas](#relaciones-observadas)
- [Ámbito organizacional](#ámbito-organizacional)
- [Datos iniciales](#datos-iniciales)
- [Pendientes de documentar](#pendientes-de-documentar)

## Motores y configuración

La conexión usa `DB_CONNECTION` y variables `DB_*` de Laravel. `.env.example` configura MySQL con host `db` para Docker. `phpunit.xml` configura `DB_CONNECTION=sqlite` y `DB_DATABASE=:memory:`. Laravel también dispone de migraciones para tablas de sesiones, caché y trabajos en cola.

## Colecciones/tablas

- **organizations:** nombre, slug y estado `active`/`suspended`; tabla raíz de la organización.
- **users:** identidad de autenticación, correo, teléfono, contraseña, organización, rol, estado activo, flag separado `is_super_admin` y datos de gestión como `manager_id` y `position`.
- **organization_admin_audits:** organización, actor opcional, acción, motivo, cambios JSON y marcas de tiempo de acciones de administración SaaS.
- **plans:** catálogo administrado por Superadmin con precio MXN, periodo en días/años, descripción y publicación/archivo.
- **coupons:** códigos, beneficio porcentual/fijo/meses gratis, marca de prueba, vigencia y máximo de canjes.
- **organization_subscriptions:** organización, plan, snapshot de precio/periodo/cupón, estado, fechas de vigencia y gracia de dos días.
- **subscription_payments:** solicitudes de pago por transferencia manual, monto, estado y revisión por Superadmin; no contiene comprobantes.
- **coupon_redemptions:** canjes reservados/reclamados/liberados por organización, asociados a la suscripción.
- **platform_billing_settings:** instrucciones de transferencia editables desde el panel de plataforma.
- **agents:** ficha operativa con organización, supervisor, nombre, contacto, especialidad, estado y notas. Su `id` es distinto de `users.id`.
- **activities:** organización, usuario asignado (`assigned_user_id`), agente (`agent_id`), título, descripción, estado, prioridad, fecha límite y posición Kanban.
- **activity_comments:** organización, actividad, autor, cuerpo y flag `is_internal`.
- **organization_quote_settings:** una fila por organización con ruta privada al logo vigente, prefijo, padding y próximo consecutivo del folio automático.
- **clients:** catálogo reutilizable por organización con nombre, correo opcional, teléfono y dirección. El correo, cuando existe, es único dentro de su organización.
- **quotes:** organización, autor, cliente opcional, folio, copia de los datos del destinatario, fechas, moneda, descuento, tasa e importe de IVA, subtotal, total y notas. El folio tiene unicidad compuesta por organización.
- **quote_items:** conceptos pertenecientes a una cotización, con descripción, cantidad, precio unitario, importe calculado y posición. Se eliminan en cascada al eliminar permanentemente su cotización.
- **activity_histories:** actividad, usuario, campo cambiado y valores anterior/nuevo. No se documenta aquí como flujo funcional activo: el controlador tiene código de escritura comentado y la migración observada no contiene los campos `type`/`description` usados por una prueba.
- **cache**, **jobs** y tablas de autenticación/sesión: tablas de soporte de Laravel creadas/configuradas por migraciones; el detalle exacto depende de las migraciones vigentes.

Estados de actividad: `pending`, `in_progress`, `in_review`, `completed`, `cancelled`. Prioridades: `low`, `medium`, `high`, `urgent`. Estados de ficha Agent: `active`, `inactive`, `on_leave`.

## Relaciones observadas

- Organización tiene muchos usuarios.
- Organización tiene un owner principal y muchas auditorías de superadministración. El flag de plataforma reside en User y no es una membresía tenant.
- Organización tiene suscripciones históricas; plan, importe, moneda y duración quedan copiados en cada suscripción. Los pagos y canjes se relacionan con una suscripción y tenant.
- User pertenece a una organización y puede tener manager y usuarios asociados por `manager_id`.
- Agent pertenece a organización y tiene supervisor User; declara relación `user()` por `user_id`.
- Activity pertenece a organización, puede pertenecer a un usuario asignado y a un Agent, y tiene comentarios.
- ActivityComment pertenece a Activity y a User.
- Organization tiene una configuración de cotizaciones y muchas cotizaciones; Quote pertenece a Organization y User creador, y tiene muchos QuoteItem.
- Organization tiene muchos Client; Quote puede pertenecer a un Client de la misma organización. Al borrar el Client, `client_id` queda nulo y la copia del destinatario de la cotización se conserva.
- Las migraciones definen claves foráneas con cascada o `nullOnDelete` en relaciones de organización, asignación y supervisor, según entidad.

## Ámbito organizacional

`TenantScoped` aplica un scope global a modelos que usan el trait si existe un usuario autenticado con `organization_id`, y completa ese campo al crear. Activity, Agent y ActivityComment lo usan. `User` no lo usa: las consultas que deban ser tenant-aware deben filtrar explícitamente. `visibleToUser()` filtra actividades para usuarios que no sean owner por `assigned_user_id`. El middleware de rutas exige organización activa y acceso heredado o suscripción activa/en gracia; los tenants existentes reciben `has_legacy_access=true` al migrar. El registro público establece ese flag en falso.

Quote también usa `TenantScoped`; sus consultas además filtran por autor para usuarios que no sean owner. El logo se almacena en el disco privado local bajo una ruta por organización; las cotizaciones muestran el logo vigente, no una copia del archivo al momento de creación. Monedas permitidas: `MXN` y `USD`; descuento: ninguno, porcentaje o monto fijo. El IVA se guarda como tasa por cotización.

Las cantidades, precios y totales se almacenan con dos decimales. El total se calcula en servidor aplicando el descuento al subtotal y después el IVA al subtotal descontado. No se realizan conversiones entre monedas. Los correos de nuevos clientes se normalizan a minúsculas antes de guardarse para impedir duplicados por diferencias de mayúsculas.

## Datos iniciales

`DatabaseSeeder` crea una organización de ejemplo, dos usuarios con roles owner/member y registros Agent mediante factory. El arranque Docker ejecuta además `InitialOrganizationSeeder`, que crea una organización y cuenta owner de acceso inicial a partir de configuración. Este seeder identifica registros por slug de organización y correo, y no sobrescribe registros existentes. `PlatformSuperAdminSeeder` se ejecuta explícitamente durante aprovisionamiento controlado de despliegue y no forma parte del arranque normal. Evitar asumir que `DatabaseSeeder` se ejecutó en cualquier ambiente.

## Pendientes de documentar

- ERD completo y especificación exacta de todos los índices: **Pendiente de documentar**.
- Política de retención, archivado, backup y recuperación: **Pendiente de documentar**.
- Esquema vigente en una base desplegada y migraciones aplicadas en producción: **Pendiente de documentar**.
- Impuestos, facturación fiscal y reglas de renovación automática: **Pendiente de definir**; esta versión solo registra pagos manuales.
