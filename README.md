# Cazadores CRM

CRM multiorganización construido con Laravel, React, Inertia y MySQL.

## Desarrollo local con Docker

Requisitos: Docker Desktop (o Docker Engine) y Docker Compose v2.

1. Clona el repositorio y, desde su carpeta raíz, crea la configuración local:

   ```bash
   cp .env.example .env
   ```

   En Windows PowerShell puedes usar `Copy-Item .env.example .env`. Antes del primer arranque, define `INITIAL_OWNER_PASSWORD` en `.env` con al menos 8 caracteres; el seeder local lo exige para crear la cuenta inicial. `.env.example` define MySQL en el servicio `db` y credenciales locales de ejemplo. No reutilices esos valores en producción.

2. Construye e inicia la aplicación:

   ```bash
   docker compose up -d --build
   ```

   El primer arranque instala dependencias, genera `APP_KEY` si falta, ejecuta migraciones y crea la organización/usuario inicial de desarrollo. Las siguientes ejecuciones reutilizan las dependencias mientras no cambien `composer.lock` o `package-lock.json`.

3. Abre:

   - Aplicación: <http://localhost:8000>
   - Vite: <http://localhost:5173>
   - phpMyAdmin: <http://localhost:8080> (servidor `db`)
   - MySQL desde el host: `127.0.0.1:3306`

   Para cambiar el puerto MySQL publicado, define `DB_FORWARD_PORT` en `.env`. Para configurar otra contraseña local de base de datos, define `DB_PASSWORD` y `DB_ROOT_PASSWORD` con valores coincidentes con la configuración del proyecto antes del primer arranque.

Comandos útiles:

```bash
docker compose logs -f app
docker compose exec app php artisan test
docker compose exec app php artisan migrate
docker compose down
```

El Compose local conserva base de datos y dependencias en volúmenes. `docker compose down` detiene y elimina contenedores/red; no elimina esos volúmenes.

## Producción

La configuración productiva es `docker-compose.production.yml` junto con `Dockerfile.production`. El procedimiento documentado y soportado en este repositorio es desplegarla desde Coolify:

1. Conecta el repositorio en Coolify y crea un recurso **Docker Compose** desde la raíz.
2. Selecciona `docker-compose.production.yml` como archivo Compose.
3. Configura en Coolify los secretos y variables requeridos: `APP_KEY`, `APP_URL`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` y `DB_ROOT_PASSWORD`. Usa claves y contraseñas exclusivas y robustas. Para crear el Superadministrador, configura temporalmente las variables `PLATFORM_ADMIN_*` descritas en la guía.
4. Despliega y sigue la guía para ejecutar migraciones, aprovisionar el Superadministrador y asociar el dominio con HTTPS:
   [Guía completa de despliegue en Coolify](docs/deployment-coolify.md).

La configuración de producción no publica MySQL ni phpMyAdmin, no ejecuta migraciones automáticamente y no usa Vite en el contenedor de ejecución. No uses `docker-compose.yml` ni los valores de `.env.example` para producción.

## Documentación

- [Entorno y ejecución](docs/deployment.md)
- [Arquitectura](docs/architecture.md)
- [Base de datos](docs/database.md)
