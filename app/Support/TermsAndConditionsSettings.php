<?php

namespace App\Support;

use App\Models\Company;
use Illuminate\Http\Request;

class TermsAndConditionsSettings
{
    /**
     * @return array<string, mixed>
     */
    public static function fromCompany(Company $company): array
    {
        return [
            'default_terms_and_conditions' => $company->default_terms_and_conditions,
            'default_show_terms_on_invoice' => self::termsDefaultOn($company),
        ];
    }

    public static function termsDefaultOn(Company $company): bool
    {
        if ($company->default_show_terms_on_invoice !== null) {
            return (bool) $company->default_show_terms_on_invoice;
        }

        return true;
    }

    /**
     * @return array<string, bool>
     */
    public static function defaultFieldVisibility(Company $company): array
    {
        return [
            'terms_and_conditions' => self::termsDefaultOn($company),
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    public static function prepareUpdatePayload(Request $request, array $validated): array
    {
        $validated['default_show_terms_on_invoice'] = $request->boolean(
            'default_show_terms_on_invoice',
        );

        return $validated;
    }
}
