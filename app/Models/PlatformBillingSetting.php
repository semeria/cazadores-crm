<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformBillingSetting extends Model
{
    protected $fillable = [
        'transfer_instructions',
        'registrations_enabled',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'registrations_enabled' => 'boolean',
        ];
    }

    public static function registrationsEnabled(): bool
    {
        return (bool) (static::query()->value('registrations_enabled') ?? true);
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
