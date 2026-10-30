---
name: code-review
description: Review Cazadores CRM changes for correctness, authorization, organization isolation, Laravel-Inertia contracts, and missing behavioral coverage without modifying files.
---

# Revisión de cambios

1. Inspecciona `git status` y el diff objetivo; no alteres cambios locales.
2. Carga `../../../docs/architecture.md` y el documento del módulo afectado. Sigue rutas, validación, autorización, persistencia y consumidor frontend.
3. Prioriza fallos concretos: acceso entre organizaciones, permisos ausentes, identidad `User`/`Agent` confundida, asignaciones fuera del tenant, escritura con datos no validados, cambios de esquema incompatibles y contratos Inertia rotos.
4. Contrasta comportamiento y permisos con pruebas relevantes; no trates comentarios, código inactivo o pruebas aisladas como funcionalidad vigente.
5. Reporta primero hallazgos accionables con severidad, archivo/línea y escenario de impacto. Distingue hallazgos de preguntas y resume después cobertura faltante.

No corrijas el código durante una revisión salvo que el usuario pida también implementar las correcciones. No inventes hallazgos ni declares verificaciones que no ejecutaste.
