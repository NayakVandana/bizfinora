<?php

namespace App\Support;

use App\Models\Company;
use Illuminate\Http\Request;

class PaymentSettings
{
    /**
     * @return array<string, mixed>
     */
    public static function fromCompany(Company $company): array
    {
        $legacy = (bool) ($company->default_show_payment_on_invoice ?? true);

        return [
            'account_number' => $company->account_number,
            'account_type' => $company->account_type,
            'account_holder' => $company->account_holder,
            'upi_id' => $company->upi_id,
            'branch_ifsc' => $company->branch_ifsc,
            'branch_name' => $company->branch_name,
            'payment_note' => $company->payment_note,
            'default_payment_terms' => $company->default_payment_terms,
            'payment_terms_presets' => PaymentTerms::presets(),
            'default_show_payment_on_invoice' => $legacy,
            'default_show_bank_details_on_invoice' => self::bankDefaultOn($company),
            'default_show_qr_on_invoice' => self::qrDefaultOn($company),
            'default_show_payment_terms_on_invoice' => self::termsDefaultOn($company),
        ];
    }

    public static function bankDefaultOn(Company $company): bool
    {
        if ($company->default_show_bank_details_on_invoice !== null) {
            return (bool) $company->default_show_bank_details_on_invoice;
        }

        return (bool) ($company->default_show_payment_on_invoice ?? true);
    }

    public static function qrDefaultOn(Company $company): bool
    {
        if ($company->default_show_qr_on_invoice !== null) {
            return (bool) $company->default_show_qr_on_invoice;
        }

        return (bool) ($company->default_show_payment_on_invoice ?? true);
    }

    public static function termsDefaultOn(Company $company): bool
    {
        if ($company->default_show_payment_terms_on_invoice !== null) {
            return (bool) $company->default_show_payment_terms_on_invoice;
        }

        return (bool) ($company->default_show_payment_on_invoice ?? true);
    }

    /**
     * @return array<string, mixed>
     */
    public static function paymentDocumentFromCompany(Company $company): array
    {
        return [
            'account_number' => $company->account_number,
            'account_type' => $company->account_type,
            'account_holder' => $company->account_holder,
            'upi_id' => $company->upi_id,
            'branch_ifsc' => $company->branch_ifsc,
            'branch_name' => $company->branch_name,
            'note' => $company->payment_note,
        ];
    }

    /**
     * @return array<string, bool>
     */
    public static function defaultFieldVisibility(Company $company): array
    {
        return [
            'payment_bank_details' => self::bankDefaultOn($company),
            'payment_qr' => self::qrDefaultOn($company),
            'payment_terms' => self::termsDefaultOn($company),
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    public static function prepareUpdatePayload(Request $request, array $validated): array
    {
        $showBank = $request->boolean('default_show_bank_details_on_invoice');
        $showQr = $request->boolean('default_show_qr_on_invoice');
        $showTerms = $request->boolean('default_show_payment_terms_on_invoice');

        $validated['default_show_bank_details_on_invoice'] = $showBank;
        $validated['default_show_qr_on_invoice'] = $showQr;
        $validated['default_show_payment_terms_on_invoice'] = $showTerms;
        $validated['default_show_payment_on_invoice'] = $showBank || $showQr || $showTerms;

        return $validated;
    }
}
