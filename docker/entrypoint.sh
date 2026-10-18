#!/bin/bash

set -e

cd /var/www/html

if [ ! -f .env ]; then
    cp .env.example .env
fi

echo "Configurando permisos..."

mkdir -p storage/logs
mkdir -p bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

chmod 1777 /tmp

composer_lock_hash="$(sha256sum composer.lock | cut -d ' ' -f 1)"
installed_composer_hash="$(cat vendor/.composer-lock-hash 2>/dev/null || true)"

if [ ! -f vendor/autoload.php ] || [ "$composer_lock_hash" != "$installed_composer_hash" ]; then
    echo "Instalando dependencias Composer..."
    composer install --no-interaction
    printf '%s' "$composer_lock_hash" > vendor/.composer-lock-hash
fi

npm_lock_hash="$(sha256sum package-lock.json | cut -d ' ' -f 1)"
installed_npm_hash="$(cat node_modules/.package-lock-hash 2>/dev/null || true)"

if [ ! -d node_modules ] || [ "$npm_lock_hash" != "$installed_npm_hash" ]; then
    echo "Instalando dependencias NPM..."
    npm ci
    printf '%s' "$npm_lock_hash" > node_modules/.package-lock-hash
fi

if ! grep -Eq '^APP_KEY=.+$' .env; then
    echo "Generando APP_KEY local..."
    php artisan key:generate --force
else
    echo "APP_KEY existente; se conserva."
fi

#echo "Limpiando cache de Laravel..."
#php artisan optimize:clear

echo "Ejecutando migraciones..."
php artisan migrate --force

echo "Asegurando organización y usuario inicial..."
php artisan db:seed --class=InitialOrganizationSeeder --force

echo "Iniciando Vite..."
npm run dev -- --host 0.0.0.0 &

echo "Iniciando Apache..."
exec apache2-foreground
