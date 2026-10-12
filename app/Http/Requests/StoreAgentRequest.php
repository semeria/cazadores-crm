<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAgentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',

            'phone' => 'nullable|string|max:20',
            'specialty' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive,on_leave',
            'supervisor_id' => [
                'nullable',
                Rule::exists('users', 'id')->where(fn ($query) => $query
                    ->where('organization_id', $this->user()->organization_id)
                    ->whereIn('role', [User::ROLE_OWNER, User::ROLE_MEMBER])
                    ->where('is_active', true)),
            ],
            'notes' => 'nullable|string',
        ];
    }
}
