<?php

namespace App\Models;

use App\Models\Traits\TenantScoped;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory, TenantScoped;

    protected $fillable = [
        'organization_id',
        'name',
        'email',
        'phone',
        'address',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function quotes()
    {
        return $this->hasMany(Quote::class);
    }
}
