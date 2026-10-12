# Entorno y ejecución

**Resumen:** El repositorio contiene un Compose de desarrollo local y una configuración separada de producción para desplegar Laravel, MySQL y assets compilados en Coolify. La operación real de un VPS desplegado debe comprobarse en su panel y logs.

## Índice

- [Contenedores](#contenedores)
- [Despliegue Coolify](#despliegue-coolify)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Herramientas y puertos](#herramientas-y-puertos)
- [Pendientes de documentar](#pendientes-de-documentar)

## Contenedores

`Dockerfile` y `docker-compose.yml` son para desarrollo local. El entrypoint crea `.env` si hace falta, instala dependencias, genera `APP_KEY` solo si está vacía, ejecuta migraciones y el seeder inicial, inicia Vite y Apache. El Compose publica puertos locales para Apache, Vite, MySQL y phpMyAdmin. No uses ese stack como producción.

`Dockerfile.production`, `.dockerignore`, `docker-compose.production.yml` y `docker/entrypoint.production.sh` definen el stack de producción para Coolify. El Dockerfile construye assets con Node.js 22, instala dependencias de Composer sin paquetes de desarrollo y ejecuta Apache/PHP sin Node. El Compose mantiene MySQL y archivos privados en volúmenes nombrados, no publica MySQL/Vite/phpMyAdmin y expone el servicio web interno para el proxy de Coolify.

El entrypoint de producción exige `APP_KEY`, URL y conexión MySQL, prepara permisos, crea la caché de configuración e inicia Apache. No modifica esquema ni datos al arrancar.

## Despliegue Coolify

Consulta la [guía de despliegue en Coolify](deployment-coolify.md) para dominio, variables, migraciones, aprovisionamiento del Superadministrador, operación y publicación de cambios.

## Variables de entorno

Variables observadas en `.env.example` y la configuración Laravel:

| Grupo | Variables relevantes | Uso |
|---|---|---|
| Aplicación | `APP_NAME`, `APP_ENV`, `APP_KEY`, `APP_DEBUG`, `APP_URL`, `APP_LOCALE`, `APP_FALLBACK_LOCALE` | Identidad, entorno, cifrado, depuración, URL e idioma. |
| Cuenta inicial de desarrollo | `INITIAL_ORGANIZATION_NAME`, `INITIAL_ORGANIZATION_SLUG`, `INITIAL_OWNER_NAME`, `INITIAL_OWNER_EMAIL`, `INITIAL_OWNER_PHONE`, `INITIAL_OWNER_PASSWORD` | La pila local usa `InitialOrganizationSeeder` para una organización de desarrollo. La configuración de producción no la ejecuta. |
| Superadministrador de plataforma | `PLATFORM_ADMIN_NAME`, `PLATFORM_ADMIN_EMAIL`, `PLATFORM_ADMIN_PHONE`, `PLATFORM_ADMIN_PASSWORD` | Secretos temporales para ejecutar explícitamente `php artisan db:seed --class=PlatformSuperAdminSeeder` durante el primer despliegue; no se ejecuta desde ningún entrypoint. Retirar las variables después del aprovisionamiento. La contraseña requiere al menos 12 caracteres. |
| Proxy HTTPS | `TRUSTED_PROXIES` | En producción se configura como `*` porque Coolify es el proxy de entrada y el servicio web no publica un puerto host. En desarrollo se deja sin configurar. |
| Base de datos | `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | Conexión SQL. |
| Sesión | `SESSION_DRIVER`, `SESSION_LIFETIME`, `SESSION_ENCRYPT`, `SESSION_PATH`, `SESSION_DOMAIN` | Sesiones web. |
| Caché/cola | `CACHE_STORE`, `QUEUE_CONNECTION` | Backend para caché y trabajos. |
| Logs | `LOG_CHANNEL`, `LOG_STACK`, `LOG_LEVEL`, `LOG_DEPRECATIONS_CHANNEL` | Registro y nivel de log. |
| Correo | `MAIL_MAILER`, `MAIL_SCHEME`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` | Transporte de correo. `.env.example` usa mailer log. |
| Archivos/servicios | `FILESYSTEM_DISK`, `AWS_*`, `MEMCACHED_HOST`, `REDIS_*` | Configuración disponible; no implica integración funcional activa. |
| Frontend | `VITE_APP_NAME` | Variable expuesta al entorno de compilación Vite. |

No copiar valores de credenciales de archivos de entorno a documentación ni asumir que los valores de ejemplo son seguros para despliegue. En Coolify los valores de producción se cargan en el almacén de variables/secretos, no en `.env.example`.

El seeder de plataforma es idempotente para la cuenta ya aprovisionada. Si el correo configurado pertenece a una cuenta que no es superadministradora, falla de forma explícita y no eleva sus privilegios. El aprovisionamiento debe ejecutarse desde una tarea de despliegue con acceso a secretos; las variables no deben incorporarse al repositorio ni a logs.

El logo de cotizaciones se guarda en el disco privado local de Laravel bajo `storage/app/private/organizations/`. En Coolify, el volumen `app_storage` persiste `storage/app` entre reemplazos de contenedor; el código sirve el logo únicamente a usuarios de la misma organización.

Los PDFs de cotización se generan bajo demanda con `barryvdh/laravel-dompdf` y se transmiten en línea para vista previa o como descarga; no se requiere Chromium ni se persisten los PDF generados. El contenedor PHP incluye las extensiones DOM y GD usadas por el renderizador y el procesamiento de logos.

## Scripts disponibles

**Composer (`composer.json`):**

- `composer test`: limpia configuración y ejecuta `php artisan test`.
- `composer dev`: inicia servidor Artisan, worker `queue:listen` y Vite mediante `concurrently`.
- `composer setup`: instala dependencias, prepara `.env`, genera clave, migra, instala npm y compila. Tiene efectos de instalación y base de datos.

**npm (`package.json`):**

- `npm run dev`: Vite de desarrollo.
- `npm run build`: compilación Vite.

## Herramientas y puertos

El Compose local declara puertos host 8000 para Apache, 5173 para Vite, 3306 para MySQL y 8080 para phpMyAdmin. `vite.config.js` enlaza el servidor de desarrollo en `0.0.0.0`, puerto 5173, HMR en `localhost` y polling de archivos. El Compose de producción no publica puertos host para MySQL ni para la aplicación; Coolify enruta HTTPS a `app:80`.

## Pendientes de documentar

- Despliegue real en el VPS, DNS/TLS, backups y restauración: **Pendiente de validar operativamente**.
- Política de monitorización, RPO/RTO y recuperación ante fallos: **Pendiente de definir**.
