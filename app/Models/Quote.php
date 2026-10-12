<?php

namespace App\Models;

use App\Models\Traits\TenantScoped;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quote extends Model
{
    use HasFactory, TenantScoped;

    protected $fillable = [
        'organization_id',
        'created_by',
        'client_id',
        'quote_number',
        'recipient_name',
        'recipient_email',
        'recipient_phone',
        'recipient_address',
        'issued_at',
        'valid_until',
        'currency',
        'discount_type',
        'discount_value',
        'subtotal',
        'discount_amount',
        'tax_rate',
        'tax_amount',
        'total',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'issued_at' => 'date:Y-m-d',
            'valid_until' => 'date:Y-m-d',
            'discount_value' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_rate' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function items()
    {
        return $this->hasMany(QuoteItem::class)->orderBy('position');
    }
}
