<?php

namespace App\Support;

class InvoiceCalculator
{
    /**
     * @param  list<array{quantity: float|int, unit_price: float|int, tax_rate?: float|int|null}>  $items
     * @return array{subtotal: float, tax_amount: float, total: float, discount_amount: float, line_totals: list<float>, tax_breakdown: list<array<string, mixed>>}
     */
    public static function calculate(
        array $items,
        float $invoiceTaxRate = 0,
        string $taxType = 'vat',
        float $discountAmount = 0,
        string $calculationMode = 'exclusive',
        bool $taxPerLine = false,
        string $taxLabel = 'Tax',
    ): array {
        return TaxCalculator::calculate(
            $items,
            $invoiceTaxRate,
            $taxType,
            $discountAmount,
            $calculationMode,
            $taxPerLine,
            $taxLabel,
        );
    }
}
