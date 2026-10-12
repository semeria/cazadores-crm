# Autenticación y autorización

**Resumen:** La aplicación usa el guard `web` de Laravel con autenticación por sesión y un controlador propio. El acceso a rutas se restringe con middleware de autenticación y roles; las operaciones de modelos usan policies mediante `Gate`.

## Índice

- [Configuración de identidad](#configuración-de-identidad)
- [Registro](#registro)
- [Inicio y cierre de sesión](#inicio-y-cierre-de-sesión)
- [Roles y rutas](#roles-y-rutas)
- [Superadministración](#superadministración)
- [Autorización por policies](#autorización-por-policies)
- [Cotizaciones](#cotizaciones)
- [Datos compartidos con Inertia](#datos-compartidos-con-inertia)
- [Pendientes de documentar](#pendientes-de-documentar)

## Configuración de identidad

`config/auth.php` define el guard `web` con driver `session` y proveedor `eloquent` basado en `App\Models\User`. `User` oculta contraseña y remember token; su cast de contraseña aplica hashing. Las sesiones se configuran mediante `SESSION_*` (en `.env.example`, driver database).

## Registro

Las rutas GET y POST `/register` son para invitados. `AuthController::register` valida nombre, correo único, teléfono, nombre de organización y contraseña confirmada de al menos ocho caracteres. En una transacción crea organización con slug y cuenta owner, luego autentica la cuenta y redirige al dashboard.

## Inicio y cierre de sesión

- GET `/login` muestra la página Inertia `Auth/Login`.
- POST `/login` valida correo y contraseña, usa `Auth::attempt` y admite `remember`.
- Si la cuenta o su organización está inactiva/suspendida, cierra sesión y devuelve error de validación; `CheckUserIsActive` lo vuelve a comprobar en cada solicitud autenticada.
- El superadministrador se redirige a `/super-admin/organizations`; un agente a `/agent/kanban`; los demás usuarios con organización activa van al dashboard.
- POST `/logout` cierra sesión, invalida la sesión y regenera el token CSRF.

## Roles y rutas

`User` declara `admin`, `owner`, `agent` y `member`; `CheckRole` compara el rol actual con los argumentos indicados por la ruta. Las rutas directivas usan `role:owner,member`; el grupo operativo usa `role:agent`. El registro público fuerza el rol `owner`. La lista histórica de valores del esquema varía entre migraciones; el acceso de superadministración no reutiliza esos valores de rol.

## Superadministración

El superadministrador es una cuenta `User` marcada por `is_super_admin`, sin `organization_id`. Este permiso separado no concede acceso a las rutas operativas de tenants. `CheckSuperAdmin` protege `/super-admin/organizations`; el resto de rutas autenticadas de negocio requiere `organization` y por ello no está disponible para cuentas de plataforma.

La cuenta se aprovisiona únicamente mediante el seeder explícito `PlatformSuperAdminSeeder` con variables de despliegue `PLATFORM_ADMIN_*`; no se crea en el registro público ni en cada arranque. El seeder es idempotente para una cuenta ya aprovisionada y rechaza correos pertenecientes a usuarios no-superadministradores. La contraseña debe tener al menos 12 caracteres.

La administración permite consultar, buscar, editar el nombre, suspender y reactivar organizaciones. La suspensión exige motivo, conserva los datos y bloquea tanto el login como sesiones ya abiertas. Las acciones de cambio de nombre, suspensión y reactivación se registran en `organization_admin_audits`.

## Suscripciones y acceso SaaS

El Superadministrador gestiona planes MXN de 30 días/un año, cupones de descuento o meses gratis, cola de transferencias manuales e instrucciones bancarias. Las solicitudes no activan planes pagados hasta que un Superadministrador aprueba el pago; rechazarlo libera el canje reservado. Los cupones marcados como prueba (1–12 meses) activan acceso directamente y quedan como suscripciones `trialing`. Los demás cupones no evitan la aprobación manual, incluso si reducen el importe a cero.

Una renovación aprobada antes del fin del periodo o durante la gracia empieza al terminar el periodo anterior; una aprobada después de la gracia comienza en la fecha de aprobación. La organización conserva acceso durante dos días después de la expiración y luego las rutas operativas redirigen a `/subscription`. El bloqueo comercial no cambia `organizations.status` ni elimina datos. Las organizaciones anteriores conservan acceso mediante `has_legacy_access` hasta que una suscripción se activa; las nuevas organizaciones registradas no reciben ese acceso.

## Autorización por policies

`Gate::authorize()` se usa en controladores de actividades, comentarios, agentes, miembros y cotizaciones. Las policies disponibles incluyen `ActivityPolicy`, `ActivityCommentPolicy`, `AgentPolicy`, `OrganizationPolicy`, `UserPolicy`, `QuotePolicy` y `OrganizationQuoteSettingPolicy`. La implementación concreta de permisos depende de cada método de policy; no inferir permisos únicamente de la interfaz o del middleware de ruta.

`EnsureUserHasOrganization` aplica a las rutas de negocio por tenant y verifica organización activa; las rutas de plataforma están separadas.

## Cotizaciones

Cualquier usuario autenticado que pertenezca a una organización puede crear cotizaciones. Cada usuario consulta, edita, elimina y descarga únicamente las que creó; el owner puede consultar, editar, eliminar y descargar todas las cotizaciones de su organización. El owner es el único que puede modificar la configuración de folios y el logo. Las policies comprueban organización y autor en el servidor.

El catálogo de clientes es compartido por los usuarios de una misma organización. Las búsquedas se limitan al tenant actual; el servidor valida que un `client_id` seleccionado pertenezca a la organización. Los usuarios pueden registrar un cliente junto con una cotización, y no se permite crear otro con el mismo correo normalizado dentro de esa organización.

La gestión unificada `/team` está restringida al rol owner. Desde ese módulo se pueden asignar `member` o `agent`; el rol owner no se asigna desde el formulario. Para agentes, el encargado debe ser un usuario activo owner/member de la misma organización. Al cambiar un agent a member se conserva la ficha `agents` marcada inactiva.

## Datos compartidos con Inertia

`HandleInertiaRequests::share()` comparte `auth.user` y los mensajes flash `success` y `error`. Las páginas pueden consumir estos datos por `usePage().props`.

## Pendientes de documentar

- Flujo de recuperación de contraseña verificado de extremo a extremo: **Pendiente de documentar**.
- Política formal de contraseñas, expiración de sesión, MFA y verificación de correo: **Pendiente de documentar**.
- Matriz de permisos aprobada por negocio: **Pendiente de documentar**.
