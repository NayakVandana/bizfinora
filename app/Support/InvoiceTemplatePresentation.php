<?php

namespace App\Support;

use App\Models\InvoiceTemplate;

class InvoiceTemplatePresentation
{
    /**
     * @return array<string, mixed>
     */
    public static function format(InvoiceTemplate $template): array
    {
        $meta = InvoiceTypes::get($template->base_invoice_type);

        return [
            'id' => $template->id,
            'name' => $template->name,
            'description' => $template->description,
            'base_invoice_type' => $template->base_invoice_type,
            'base_type_label' => $meta['label'] ?? $template->base_invoice_type,
            'layout' => $template->layout,
            'preset' => $template->preset ?? [],
            'is_custom' => true,
            'created_at' => $template->created_at?->toIso8601String(),
            'updated_at' => $template->updated_at?->toIso8601String(),
        ];
    }
}
