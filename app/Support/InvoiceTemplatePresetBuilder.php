<?php

namespace App\Support;

use App\Models\Company;

class InvoiceTemplatePresetBuilder
{
    /**
     * @return array<string, mixed>
     */
    public static function fromSystemType(string $typeId, ?Company $company = null): array
    {
        $meta = InvoiceTypes::get($typeId) ?? InvoiceTypes::get('standard');
        $taxType = $meta['tax_type'] ?? $company?->default_tax_type ?? 'vat';
        $taxLabel = $meta['tax_label'] ?? $company?->default_tax_label ?? 'GST';
        $taxRate = (float) ($company?->default_tax_rate ?? ($taxType === 'gst' ? 18 : 0));

        if ($taxType === 'none') {
            $taxRate = 0;
        }

        $items = self::sampleItemsForType($typeId, $taxRate);

        return [
            'invoice_number_label' => $meta['number_label'] ?? 'Invoice #',
            'invoice_type' => $typeId,
            'template' => InvoiceTypes::layoutFor($typeId),
            'tax_type' => $taxType,
            'tax_label' => $taxLabel,
            'tax_rate' => $taxRate,
            'tax_calculation_mode' => $company?->tax_calculation_mode ?? 'exclusive',
            'tax_per_line' => (bool) ($company?->tax_per_line ?? false),
            'header_notes' => $meta['header_note'] ?? '',
            'payment_terms' => self::paymentTermsForType($typeId),
            'language' => 'en',
            'date_format' => 'DD/MM/YYYY',
            'vat_summary_visible' => true,
            'field_visibility' => [
                'seller_tax_id' => true,
                'seller_email' => true,
                'seller_phone' => true,
                'seller_bank' => true,
                'buyer_tax_id' => true,
                'buyer_email' => true,
                'buyer_phone' => true,
            ],
            'default_items' => $items,
            'document_notes' => 'Thank you for your business.',
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private static function sampleItemsForType(string $typeId, float $taxRate): array
    {
        $format = match ($typeId) {
            'timesheet' => 'timesheet',
            'gst', 'tax', 'mixed', 'bill_of_supply', 'self_billing' => 'tax',
            'commercial', 'export', 'import', 'consignment' => 'trade',
            default => 'standard',
        };

        if ($format === 'timesheet') {
            return [
                ['description' => 'Development work', 'quantity' => 32, 'unit' => 'hrs', 'unit_price' => 90, 'tax_rate' => $taxRate],
                ['description' => 'Code review', 'quantity' => 8, 'unit' => 'hrs', 'unit_price' => 75, 'tax_rate' => $taxRate],
            ];
        }

        if ($typeId === 'gst') {
            return [
                ['description' => 'SaaS subscription', 'quantity' => 1, 'unit' => '998314', 'unit_price' => 12000, 'tax_rate' => 18],
                ['description' => 'Implementation', 'quantity' => 5, 'unit' => '998313', 'unit_price' => 3500, 'tax_rate' => 18],
            ];
        }

        if ($format === 'trade') {
            return [
                ['description' => 'Goods for export', 'quantity' => 100, 'unit' => 'pcs', 'unit_price' => 250, 'tax_rate' => 0],
            ];
        }

        return [
            ['description' => 'Professional services', 'quantity' => 1, 'unit' => 'pcs', 'unit_price' => 0, 'tax_rate' => $taxRate],
        ];
    }

    private static function paymentTermsForType(string $typeId): string
    {
        return match ($typeId) {
            'retainer' => 'Advance payment before work begins.',
            'past_due' => 'Overdue — please pay immediately.',
            'receipt' => 'Payment received. Thank you.',
            'commercial', 'export', 'import' => 'Payment within 30 days of invoice date.',
            default => 'Payment due within 14 days.',
        };
    }
}
