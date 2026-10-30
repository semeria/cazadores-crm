---
name: architecture
description: Trace a Cazadores CRM feature across Laravel, Inertia, React, authorization, and tenant boundaries before changing its design or contracts.
---

# Análisis de arquitectura

Usa esta Skill para entender un módulo o evaluar un cambio que cruce capas. No cargues documentación general que no corresponda a la tarea.

1. Lee `../../../docs/architecture.md` y, si hace falta, `../../../docs/decisions.md`.
2. Sigue el flujo concreto desde `routes/` hasta middleware, controlador, request, policy, modelo/servicio y página JSX; revisa migraciones y pruebas relacionadas.
3. Para UI, contratos o persistencia, consulta solo el documento pertinente: `ui.md`, `api.md`, `auth.md` o `database.md`.
4. Distingue usuario (`users.id`) de agente (`agents.id`) y verifica roles y relaciones en esquema y código.
5. Describe lo confirmado por el código, los límites o contradicciones y los archivos implicados. Señala lo no documentado como pendiente; no infieras funcionalidad.

No cambies comportamiento durante un análisis. Si el usuario solicita implementación, aplica el cambio mínimo y conserva autorización, aislamiento por organización y contratos Inertia.
