<?php

namespace App\Support;

use App\Models\Buyer;
use App\Models\Company;
use App\Models\Invoice;

class InvoicePresentation
{
    /**
     * @return array<string, mixed>
     */
    public static function formatBuyer(Buyer $buyer): array
    {
        return [
            'id' => $buyer->id,
            'name' => $buyer->name,
            'email' => $buyer->email,
            'phone' => $buyer->phone,
            'tax_id' => $buyer->tax_id,
            'tax_id_label' => $buyer->tax_id_label ?? 'VAT no',
            'address' => $buyer->address,
            'address_line1' => $buyer->address_line1,
            'address_line2' => $buyer->address_line2,
            'city' => $buyer->city,
            'state' => $buyer->state,
            'postal_code' => $buyer->postal_code,
            'country' => $buyer->country,
            'account_number' => $buyer->account_number,
            'swift_bic' => $buyer->swift_bic,
            'notes' => $buyer->notes,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function sellerFromCompany(Company $company): array
    {
        return InvoiceDocumentMapper::sellerFromCompany($company);
    }

    /**
     * @return array<string, mixed>
     */
    public static function format(Invoice $invoice, bool $includeShareUrl = false): array
    {
        $document = $invoice->document ?? [];

        $payload = [
            'id' => $invoice->id,
            'company_id' => $invoice->company_id,
            'buyer_id' => $invoice->buyer_id,
            'invoice_number' => $invoice->invoice_number,
            'invoice_number_label' => $invoice->invoice_number_label ?? 'Invoice #',
            'status' => $invoice->status,
            'issue_date' => $invoice->issue_date?->format('Y-m-d'),
            'due_date' => $invoice->due_date?->format('Y-m-d'),
            'date_of_service' => $invoice->date_of_service?->format('Y-m-d'),
            'currency' => $invoice->currency,
            'language' => $invoice->language,
            'date_format' => $invoice->date_format ?? 'YYYY-MM-DD',
            'template' => $invoice->template,
            'invoice_type' => $invoice->invoice_type ?? 'standard',
            'tax_type' => $invoice->tax_type,
            'tax_label' => $invoice->tax_label,
            'tax_rate' => (float) $invoice->tax_rate,
            'tax_calculation_mode' => $invoice->tax_calculation_mode ?? 'exclusive',
            'tax_per_line' => (bool) $invoice->tax_per_line,
            'tax_breakdown' => $invoice->document['tax_breakdown'] ?? [],
            'payment_method' => $invoice->payment_method,
            'header_notes' => $invoice->header_notes,
            'stripe_pay_url' => $invoice->stripe_pay_url,
            'qr_code_data' => $invoice->qr_code_data,
            'qr_code_description' => $invoice->qr_code_description,
            'person_authorized_receive' => $invoice->person_authorized_receive,
            'person_authorized_issue' => $invoice->person_authorized_issue,
            'discount_amount' => (float) $invoice->discount_amount,
            'vat_summary_visible' => (bool) $invoice->vat_summary_visible,
            'field_visibility' => $invoice->field_visibility ?? [],
            'subtotal' => (float) $invoice->subtotal,
            'tax_amount' => (float) $invoice->tax_amount,
            'total' => (float) $invoice->total,
            'document' => array_merge([
                'seller' => $document['seller'] ?? [],
                'buyer' => $document['buyer'] ?? [],
                'items' => $document['items'] ?? [],
                'notes' => $document['notes'] ?? '',
                'payment_terms' => $document['payment_terms'] ?? '',
                'logo_data_url' => $document['logo_data_url'] ?? null,
                'qr_payload' => $invoice->qr_code_data,
                'discount_amount' => (float) $invoice->discount_amount,
            ], $document),
            'line_items' => $invoice->relationLoaded('lineItems')
                ? $invoice->lineItems->map(fn ($row) => [
                    'id' => $row->id,
                    'description' => $row->description,
                    'quantity' => (float) $row->quantity,
                    'unit' => $row->unit,
                    'unit_price' => (float) $row->unit_price,
                    'line_total' => (float) $row->line_total,
                ])->values()->all()
                : [],
            'buyer' => $invoice->relationLoaded('buyer') && $invoice->buyer
                ? self::formatBuyer($invoice->buyer)
                : null,
            'created_at' => $invoice->created_at?->toIso8601String(),
            'updated_at' => $invoice->updated_at?->toIso8601String(),
        ];

        if ($includeShareUrl && $invoice->share_token) {
            $payload['share_url'] = url('/i/'.$invoice->share_token);
        }

        return $payload;
    }
}
