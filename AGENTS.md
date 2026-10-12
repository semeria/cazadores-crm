# Proyecto

Cazadores CRM (`cazadores-crm`).

# Objetivo

Mantener un CRM multiorganización para gestionar equipos, agentes operativos y actividades mediante listas, tableros Kanban, comentarios e indicadores.

# Stack detectado

- Backend: PHP 8.3 y Laravel 13 con Eloquent.
- Frontend: React 19, JavaScript JSX e Inertia.js 3.
- Compilación: Vite 8, Laravel Vite Plugin y plugin React.
- Estilos: Tailwind CSS 4 y `@tailwindcss/forms`.
- UI: `@hello-pangea/dnd` para Kanban, Recharts para gráficos y Axios para peticiones JSON.
- Autenticación: controlador propio, guard web por sesión y proveedor Eloquent `User`.
- Autorización: middleware de roles, middleware de usuario activo y policies con `Gate`.
- Multitenencia: `organization_id`, trait `TenantScoped` y scope `visibleToUser`.
- Base de datos de Docker y `.env.example`: MySQL 8.4; PHPUnit utiliza SQLite en memoria.
- Sesiones, caché y colas configuradas en `.env.example` para base de datos.
- Herramientas: Composer, Artisan, PHPUnit, Laravel Pint, Tinker, Pail, npm y Vite.
- Contenedores: Docker Compose, PHP 8.3 con Apache, MySQL y phpMyAdmin.

# Convenciones de código

- Respeta `.editorconfig`: UTF-8, finales LF, espacios y salto de línea final; cuatro espacios salvo excepciones configuradas.
- Conserva namespaces PSR-4 y clases PHP en PascalCase; métodos y variables en camelCase.
- Conserva snake_case en columnas y campos de intercambio con el backend.
- Mantén identificadores técnicos en inglés y textos de interfaz en español.
- Sigue el estilo del archivo editado y limita los cambios a lo necesario.
- Controladores: `app/Http/Controllers/`; validaciones: `app/Http/Requests/`; permisos: `app/Policies/`.
- Modelos y relaciones Eloquent: `app/Models/`; lógica de negocio reutilizable: `app/Services/`.
- Rutas web: `routes/web.php`; registro de middleware: `bootstrap/app.php`.
- Renderiza páginas con Inertia y mantén sus contratos de props.
- Páginas JSX: `resources/js/Pages/`, con nombres y mayúsculas coherentes con el resolutor Inertia.
- Reutiliza el layout autenticado y componentes de `resources/js/Layouts/` y `resources/js/Components/`.
- Usa componentes funcionales, hooks, `useForm`, `Link` y `router` siguiendo los patrones existentes.
- Conserva Axios para operaciones JSON donde ya se usa.
- Mantén tokens `brand`, `surface` y el modo oscuro definidos en `resources/css/app.css`.
- Migraciones, factories y seeders pertenecen a sus directorios en `database/`.
- Pruebas PHPUnit: `tests/Feature/` y `tests/Unit/`.

# Buenas prácticas

- Antes de cambiar un flujo, inspecciona sus rutas, controlador, validación, policy, modelo, página y pruebas.
- Aplica autorización en servidor; ocultar controles de interfaz no concede ni reemplaza permisos.
- Preserva el aislamiento por organización en consultas, relaciones, asignaciones y escrituras.
- `TenantScoped` depende de un usuario autenticado con organización; en procesos sin sesión establece explícitamente el contexto.
- `User` no utiliza `TenantScoped`: filtra usuarios por organización explícitamente cuando corresponda.
- Valida que usuarios, agentes y supervisores relacionados pertenezcan al ámbito organizacional permitido.
- Obtén organización, identidad y roles sensibles del contexto autorizado del servidor.
- Conserva `visibleToUser` en listados, Kanban e indicadores.
- Distingue `users.id`, `agents.id`, `assigned_user_id`, `agent_id`, `manager_id` y `supervisor_id`.
- Confirma en migraciones que un campo existe antes de asumir que está disponible en el modelo.
- Verifica roles contra esquema, constantes, middleware y policies antes de modificar permisos.
- Mantén estados y prioridades coherentes entre esquema, validación y frontend.
- Usa datos validados y revisa `$fillable` o atributos `Fillable` al cambiar escrituras.
- Usa transacciones para operaciones relacionadas que deban ser atómicas.
- Conserva integridad referencial, índices y comportamientos de eliminación.
- Carga anticipadamente relaciones usadas por las páginas y conserva paginación y filtros.
- Preserva protección CSRF, hashing de contraseñas y gestión segura de sesiones.
- Mantén errores de validación y mensajes flash compatibles con Inertia.
- Respeta diseño adaptable, modo oscuro y estados de procesamiento de formularios.
- Cubre cambios relevantes de autorización y multitenencia con pruebas de acceso permitido y denegado.
- Investiga contradicciones entre pruebas y código antes de decidir el comportamiento esperado.
- Considera que SQLite puede diferir de MySQL al verificar cambios de esquema.

