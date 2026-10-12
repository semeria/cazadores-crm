<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTeamMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isOwner() ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'phone' => 'required|string|max:20',
            'role' => ['required', Rule::in([User::ROLE_MEMBER, User::ROLE_AGENT])],
            'is_active' => 'sometimes|boolean',
            'position' => 'nullable|string|max:255',
            'manager_id' => [
                'nullable',
                Rule::exists('users', 'id')->where(fn ($query) => $query
                    ->where('organization_id', $this->user()->organization_id)
                    ->whereIn('role', [User::ROLE_OWNER, User::ROLE_MEMBER])
                    ->where('is_active', true)),
            ],
            'specialty' => 'nullable|string|max:255',
            'agent_status' => ['required_if:role,agent', Rule::in(['active', 'inactive', 'on_leave'])],
            'notes' => 'nullable|string',
        ];
    }
}
