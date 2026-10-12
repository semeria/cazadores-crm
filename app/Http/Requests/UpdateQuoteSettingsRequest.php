<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuoteSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isOwner() ?? false;
    }

    public function rules(): array
    {
        return [
            'quote_prefix' => ['required', 'string', 'max:20', 'regex:/^[A-Za-z0-9._\/-]+$/'],
            'number_padding' => 'required|integer|min:1|max:12',
            'logo' => 'nullable|image|mimes:png,jpg,jpeg,webp|max:4096',
            'remove_logo' => 'sometimes|boolean',
        ];
    }
}
