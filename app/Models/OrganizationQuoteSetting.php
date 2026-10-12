<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrganizationQuoteSetting extends Model
{
    protected $fillable = [
        'organization_id',
        'logo_path',
        'quote_prefix',
        'number_padding',
        'next_number',
    ];

    protected function casts(): array
    {
        return [
            'number_padding' => 'integer',
            'next_number' => 'integer',
        ];
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }
}
