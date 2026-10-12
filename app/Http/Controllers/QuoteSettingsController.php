<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateQuoteSettingsRequest;
use App\Models\OrganizationQuoteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Throwable;

class QuoteSettingsController extends Controller
{
    public function edit(Request $request)
    {
        $organization = $request->user()->organization;
        abort_unless($organization, 403);
        $settings = OrganizationQuoteSetting::query()
            ->where('organization_id', $organization->id)
            ->first();

        if ($settings) {
            Gate::authorize('view', $settings);
        }

        return Inertia::render('Quotes/Settings/Edit', [
            'organization' => $organization->only(['id', 'name']),
            'settings' => [
                'quote_prefix' => $settings?->quote_prefix ?? 'COT-',
                'number_padding' => $settings?->number_padding ?? 6,
                'has_logo' => (bool) $settings?->logo_path,
                'logo_url' => $settings?->logo_path ? route('quotes.organization-logo') : null,
            ],
        ]);
    }

    public function update(UpdateQuoteSettingsRequest $request)
    {
        $organizationId = $request->user()->organization_id;
        abort_unless($organizationId, 403);
        $settings = OrganizationQuoteSetting::firstOrCreate(
            ['organization_id' => $organizationId],
            ['quote_prefix' => 'COT-', 'number_padding' => 6, 'next_number' => 1],
        );
        Gate::authorize('update', $settings);

        $data = $request->validated();
        $oldLogoPath = $settings->logo_path;
        $newLogoPath = null;

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $newLogoPath = $file->storeAs(
                "organizations/{$organizationId}/quote-logos",
                Str::uuid().'.'.$file->extension(),
                'local',
            );

            if (! $newLogoPath) {
                throw new \RuntimeException('No se pudo guardar el logo.');
            }
        }

        $removeLogo = (bool) ($data['remove_logo'] ?? false);

        try {
            DB::transaction(function () use ($settings, $data, $newLogoPath, $removeLogo): void {
                $settings->update([
                    'quote_prefix' => trim($data['quote_prefix']),
                    'number_padding' => $data['number_padding'],
                    'logo_path' => $newLogoPath ?? ($removeLogo ? null : $settings->logo_path),
                ]);
            });
        } catch (Throwable $exception) {
            if ($newLogoPath) {
                Storage::disk('local')->delete($newLogoPath);
            }

            throw $exception;
        }

        if ($oldLogoPath && ($newLogoPath || $removeLogo)) {
            Storage::disk('local')->delete($oldLogoPath);
        }

        return redirect()->route('quotes.settings.edit')->with('success', 'Configuración de cotizaciones guardada.');
    }

    public function logo()
    {
        $settings = OrganizationQuoteSetting::query()
            ->where('organization_id', auth()->user()->organization_id)
            ->firstOrFail();
        Gate::authorize('viewLogo', $settings);

        abort_unless($settings->logo_path && Storage::disk('local')->exists($settings->logo_path), 404);

        return Storage::disk('local')->response($settings->logo_path);
    }
}
