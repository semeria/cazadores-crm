# Proyecto

**Resumen:** Cazadores CRM es una aplicación web para administrar organizaciones, equipos, agentes y actividades. La descripción funcional procede de las rutas, modelos y pantallas presentes en el código; no se usa el README de plantilla como especificación.

## Índice

- [Alcance observado](#alcance-observado)
- [Stack](#stack)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Pendientes de documentar](#pendientes-de-documentar)

## Alcance observado

- Gestión de organizaciones, miembros, agentes y actividades.
- Actividades presentadas como lista y tablero Kanban, con asignación, estado, prioridad y fecha límite.
- Comentarios asociados a actividades.
- Panel con indicadores, actividades próximas y gráficos para el rol owner.
- Acceso diferenciado por roles y aislamiento de datos mediante `organization_id`.

## Stack

- PHP 8.3, Laravel 13 y Eloquent.
- Inertia.js 3, React 19 y JSX.
- Vite 8 y Tailwind CSS 4.
- MySQL 8.4 en Docker; SQLite en memoria en la configuración PHPUnit.
- PHPUnit 12 para pruebas; Docker Compose para el entorno en contenedores.

## Estructura del repositorio

| Ruta | Contenido observado |
|---|---|
| `app/Http/Controllers/` | Controladores web y flujos de autenticación, actividades, agentes, miembros y comentarios. |
| `app/Http/Requests/` | Validaciones de formularios HTTP. |
| `app/Http/Middleware/` | Middleware de rol, organización, actividad de cuenta e Inertia. |
| `app/Models/` | Modelos Eloquent, relaciones y trait de ámbito organizacional. |
| `app/Policies/` | Autorización de modelos. |
| `app/Services/` | Lógica reutilizable; actualmente `ActivityService`. |
| `routes/` | Rutas web y de consola. |
| `resources/js/` | Entrada React, páginas, layout y componentes. |
| `resources/css/` y `resources/views/` | Estilos y plantilla raíz Blade de Inertia. |
| `database/` | Migraciones, factories y seeders. |
| `tests/` | Pruebas Feature y Unit de PHPUnit. |
| `config/` y `bootstrap/` | Configuración Laravel y registro de middleware. |
| `docker/`, `Dockerfile`, `docker-compose.yml` | Contenedor de aplicación y servicios Docker. |

## Pendientes de documentar

- Requisitos funcionales formales y criterios de aceptación: **Pendiente de documentar**.
- Entornos soportados aparte de los configurados en los archivos del repositorio: **Pendiente de documentar**.
- Propietario del producto, usuarios objetivo y política de versiones: **Pendiente de documentar**.
