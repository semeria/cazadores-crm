# Reglas globales del proyecto

- Mantén el aislamiento por organización y la autorización del servidor; valida relaciones dentro del tenant.
- No inventes comportamiento: confirma los flujos en el código y la documentación del módulo.
- Respeta los contratos existentes entre Laravel, Inertia y React y limita cada cambio a lo necesario.
- No expongas secretos ni ejecutes operaciones destructivas, despliegues o cambios externos sin autorización explícita.
- No sobrescribas cambios locales ni modifiques dependencias, artefactos generados o archivos de `vendor/` y `node_modules/`.
- Informa con precisión qué verificaciones ejecutaste y sus resultados.

## Referencias por tarea

- Alcance, stack y estructura: [`docs/project.md`](docs/project.md).
- Capas, módulos y aislamiento: [`docs/architecture.md`](docs/architecture.md).
- Patrones observados y decisiones pendientes: [`docs/decisions.md`](docs/decisions.md).
- Contratos y guía específica de interfaz, API, autenticación y base de datos: consulta el documento correspondiente en `docs/`.
- Flujos de pruebas y criterios de revisión bajo demanda: `.opencode/skills/testing/SKILL.md` y `.opencode/skills/code-review/SKILL.md`.
