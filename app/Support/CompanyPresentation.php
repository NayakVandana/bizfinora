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
            'tax_id' => $company->tax_id,
            'tax_id_label' => $company->tax_id_label ?? 'VAT no',
            'email' => $company->email,
            'phone' => $company->phone,
            'account_number' => $company->account_number,
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
