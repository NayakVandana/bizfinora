<?php

namespace App\Support;

class PaymentTerms
{
    /**
     * @return list<array{id: string, label: string, text: string, invoice_types?: list<string>}>
     */
    public static function presets(): array
    {
        return config('payment_terms.presets', []);
    }

    public static function forType(string $typeId): string
    {
        return match ($typeId) {
            'retainer' => 'Advance payment before work begins.',
            'past_due' => 'Overdue — please pay immediately.',
            'receipt' => 'Payment received. Thank you.',
            'commercial', 'export', 'import' => 'Payment within 30 days of invoice date.',
            default => 'Payment due within 14 days.',
        };
    }

    public static function resolveDefault(?string $companyTerms, string $invoiceTypeId): string
    {
        $trimmed = trim((string) $companyTerms);

        if ($trimmed !== '') {
            return $trimmed;
        }

        return self::forType($invoiceTypeId);
    }
}
