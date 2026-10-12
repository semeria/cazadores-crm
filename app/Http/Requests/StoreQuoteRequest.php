<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreQuoteRequest extends QuoteRequest
{
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'folio_mode' => 'required|in:auto,custom',
            'custom_folio' => [
                'nullable',
                'required_if:folio_mode,custom',
                'string',
                'max:64',
                'regex:/^[A-Za-z0-9][A-Za-z0-9._\/-]*$/',
                Rule::unique('quotes', 'quote_number')->where(fn ($query) => $query
                    ->where('organization_id', $this->user()->organization_id)),
            ],
        ];
    }
}
