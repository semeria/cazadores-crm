---
name: testing
description: Select and run the relevant PHPUnit, Pint, or Vite checks for a Cazadores CRM change, accounting for SQLite test isolation and command side effects.
---

# Verificación del proyecto

Usa esta Skill al planear verificaciones para un cambio. Lee las pruebas afectadas y `../../../docs/project.md`; consulta `composer.json`, `package.json` y `phpunit.xml` según el cambio.

- PHPUnit: `php artisan test --filter=NombreDePrueba` para un caso focalizado; `composer test` para el conjunto backend. El script Composer también ejecuta `config:clear`.
- Formato PHP: `vendor/bin/pint --test`.
- Frontend, CSS o Vite: `npm run build`.
- PHPUnit configura SQLite en memoria; no sustituyas ese entorno ni uses una base de datos real para las pruebas.
- No ejecutes `composer setup`, migraciones contra entornos existentes, ni entrypoints como verificaciones. Advierte si el comando tiene efectos laterales.
- Ejecuta solo las comprobaciones pertinentes y autorizadas por la tarea; informa el comando exacto, resultado y bloqueos.

Para cambios de autorización o multitenencia, selecciona cobertura de acceso permitido y denegado y verifica aislamiento entre organizaciones. No debilites pruebas para acomodar comportamiento defectuoso.
