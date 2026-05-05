<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreActivityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // La autorización real la hace la Policy en el Controlador
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:pending,in_progress,in_review,completed,cancelled',
            'priority' => 'required|in:low,medium,high,urgent',
            'assigned_user_id' => 'nullable|exists:users,id',
            'agent_id' => 'nullable|exists:agents,id',
            'due_date' => 'nullable|date',
        ];
    }
}
