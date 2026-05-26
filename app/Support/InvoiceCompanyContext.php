<?php

namespace App\Support;

use App\Models\Company;

class InvoiceCompanyContext
{
    /** Keys stored on company settings, not on the invoice record. */
    public const DOCUMENT_KEYS = ['payment', 'payment_terms', 'notes'];

    public const VISIBILITY_KEYS = [
        'payment_bank_details',
        'payment_qr',
        'payment_terms',
        'terms_and_conditions',
    ];

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public static function enrichPayload(array $payload, Company $company): array
    {
        $invoiceType = (string) ($payload['invoice_type'] ?? 'standard');
        $document = is_array($payload['document'] ?? null) ? $payload['document'] : [];
        $visibility = is_array($payload['field_visibility'] ?? null)
            ? $payload['field_visibility']
            : [];

        $document['payment'] = PaymentSettings::paymentDocumentFromCompany($company);
        $document['payment_terms'] = PaymentTerms::resolveDefault(
            $company->default_payment_terms,
            $invoiceType,
        );
        $document['notes'] = trim((string) ($company->default_terms_and_conditions ?? ''));

        foreach (array_merge(
            PaymentSettings::defaultFieldVisibility($company),
            TermsAndConditionsSettings::defaultFieldVisibility($company),
        ) as $key => $value) {
            $visibility[$key] = $value;
        }

        $payload['document'] = $document;
        $payload['field_visibility'] = $visibility;
        $payload['payment_settings'] = PaymentSettings::fromCompany($company);
        $payload['payment_defaults'] = PaymentSettings::paymentDocumentFromCompany($company);
        $payload['payment_field_visibility'] = PaymentSettings::defaultFieldVisibility($company);
        $payload['terms_settings'] = TermsAndConditionsSettings::fromCompany($company);
        $payload['terms_field_visibility'] = TermsAndConditionsSettings::defaultFieldVisibility($company);

        return $payload;
    }

    /**
     * @param  array<string, mixed>  $document
     * @return array<string, mixed>
     */
    public static function stripDocument(array $document): array
    {
        foreach (self::DOCUMENT_KEYS as $key) {
            unset($document[$key]);
        }

        return $document;
    }

    /**
     * @param  array<string, bool|mixed>  $visibility
     * @return array<string, mixed>
     */
    public static function stripVisibility(array $visibility): array
    {
        foreach (self::VISIBILITY_KEYS as $key) {
            unset($visibility[$key]);
        }

        return $visibility;
    }
}
