<?php

namespace App\Models;

use App\Models\Traits\TenantScoped;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ActivityComment extends Model
{
    use HasFactory, TenantScoped;

    protected $fillable = ['organization_id', 'activity_id', 'user_id', 'body', 'is_internal'];

    public function activity() {
        return $this->belongsTo(Activity::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}
