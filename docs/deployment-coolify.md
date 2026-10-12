# Despliegue en Coolify

Esta guía usa un VPS Linux con Coolify ya instalado y una base MySQL nueva. La configuración de desarrollo local sigue en `docker-compose.yml`; Coolify debe usar `docker-compose.production.yml`.

## 1. Preparar el VPS y el dominio

- Ten listo un dominio o subdominio para la aplicación. Apunta un registro DNS `A` a la IP pública del VPS cuando terminen las migraciones y el aprovisionamiento inicial.
- Permite el acceso entrante a los puertos `80` y `443` para el proxy de Coolify y conserva SSH restringido a tus IPs administrativas cuando sea posible.
- Como punto de partida para Coolify, Laravel, MySQL y el build de Vite, considera un VPS con al menos 2 vCPU y 4 GB de RAM. Vigila el uso de disco, memoria y CPU y amplía recursos cuando las métricas lo indiquen.
- Configura un backup externo de MySQL y del volumen de archivos privados de la aplicación. Un volumen Docker persistente por sí solo no es un backup.

## 2. Crear la aplicación Compose en Coolify

1. Conecta el repositorio Git y selecciona la rama que usarás para producción, por ejemplo `main`.
2. Crea un recurso **Docker Compose** desde el repositorio.
3. Usa la raíz del repositorio como directorio base y especifica `docker-compose.production.yml` como archivo Compose.
4. Deja el dominio sin publicar durante el aprovisionamiento inicial. Lo añadirás después de migrar y crear la cuenta Superadmin.
5. No publiques puertos directos para `app` o `db`. La aplicación queda accesible a través del proxy de Coolify; MySQL solo se comunica por la red interna del Compose.

El Compose de producción no incluye phpMyAdmin, Vite ni volúmenes de código fuente. Mantiene los datos en los volúmenes `mysql_data` y `app_storage`.

## 3. Configurar variables y secretos

Configúralos en **Environment Variables** del recurso Compose de Coolify. No los añadas al repositorio.

| Variable | Uso |
|---|---|
| `APP_URL` | URL completa con HTTPS, por ejemplo `https://crm.tudominio.com`. |
| `APP_KEY` | Clave estable de Laravel; se genera una vez y se conserva. |
| `DB_DATABASE` | Nombre de la base de producción. |
| `DB_USERNAME` | Usuario MySQL dedicado a la aplicación; no uses `root`. |
| `DB_PASSWORD` | Contraseña robusta del usuario de aplicación. |
| `DB_ROOT_PASSWORD` | Contraseña independiente para el usuario root de MySQL. |
| `TRUSTED_PROXIES` | Usa `*` para confiar en el proxy interno de Coolify. La app no publica un puerto de host. |
| `PLATFORM_ADMIN_NAME`, `PLATFORM_ADMIN_EMAIL`, `PLATFORM_ADMIN_PHONE`, `PLATFORM_ADMIN_PASSWORD` | Valores temporales para crear el Superadministrador en el paso 5. El password debe tener al menos 12 caracteres. |

`APP_ENV=production`, `APP_DEBUG=false`, MySQL, sesiones seguras y `QUEUE_CONNECTION=sync` ya están declarados por el Compose de producción. No copies `.env.example` a producción ni generes una clave nueva en cada reinicio.

Si necesitas generar una clave, ejecútalo en el contenedor local de desarrollo y copia el resultado en Coolify:

```bash
docker compose exec app php artisan key:generate --show
```

El comando `--show` imprime una clave nueva sin modificar tu `.env` local. Guárdala como secreto `APP_KEY` y no la compartas. Rotarla puede invalidar sesiones y dejar ilegibles datos cifrados con la clave anterior.

## 4. Primer despliegue y migración

Selecciona **Deploy** en Coolify. El contenedor puede arrancar antes de que existan las tablas; no se ejecutan migraciones automáticamente desde el entrypoint de producción.

Cuando la base esté saludable, abre la terminal del servicio `app` en Coolify y ejecuta:

```bash
php artisan migrate --force
```

La base empieza vacía y las migraciones crean el esquema completo. Antes de futuras migraciones, revisa que sean compatibles con la versión que está sirviendo tráfico y toma un backup cuando se trate de cambios relevantes.

## 5. Aprovisionar el Superadministrador

Incluye temporalmente las variables `PLATFORM_ADMIN_*` antes del primer despliegue para que estén disponibles en el contenedor. Después de la migración, ejecuta una sola vez desde la terminal de Coolify:

```bash
php artisan db:seed --class=PlatformSuperAdminSeeder --force
```

El seeder crea la cuenta sin organización y es idempotente. Al terminar, elimina de Coolify las variables `PLATFORM_ADMIN_*` —especialmente la contraseña— y vuelve a desplegar para reconstruir la caché de configuración sin esos valores.

No ejecutes `InitialOrganizationSeeder` en cada arranque de producción. El primer owner puede registrar una organización desde la aplicación; el acceso de una organización nueva se habilita mediante una suscripción o un cupón de prueba.

## 6. Publicar el dominio

Cuando la migración y el aprovisionamiento del Superadministrador hayan terminado:

1. Añade el dominio al servicio `app` en Coolify, con puerto interno `80`.
2. Crea o confirma el registro DNS `A` del dominio hacia la IP del VPS.
3. Activa HTTPS/certificado en Coolify y comprueba el acceso desde navegador.

## 7. Primer uso del SaaS

1. Inicia sesión con el Superadministrador y crea los planes en **Planes**.
2. Configura los datos de transferencia en **Ajustes**.
3. Crea cupones si corresponde.
4. El owner registra su organización, solicita un plan y espera la aprobación manual del pago. Un cupón de prueba habilita acceso inmediato.

## 8. Desarrollo local

En tu computadora, continúa usando `docker-compose.yml`, que conserva Vite y phpMyAdmin para desarrollo:

```bash
docker compose up -d --build
docker compose exec app php artisan test
docker compose exec app npm run build
```

El entrypoint local genera `APP_KEY` solo si todavía está vacío. Las bases y volúmenes locales y de Coolify son independientes; no compartas ni copies el `.env` de desarrollo a producción.

## 9. Publicar cambios

1. Desarrolla y prueba localmente.
2. Comprueba `npm audit` y las pruebas apropiadas antes de publicar.
3. Publica los cambios en la rama que sigue Coolify.
4. Revisa los Deployment Logs y Runtime Logs.
5. Si el cambio agrega migraciones, ejecútalas desde la terminal de `app` antes de depender del nuevo esquema; usa migraciones compatibles con la versión que sigue atendiendo tráfico.
6. Si el despliegue falla, puedes volver a desplegar el commit anterior; esto no revierte automáticamente cambios de base de datos.

Coolify construye una imagen inmutable con dependencias PHP y assets compilados. El entrypoint de producción solo valida el entorno, prepara permisos, genera la caché de configuración y arranca Apache; no instala dependencias, cambia `APP_KEY`, corre migraciones, crea cuentas ni inicia Vite.
