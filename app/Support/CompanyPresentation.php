<?php

namespace App\Support;

use App\Models\Company;
use App\Models\User;

class CompanyPresentation
{
    /**
     * @return array<string, mixed>
     */
    public static function format(Company $company, ?string $role = null, bool $isCurrent = false): array
    {
        return [
            'id' => $company->id,
            'name' => $company->name,
            'slug' => $company->slug,
            'role' => $role,
            'is_current' => $isCurrent,
            'address' => $company->address,
            'city' => $company->city,
            'state' => $company->state,
            'postal_code' => $company->postal_code,
            'tax_id' => $company->tax_id,
            'tax_id_label' => $company->tax_id_label ?? 'VAT no',
            'email' => $company->email,
            'phone' => $company->phone,
            'gst' => $company->gst,
            'pan' => $company->pan,
            'account_number' => $company->account_number,
            'account_holder' => $company->account_holder,
            'account_type' => $company->account_type,
            'upi_id' => $company->upi_id,
            'branch_ifsc' => $company->branch_ifsc,
            'branch_name' => $company->branch_name,
            'payment_note' => $company->payment_note,
            'default_payment_terms' => $company->default_payment_terms,
            'default_terms_and_conditions' => $company->default_terms_and_conditions,
            'default_show_terms_on_invoice' => TermsAndConditionsSettings::termsDefaultOn($company),
            'default_show_authorized_signature_on_invoice' => AuthorizedSignatureSettings::defaultOn($company),
            'default_show_payment_on_invoice' => (bool) ($company->default_show_payment_on_invoice ?? true),
            'default_show_bank_details_on_invoice' => PaymentSettings::bankDefaultOn($company),
            'default_show_qr_on_invoice' => PaymentSettings::qrDefaultOn($company),
            'default_show_payment_terms_on_invoice' => PaymentSettings::termsDefaultOn($company),
            'swift_bic' => $company->swift_bic,
            'logo_data_url' => $company->logo_data_url,
            'seller_notes' => $company->seller_notes,
            'default_tax_type' => $company->default_tax_type ?? 'vat',
            'default_tax_label' => $company->default_tax_label ?? 'VAT',
            'default_tax_rate' => (float) ($company->default_tax_rate ?? 0),
            'tax_calculation_mode' => $company->tax_calculation_mode ?? 'exclusive',
            'tax_per_line' => (bool) ($company->tax_per_line ?? false),
            'default_invoice_template' => $company->default_invoice_template ?? 'stripe',
            'default_invoice_type' => $company->default_invoice_type ?? 'standard',
            'default_custom_template_id' => $company->default_custom_template_id,
            'created_at' => $company->created_at?->toIso8601String(),
            'updated_at' => $company->updated_at?->toIso8601String(),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function formatCollectionForUser(User $user): array
    {
        return $user->companies()
            ->get(['companies.id', 'companies.name', 'companies.slug', 'companies.created_at', 'companies.updated_at'])
            ->map(fn (Company $company) => self::format(
                $company,
                $company->pivot->role,
                $company->id === $user->current_company_id,
            ))
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function formatCurrentForUser(User $user): ?array
    {
        $company = $user->currentCompany;

        if ($company === null) {
            return null;
        }

        $pivot = $user->companies()->where('companies.id', $company->id)->first();

        return self::format($company, $pivot?->pivot->role, true);
    }
}
