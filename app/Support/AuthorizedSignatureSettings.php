<?php

namespace App\Support;

use App\Models\Company;
use Illuminate\Http\Request;

class AuthorizedSignatureSettings
{
    /**
     * @return array<string, mixed>
     */
    public static function fromCompany(Company $company): array
    {
        return [
            'default_show_authorized_signature_on_invoice' => self::defaultOn($company),
        ];
    }

    public static function defaultOn(Company $company): bool
    {
        if ($company->default_show_authorized_signature_on_invoice !== null) {
            return (bool) $company->default_show_authorized_signature_on_invoice;
        }

        return true;
    }

    /**
     * @return array<string, bool>
     */
    public static function defaultFieldVisibility(Company $company): array
    {
        return [
            'authorized_signature' => self::defaultOn($company),
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    public static function prepareUpdatePayload(Request $request, array $validated): array
    {
        $validated['default_show_authorized_signature_on_invoice'] = $request->boolean(
            'default_show_authorized_signature_on_invoice',
        );

        return $validated;
    }
}
