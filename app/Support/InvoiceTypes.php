<?php

namespace App\Support;

class InvoiceTypes
{
    /**
     * @return list<string>
     */
    public static function ids(): array
    {
        return array_keys(config('invoice_types.types', []));
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function get(string $id): ?array
    {
        $type = config("invoice_types.types.{$id}");

        return is_array($type) ? $type : null;
    }

    public static function isValid(string $id): bool
    {
        return self::get($id) !== null;
    }

    public static function layoutFor(string $id): string
    {
        return self::get($id)['layout'] ?? 'stripe';
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function listForApi(): array
    {
        $categories = config('invoice_types.categories', []);
        $types = config('invoice_types.types', []);
        $out = [];

        foreach ($types as $id => $type) {
            $category = $type['category'] ?? 'general';
            $out[] = [
                'id' => $id,
                'label' => $type['label'] ?? $id,
                'description' => $type['description'] ?? '',
                'category' => $category,
                'category_label' => $categories[$category] ?? $category,
                'layout' => $type['layout'] ?? 'stripe',
                'title' => $type['title'] ?? 'INVOICE',
                'number_label' => $type['number_label'] ?? 'Invoice #',
                'accent' => $type['accent'] ?? null,
                'header_note' => $type['header_note'] ?? null,
                'tax_type' => $type['tax_type'] ?? null,
                'tax_label' => $type['tax_label'] ?? null,
            ];
        }

        return $out;
    }
}
