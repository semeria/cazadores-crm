<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\User;
use App\Models\Activity;
use Illuminate\Database\Eloquent\Factories\Factory;

class ActivityFactory extends Factory
{
    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(), // Crea una org por defecto si no se pasa
            'assigned_user_id' => User::factory(),
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'status' => fake()->randomElement(['pending', 'in_progress', 'completed']),
            'priority' => fake()->randomElement(['low', 'medium', 'high', 'urgent']),
            'position' => fake()->numberBetween(0, 10),
            'due_date' => fake()->optional()->dateTimeBetween('+1 days', '+30 days'),
        ];
    }
}
