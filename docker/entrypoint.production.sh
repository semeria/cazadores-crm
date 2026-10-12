#!/bin/sh

set -eu

cd /var/www/html

: "${APP_KEY:?APP_KEY must be configured as a Coolify secret}"
: "${APP_URL:?APP_URL must be configured for the production domain}"
: "${DB_HOST:?DB_HOST must be configured}"
: "${DB_DATABASE:?DB_DATABASE must be configured}"
: "${DB_USERNAME:?DB_USERNAME must be configured}"
: "${DB_PASSWORD:?DB_PASSWORD must be configured}"

mkdir -p \
    storage/app/private \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

chown -R www-data:www-data storage/framework storage/logs bootstrap/cache
chmod -R ug+rwX storage/framework storage/logs bootstrap/cache

php artisan config:cache

exec "$@"
