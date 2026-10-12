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

if [ ! -f vendor/autoload.php ]; then
    echo "Instalando dependencias Composer..."
    composer install --no-interaction
fi

echo "Instalando dependencias NPM..."
npm install --force

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