# Qué nunca debe hacer un agente

- Inventar funcionalidades, reglas de negocio, integraciones o infraestructura.
- Tratar comentarios, código desactivado o plantillas como funcionalidades operativas.
- Dar por implementado un historial solo porque existan una tabla o una prueba.
- Eliminar aislamiento organizacional o autorización para resolver un fallo.
- Añadir un scope organizacional a `User` sin analizar el impacto en autenticación.
- Confundir la identidad de un usuario con la de un registro `Agent`.
- Confiar en identificadores o permisos del navegador sin validarlos en el servidor.
- Debilitar pruebas de seguridad para acomodar una implementación defectuosa.
- Exponer secretos, contraseñas o contenido de `.env` en código, documentación o registros.
- Regenerar `APP_KEY` en un entorno existente como tarea rutinaria.
- Ejecutar operaciones destructivas de base de datos o borrar volúmenes sin autorización explícita.
- Ejecutar `composer setup` o el entrypoint como si fueran verificaciones sin efectos secundarios.
- Presentar el Vite de desarrollo del contenedor como despliegue de producción validado.
- Editar manualmente `vendor/`, `node_modules/`, `public/build/` o cachés generadas.
- Sobrescribir cambios locales del usuario ni revertir archivos ajenos a la tarea.
- Cambiar dependencias o archivos de bloqueo sin necesidad justificada.
- Crear commits, hacer push o desplegar sin petición explícita.
- Afirmar que verificaciones pasaron si no se ejecutaron correctamente.

# Flujo recomendado para modificar código

1. Revisa `git status`, las instrucciones aplicables y los cambios locales existentes.
2. Consulta `/docs` y contrasta su contenido con el código y la configuración actuales.
3. Traza el flujo completo y los contratos entre Laravel, Inertia y React.
4. Comprueba organización, roles, relaciones y validaciones afectadas.
5. Revisa pruebas relacionadas y resuelve contradicciones antes de alterar comportamiento.
6. Implementa el cambio mínimo siguiendo los patrones del módulo.
7. Añade una migración nueva cuando cambie un esquema existente.
8. Actualiza pruebas de comportamiento cuando sea pertinente.
9. Para pruebas focalizadas usa `php artisan test --filter=NombreDePrueba`.
10. Ejecuta `composer test` para verificar el backend cuando corresponda.
11. Comprueba formato PHP con `vendor/bin/pint --test`.
12. Ejecuta `npm run build` al cambiar JSX, CSS, dependencias frontend o configuración Vite.
13. Verifica que las pruebas usan el entorno aislado de `phpunit.xml`.
14. Revisa el diff final, permisos y ausencia de secretos o archivos generados.
15. Actualiza `/docs` si cambian contratos, configuración o procedimientos.
16. Informa cambios, verificaciones ejecutadas y bloqueos pendientes.

# Ubicación de la documentación

## Uso de la documentación

Antes de responder o modificar código:

1. Identifica qué área del proyecto está involucrada.
2. Lee únicamente el documento correspondiente dentro de /docs.
3. No cargues documentos que no sean necesarios.
4. Si modificas el proyecto, actualiza únicamente el documento afectado.
5. Mantén AGENTS.md como un archivo breve de reglas; toda la documentación técnica debe permanecer en /docs.
