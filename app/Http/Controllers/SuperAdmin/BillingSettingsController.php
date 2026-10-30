<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\PlatformBillingSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BillingSettingsController extends Controller
{
    public function edit()
    {
        $settings = PlatformBillingSetting::query()->firstOrCreate(['id' => 1]);

        return Inertia::render('SuperAdmin/BillingSettings/Edit', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'transfer_instructions' => ['nullable', 'string', 'max:10000'],
            'registrations_enabled' => ['required', 'boolean'],
        ]);

        PlatformBillingSetting::query()->updateOrCreate(
            ['id' => 1],
            [...$data, 'updated_by' => $request->user()->id],
        );

        return back()->with('success', 'Configuración de plataforma actualizada.');
    }
}
