<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformBillingSetting extends Model
{
    protected $fillable = [
        'transfer_instructions',
        'updated_by',
    ];

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
