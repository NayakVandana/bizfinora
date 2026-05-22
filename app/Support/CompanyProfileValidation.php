<?php

namespace App\Support;

use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Validator;

class CompanyProfileValidation
{
    /**
     * @return array<string, mixed>
     */
    public static function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:2000'],
            'gst' => ['nullable', 'string', 'max:15'],
            'pan' => ['nullable', 'string', 'max:10'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:10'],
            'account_number' => ['nullable', 'string', 'max:100'],
            'swift_bic' => ['nullable', 'string', 'max:50'],
            'logo_data_url' => ['nullable', 'string'],
            'seller_notes' => ['nullable', 'string', 'max:5000'],
        ];
    }

    public static function makeValidator(array $data, ?int $companyId = null): Validator
    {
        $validation = Validator::make($data, self::rules());

        IndianMobileValidator::attachAfter($validation);

        if ($companyId !== null) {
            IndianMobileValidator::attachDuplicateCompanyPhone($validation, $companyId);
        }

        self::attachTaxValidators($validation);

        return $validation;
    }

    public static function attachTaxValidators(ValidatorContract $validation): void
    {
        $validation->after(function (ValidatorContract $validator): void {
            if (! $validator->errors()->has('gst')) {
                $gstMessage = IndianTaxIdValidator::messageForGst(
                    $validator->getData()['gst'] ?? null,
                );
                if ($gstMessage !== null) {
                    $validator->errors()->add('gst', $gstMessage);
                }
            }

            if (! $validator->errors()->has('pan')) {
                $panMessage = IndianTaxIdValidator::messageForPan(
                    $validator->getData()['pan'] ?? null,
                );
                if ($panMessage !== null) {
                    $validator->errors()->add('pan', $panMessage);
                }
            }
        });
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    public static function preparePayload(array $validated): array
    {
        $gst = strtoupper(trim((string) ($validated['gst'] ?? '')));
        $pan = strtoupper(trim((string) ($validated['pan'] ?? '')));

        return [
            'name' => trim((string) $validated['name']),
            'address' => trim((string) ($validated['address'] ?? '')) ?: null,
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'gst' => $gst !== '' ? $gst : null,
            'pan' => $pan !== '' ? $pan : null,
            'tax_id' => $gst !== '' ? $gst : null,
            'tax_id_label' => $gst !== '' ? 'GSTIN' : 'GSTIN',
            'account_number' => $validated['account_number'] ?? null,
            'swift_bic' => $validated['swift_bic'] ?? null,
            'logo_data_url' => $validated['logo_data_url'] ?? null,
            'seller_notes' => $validated['seller_notes'] ?? null,
        ];
    }
}
