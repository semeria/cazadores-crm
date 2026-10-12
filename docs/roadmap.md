# Estado y pendientes

**Resumen:** Este documento distingue capacidades comprobables en el código de tareas futuras no especificadas. No se atribuye un roadmap de producto al repositorio cuando no existe una planificación verificable.

## Índice

- [Capacidades observadas](#capacidades-observadas)
- [Pendientes técnicos verificables](#pendientes-técnicos-verificables)
- [Roadmap de producto](#roadmap-de-producto)

## Capacidades observadas

- Autenticación con registro de organización y usuario owner, inicio y cierre de sesión.
- Gestión de miembros y agentes.
- Listado y Kanban de actividades, operaciones de estado/posición, asignaciones y prioridades.
- Comentarios de actividad y vista de indicadores.
- Scopes organizacionales y autorización mediante middleware y policies.
- Panel de superadministración para consultar, editar el nombre, suspender y reactivar organizaciones, con auditoría de acciones.

Esta lista describe código presente; no representa cobertura funcional completa ni estado de producción.

## Pendientes técnicos verificables

- El controlador de comentarios contiene escritura de historial comentada; no documentar historial automático como función activa.
- Una prueba `ActivityCommentTest` espera una fila de historial con `type`/`activity_id`, mientras que la migración observada define otra forma (`field_changed`, `old_value`, `new_value`) y el código de escritura está comentado. La discrepancia debe investigarse antes de considerar historial implementado.
- La ruta de comentarios para agentes aparece comentada; actualmente no está registrada en `routes/web.php`.
- `UpdateActivityRequest` existe pero devuelve `authorize() === false` y carece de reglas; el controlador actual de actualización usa validación directa. No inferir que ese request está operativo.
- La validación de IDs relacionados en varios formularios usa `exists` sin una regla explícita de pertenencia a organización en el propio request; revisar el flujo completo antes de afirmar garantía de tenant.
- Las páginas incluyen ExampleTest, además de pruebas de feature para actividad, comentarios, miembros y registro; la cobertura total del sistema no está documentada.

Estos puntos son observaciones de código, no prioridades aprobadas.

## Roadmap de producto

1. **Control de organizaciones (implementado):** listado y detalle global, edición de nombre, suspensión/reactivación sin borrar datos, bloqueo de login y sesiones para organizaciones suspendidas, y auditoría administrativa.
2. **Monetización SaaS (primera versión implementada):** planes dinámicos MXN de 30 días o un año; cupones de descuento o meses gratis; cupones de prueba con acceso inmediato; solicitudes y aprobación manual de transferencias; activación/renovación, acceso heredado para tenants existentes, periodo de gracia de dos días y reporte filtrable/exportable de pagos, suscripciones y canjes.
3. **Pasarela de pago (futura):** integrar un proveedor de cobro y webhooks idempotentes reutilizando los modelos de suscripción y pago. No se realizan cobros automáticos en la versión manual.

Las instrucciones de transferencia se configuran desde Superadministración. Los planes no aplican límites funcionales en esta fase. `organizations.status` continúa representando suspensión administrativa; `has_legacy_access` mantiene temporalmente acceso a organizaciones previas hasta la activación de su primera suscripción.
