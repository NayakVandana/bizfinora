<?php

namespace App\Support;

use App\Models\Buyer;
use App\Models\Company;
use App\Models\Invoice;
use App\Models\InvoiceLineItem;

class InvoiceDocumentMapper
{
    /**
     * @return array<string, mixed>
     */
    public static function sellerFromCompany(Company $company): array
    {
        return [
            'name' => $company->name,
            'email' => $company->email,
            'phone' => $company->phone,
            'tax_id' => $company->tax_id,
            'tax_id_label' => $company->tax_id_label ?? 'VAT no',
            'address' => $company->address,
            'account_number' => $company->account_number,
            'swift_bic' => $company->swift_bic,
            'notes' => $company->seller_notes,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function buyerToParty(Buyer $buyer): array
    {
        $address = $buyer->address;
        if ($address === null || $address === '') {
            $address = collect([
                $buyer->address_line1,
                $buyer->address_line2,
                trim(implode(', ', array_filter([$buyer->city, $buyer->state, $buyer->postal_code]))),
                $buyer->country,
            ])->filter()->implode("\n");
        }

        return [
            'name' => $buyer->name,
            'email' => $buyer->email,
            'phone' => $buyer->phone,
            'tax_id' => $buyer->tax_id,
            'tax_id_label' => $buyer->tax_id_label ?? 'VAT no',
            'address' => $address,
            'account_number' => $buyer->account_number,
            'swift_bic' => $buyer->swift_bic,
            'notes' => $buyer->notes,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function invoiceToDraft(Invoice $invoice): array
    {
        $document = $invoice->document ?? [];

        return [
            'id' => $invoice->id,
            'buyer_id' => $invoice->buyer_id,
            'invoice_number' => $invoice->invoice_number,
            'invoice_number_label' => $invoice->invoice_number_label ?? 'Invoice #',
            'status' => $invoice->status,
            'issue_date' => $invoice->issue_date?->format('Y-m-d'),
            'due_date' => $invoice->due_date?->format('Y-m-d') ?? '',
            'date_of_service' => $invoice->date_of_service?->format('Y-m-d') ?? '',
            'currency' => $invoice->currency,
            'language' => $invoice->language,
            'date_format' => $invoice->date_format ?? 'YYYY-MM-DD',
            'template' => $invoice->template,
            'tax_type' => $invoice->tax_type,
            'tax_label' => $invoice->tax_label,
            'tax_rate' => (float) $invoice->tax_rate,
            'tax_calculation_mode' => $invoice->tax_calculation_mode ?? 'exclusive',
            'tax_per_line' => (bool) $invoice->tax_per_line,
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
            'document' => array_merge([
                'seller' => $document['seller'] ?? self::sellerFromCompany($invoice->company),
                'buyer' => $document['buyer'] ?? [],
                'items' => $document['items'] ?? [],
                'notes' => $document['notes'] ?? '',
                'payment_terms' => $document['payment_terms'] ?? '',
                'logo_data_url' => $document['logo_data_url'] ?? $invoice->company?->logo_data_url,
                'qr_payload' => $invoice->qr_code_data,
            ], $document),
        ];
    }

    /**
     * @param  list<array<string, mixed>>  $items
     */
    public static function syncLineItems(Invoice $invoice, array $items): void
    {
        $invoice->lineItems()->delete();

        foreach ($items as $index => $item) {
            $qty = max(0, (float) ($item['quantity'] ?? 0));
            $price = max(0, (float) ($item['unit_price'] ?? 0));
            $lineGross = round($qty * $price, 2);
            $rate = isset($item['tax_rate']) && $item['tax_rate'] !== null
                ? (float) $item['tax_rate']
                : null;
            $lineTax = (float) ($item['line_tax'] ?? 0);

            InvoiceLineItem::query()->create([
                'invoice_id' => $invoice->id,
                'sort_order' => $index,
                'description' => $item['description'] ?? '',
                'quantity' => $qty,
                'unit' => $item['unit'] ?? null,
                'unit_price' => $price,
                'tax_rate' => $rate,
                'line_total' => $lineGross,
                'line_tax' => $lineTax,
            ]);
        }
    }
}
