<?php

namespace App\Services;

use App\Models\Client;
use App\Models\OrganizationQuoteSetting;
use App\Models\Quote;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class QuoteService
{
    public function __construct(private readonly QuoteCalculationService $calculator) {}

    public function create(User $user, array $data): Quote
    {
        return DB::transaction(function () use ($user, $data): Quote {
            $settings = $this->lockSettings($user->organization_id);
            if ($data['folio_mode'] === 'auto') {
                $nextNumber = $settings->next_number;

                do {
                    $quoteNumber = $settings->quote_prefix.str_pad((string) $nextNumber, $settings->number_padding, '0', STR_PAD_LEFT);
                    $nextNumber++;
                } while ($this->folioExists($user->organization_id, $quoteNumber));

                $settings->update(['next_number' => $nextNumber]);
            } else {
                $quoteNumber = trim($data['custom_folio']);

                if ($this->folioExists($user->organization_id, $quoteNumber)) {
                    throw ValidationException::withMessages([
                        'custom_folio' => 'Ese folio ya existe en esta organización.',
                    ]);
                }
            }

            $calculation = $this->calculator->calculate(
                $data['items'],
                $data['discount_type'],
                $data['discount_value'],
                $data['tax_rate'],
            );
            $client = $this->resolveClient($user, $data);

            $quote = Quote::create([
                'organization_id' => $user->organization_id,
                'created_by' => $user->id,
                'client_id' => $client?->id,
                'quote_number' => $quoteNumber,
                ...$this->quoteAttributes($data, $calculation),
            ]);

            $this->replaceItems($quote, $calculation['items']);

            return $quote->load(['items', 'creator:id,name']);
        }, attempts: 3);
    }

    public function update(Quote $quote, array $data): Quote
    {
        return DB::transaction(function () use ($quote, $data): Quote {
            $calculation = $this->calculator->calculate(
                $data['items'],
                $data['discount_type'],
                $data['discount_value'],
                $data['tax_rate'],
            );
            $client = $this->resolveClient(auth()->user(), $data);

            $quote->update([
                ...$this->quoteAttributes($data, $calculation),
                'client_id' => $client?->id,
            ]);
            $quote->items()->delete();
            $this->replaceItems($quote, $calculation['items']);

            return $quote->load(['items', 'creator:id,name']);
        }, attempts: 3);
    }

    private function lockSettings(int $organizationId): OrganizationQuoteSetting
    {
        $now = now();

        DB::table('organization_quote_settings')->insertOrIgnore([
            'organization_id' => $organizationId,
            'quote_prefix' => 'COT-',
            'number_padding' => 6,
            'next_number' => 1,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        return OrganizationQuoteSetting::query()
            ->where('organization_id', $organizationId)
            ->lockForUpdate()
            ->firstOrFail();
    }

    private function folioExists(int $organizationId, string $quoteNumber): bool
    {
        return DB::table('quotes')
            ->where('organization_id', $organizationId)
            ->where('quote_number', $quoteNumber)
            ->exists();
    }

    private function resolveClient(User $user, array $data): ?Client
    {
        if (! empty($data['client_id'])) {
            return Client::query()
                ->where('organization_id', $user->organization_id)
                ->findOrFail($data['client_id']);
        }

        if (! ($data['save_client'] ?? false)) {
            return null;
        }

        $email = isset($data['recipient_email']) && trim($data['recipient_email']) !== ''
            ? mb_strtolower(trim($data['recipient_email']))
            : null;

        if ($email && Client::query()
            ->where('organization_id', $user->organization_id)
            ->where('email', $email)
            ->exists()) {
            throw ValidationException::withMessages([
                'recipient_email' => 'Ya existe un cliente de la organización con este correo. Búscalo y selecciónalo para reutilizarlo.',
            ]);
        }

        return Client::create([
            'organization_id' => $user->organization_id,
            'name' => $data['recipient_name'],
            'email' => $email,
            'phone' => $data['recipient_phone'] ?? null,
            'address' => $data['recipient_address'] ?? null,
        ]);
    }

    private function quoteAttributes(array $data, array $calculation): array
    {
        return [
            'recipient_name' => $data['recipient_name'],
            'recipient_email' => $data['recipient_email'] ?? null,
            'recipient_phone' => $data['recipient_phone'] ?? null,
            'recipient_address' => $data['recipient_address'] ?? null,
            'issued_at' => $data['issued_at'],
            'valid_until' => $data['valid_until'] ?? null,
            'currency' => $data['currency'],
            'discount_type' => $data['discount_type'],
            'discount_value' => $data['discount_type'] === 'none' ? '0.00' : $data['discount_value'],
            'subtotal' => $calculation['subtotal'],
            'discount_amount' => $calculation['discount_amount'],
            'tax_rate' => $data['tax_rate'],
            'tax_amount' => $calculation['tax_amount'],
            'total' => $calculation['total'],
            'notes' => $data['notes'] ?? null,
        ];
    }

    private function replaceItems(Quote $quote, array $items): void
    {
        foreach ($items as $item) {
            $quote->items()->create($item);
        }
    }
}
