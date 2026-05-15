<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\User;

class UpdateAgentRequest extends FormRequest
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
        $user = User::where('email', $this->agent->email)->first();
        $userId = $user ? $user->id : null;
        return [
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],

            'phone' => 'nullable|string|max:20',
            'specialty' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive,on_leave',
            'supervisor_id' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
        ];
    }
}
