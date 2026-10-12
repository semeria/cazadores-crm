<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeamMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        $teamMember = $this->route('teamMember');

        return $this->user()?->isOwner()
            && $teamMember instanceof User
            && $teamMember->organization_id === $this->user()->organization_id
            && $teamMember->id !== $this->user()->id
            && in_array($teamMember->role, [User::ROLE_MEMBER, User::ROLE_AGENT], true);
    }

    public function rules(): array
    {
        $teamMember = $this->route('teamMember');

        return [
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($teamMember?->id)],
            'phone' => 'required|string|max:20',
            'role' => ['required', Rule::in([User::ROLE_MEMBER, User::ROLE_AGENT])],
            'is_active' => 'required|boolean',
            'position' => 'nullable|string|max:255',
            'manager_id' => [
                'nullable',
                Rule::notIn([$teamMember?->id]),
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
