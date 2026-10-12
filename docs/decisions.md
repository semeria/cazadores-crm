# Decisiones y patrones observados

**Resumen:** Se registran decisiones evidentes en configuración y código vigente. No se presentan como ADR formal ni se atribuyen motivos que el repositorio no documenta.

## Índice

- [Arquitectura de aplicación](#arquitectura-de-aplicación)
- [Identidad y roles](#identidad-y-roles)
- [Aislamiento de organización](#aislamiento-de-organización)
- [Frontend y comunicación](#frontend-y-comunicación)
- [Persistencia y pruebas](#persistencia-y-pruebas)
- [Decisiones pendientes de documentar](#decisiones-pendientes-de-documentar)

## Arquitectura de aplicación

- Laravel sirve páginas React a través de Inertia; las páginas se resuelven por nombre de componente.
- El flujo web reside en `routes/web.php`; no se observa un registro separado de endpoints API versionados.
- La lógica de posición y reordenamiento de actividades está separada en `ActivityService`; otras operaciones se gestionan en controladores.

## Identidad y roles

- Se usa guard web con sesión y proveedor Eloquent `User`.
- Registro público crea una organización y asigna rol owner en una transacción.
- El rol de un agente operativo se guarda en `users`; además existe entidad independiente `agents` para ficha operativa.
- Acceso a áreas se restringe por middleware de rol y operaciones de modelo por policies/Gate.

## Aislamiento de organización

- El tenant se representa mediante `organization_id`.
- `TenantScoped` añade scope global y asignación al crear cuando hay usuario autenticado.
- `User` se excluye del trait, y los listados relevantes aplican filtros explícitos.
- El scope `visibleToUser` diferencia la visibilidad de actividad para owner y demás roles.

## Frontend y comunicación

- React 19, Inertia y JSX constituyen la UI; Vite y Tailwind CSS gestionan compilación y estilos.
- Los formularios y navegación usan primitivas Inertia; Axios se usa para el PUT JSON de reordenamiento Kanban.
- El modo oscuro se controla por clase en el documento y almacena preferencia en `localStorage`.

## Persistencia y pruebas

- MySQL 8.4 aparece en Docker y `.env.example`; las pruebas PHPUnit se configuran con SQLite en memoria.
- Migraciones expresan relaciones y reglas de eliminación; factories/seeders se encuentran en `database/`.
- Sesión, caché y cola se configuran para usar base de datos en `.env.example`.

## Decisiones pendientes de documentar

- Motivación, autoría y fecha de decisiones técnicas: **Pendiente de documentar**.
- Política de compatibilidad, versionado, revisión de dependencias y ADR: **Pendiente de documentar**.
