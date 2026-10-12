<?php

namespace App\Http\Requests;

use App\Models\Client;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

abstract class QuoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->organization_id !== null;
    }

    public function rules(): array
    {
        return [
            'recipient_name' => 'required|string|max:255',
            'recipient_email' => 'nullable|email|max:255',
            'recipient_phone' => 'nullable|string|max:40',
            'recipient_address' => 'nullable|string|max:2000',
            'client_id' => [
                'nullable',
                'integer',
                Rule::exists('clients', 'id')->where(fn ($query) => $query
                    ->where('organization_id', $this->user()->organization_id)),
            ],
            'save_client' => 'required|boolean',
            'issued_at' => 'required|date',
            'valid_until' => 'nullable|date|after_or_equal:issued_at',
            'currency' => 'required|in:MXN,USD',
            'discount_type' => 'required|in:none,percent,fixed',
            'discount_value' => [
                'required',
                'numeric',
                'min:0',
                'max:999999999999.99',
                'decimal:0,2',
                Rule::when($this->input('discount_type') === 'percent', ['max:100']),
            ],
            'tax_rate' => 'required|numeric|min:0|max:100|decimal:0,2',
            'items' => 'required|array|min:1|max:50',
            'items.*.description' => 'required|string|max:1000',
            'items.*.quantity' => 'required|numeric|min:0.01|max:10000|decimal:0,2',
            'items.*.unit_price' => 'required|numeric|min:0|max:999999.99|decimal:0,2',
            'notes' => 'nullable|string|max:5000',
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()
                || ! $this->boolean('save_client')
                || $this->filled('client_id')
                || ! $this->filled('recipient_email')) {
                return;
            }

            $email = mb_strtolower(trim((string) $this->input('recipient_email')));
            $exists = Client::query()
                ->where('organization_id', $this->user()->organization_id)
                ->where('email', $email)
                ->exists();

            if ($exists) {
                $validator->errors()->add(
                    'recipient_email',
                    'Ya existe un cliente de la organización con este correo. Búscalo y selecciónalo para reutilizarlo.',
                );
            }
        }];
    }
}
