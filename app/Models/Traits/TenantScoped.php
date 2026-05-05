<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Builder;

trait TenantScoped
{
    protected static function bootTenantScoped()
    {
        // Solo aplicar si hay un usuario autenticado y tiene organización
        static::addGlobalScope('organization', function (Builder $builder) {
            // Evaluamos si el usuario existe justo en el momento de armar la consulta SQL
            if (auth()->check() && auth()->user()->organization_id) {
                $builder->where('organization_id', auth()->user()->organization_id);
            }
        });
    }

    // Al crear un nuevo registro, asignar automáticamente la organización actual
    protected static function booted()
    {
        static::creating(function ($model) {
            if (auth()->check() && empty($model->organization_id)) {
                $model->organization_id = auth()->user()->organization_id;
            }
        });
    }
}
