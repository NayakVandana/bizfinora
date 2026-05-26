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
        $gst = $company->gst ?: $company->tax_id;

        return [
            'name' => $company->name,
            'email' => $company->email,
            'phone' => $company->phone,
            'gst' => $company->gst,
            'pan' => $company->pan,
            'tax_id' => $gst,
            'tax_id_label' => $gst ? 'GSTIN' : ($company->tax_id_label ?? 'GSTIN'),
            'address' => self::formattedAddress(
                $company->address,
                null,
                null,
                $company->city,
                $company->state,
                $company->postal_code,
                null,
            ),
            'city' => $company->city,
            'state' => $company->state,
            'postal_code' => $company->postal_code,
            'account_number' => $company->account_number,
            'swift_bic' => $company->swift_bic,
            'notes' => $company->seller_notes,
        ];
    }

    private static function formattedAddress(
        ?string $address,
        ?string $line1,
        ?string $line2,
        ?string $city,
        ?string $state,
        ?string $postalCode,
        ?string $country,
    ): ?string {
        if ($address !== null && trim($address) !== '') {
            return $address;
        }

        $parts = collect([
            $line1,
            $line2,
            trim(implode(', ', array_filter([$city, $state, $postalCode]))),
            $country,
        ])->filter(fn ($part) => $part !== null && trim($part) !== '');

        $built = $parts->implode("\n");

        return $built !== '' ? $built : null;
    }

    /**
     * @return array<string, mixed>
     */
    public static function buyerToParty(Buyer $buyer): array
    {
        $address = self::formattedAddress(
            $buyer->address,
            $buyer->address_line1,
            $buyer->address_line2,
            $buyer->city,
            $buyer->state,
            $buyer->postal_code,
            $buyer->country,
        );

        $gst = $buyer->gst ?: $buyer->tax_id;

        return [
            'company_name' => $buyer->company_name ?? '',
            'name' => $buyer->name ?? '',
            'email' => $buyer->email,
            'phone' => $buyer->phone,
            'gst' => $buyer->gst,
            'pan' => $buyer->pan,
            'tax_id' => $gst,
            'tax_id_label' => $gst ? 'GSTIN' : ($buyer->tax_id_label ?? 'GSTIN'),
            'address' => $address,
            'city' => $buyer->city,
            'state' => $buyer->state,
            'postal_code' => $buyer->postal_code,
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
        $payload = InvoicePresentation::format($invoice, false);

        unset(
            $payload['line_items'],
            $payload['buyer'],
            $payload['subtotal'],
            $payload['tax_amount'],
            $payload['total'],
        );

        return $payload;
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
