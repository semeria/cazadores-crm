<?php

namespace App\Services;

class QuoteCalculationService
{
    public function calculate(array $items, string $discountType, string $discountValue, string $taxRate): array
    {
        $normalizedItems = [];
        $subtotalCents = 0;

        foreach ($items as $position => $item) {
            $quantityHundredths = $this->toScaledInteger($item['quantity'], 100);
            $unitPriceCents = $this->toScaledInteger($item['unit_price'], 100);
            $lineTotalCents = intdiv(($quantityHundredths * $unitPriceCents) + 50, 100);
            $subtotalCents += $lineTotalCents;

            $normalizedItems[] = [
                'position' => $position,
                'description' => $item['description'],
                'quantity' => $this->moneyString($quantityHundredths),
                'unit_price' => $this->moneyString($unitPriceCents),
                'line_total' => $this->moneyString($lineTotalCents),
            ];
        }

        $discountValueCents = $this->toScaledInteger($discountValue, 100);
        $discountAmountCents = match ($discountType) {
            'percent' => min($subtotalCents, intdiv(($subtotalCents * min(10000, $discountValueCents)) + 5000, 10000)),
            'fixed' => min($subtotalCents, $discountValueCents),
            default => 0,
        };

        $taxableCents = max(0, $subtotalCents - $discountAmountCents);
        $taxRateHundredths = $this->toScaledInteger($taxRate, 100);
        $taxAmountCents = intdiv(($taxableCents * $taxRateHundredths) + 5000, 10000);

        return [
            'items' => $normalizedItems,
            'subtotal' => $this->moneyString($subtotalCents),
            'discount_amount' => $this->moneyString($discountAmountCents),
            'tax_amount' => $this->moneyString($taxAmountCents),
            'total' => $this->moneyString($taxableCents + $taxAmountCents),
        ];
    }

    private function toScaledInteger(string|int|float $value, int $scale): int
    {
        return (int) round(((float) $value) * $scale, 0, PHP_ROUND_HALF_UP);
    }

    private function moneyString(int $minorUnits): string
    {
        return intdiv($minorUnits, 100).'.'.str_pad((string) ($minorUnits % 100), 2, '0', STR_PAD_LEFT);
    }
}
