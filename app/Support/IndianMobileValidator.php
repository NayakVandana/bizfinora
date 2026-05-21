<?php

namespace App\Support;

use App\Models\Buyer;
use App\Models\Company;
use Illuminate\Contracts\Validation\Validator;

class IndianMobileValidator
{
    public static function digitsOnly(mixed $phone): string
    {
        return preg_replace('/\D+/', '', trim((string) $phone)) ?? '';
    }

    public static function normalize(mixed $phone): ?string
    {
        $digits = self::digitsOnly($phone);

        if ($digits === '') {
            return null;
        }

        if (strlen($digits) === 10 && preg_match('/^[6-9]\d{9}$/', $digits)) {
            return $digits;
        }

        return null;
    }

    public static function messageFor(mixed $phone): ?string
    {
        $trimmed = trim((string) $phone);

        if ($trimmed === '') {
            return null;
        }

        $digits = self::digitsOnly($trimmed);

        if (strlen($digits) !== 10) {
            return 'Enter exactly 10-digit mobile number.';
        }

        if (! preg_match('/^[6-9]\d{9}$/', $digits)) {
            return 'Enter a valid Indian mobile number starting with 6–9.';
        }

        return null;
    }

    public static function attachAfter(Validator $validator, string $attribute = 'phone'): void
    {
        $validator->after(function (Validator $validator) use ($attribute): void {
            if ($validator->errors()->has($attribute)) {
                return;
            }

            $value = $validator->getData()[$attribute] ?? null;
            $trimmed = trim((string) $value);

            if ($trimmed === '') {
                return;
            }

            $message = self::messageFor($value);

            if ($message !== null) {
                $validator->errors()->add($attribute, $message);

                return;
            }

            $normalized = self::normalize($value);
            $data = $validator->getData();
            $data[$attribute] = $normalized;
            $validator->setData($data);
        });
    }

    public static function attachDuplicateBuyerPhone(
        Validator $validator,
        int $companyId,
        ?int $excludeBuyerId = null,
        string $attribute = 'phone',
    ): void {
        $validator->after(function (Validator $validator) use ($companyId, $excludeBuyerId, $attribute): void {
            if ($validator->errors()->has($attribute)) {
                return;
            }

            $normalized = self::normalize($validator->getData()[$attribute] ?? null);

            if ($normalized === null) {
                return;
            }

            $message = self::duplicateBuyerPhoneMessage($companyId, $normalized, $excludeBuyerId);

            if ($message !== null) {
                $validator->errors()->add($attribute, $message);
            }
        });
    }

    public static function attachDuplicateCompanyPhone(
        Validator $validator,
        int $companyId,
        string $attribute = 'phone',
    ): void {
        $validator->after(function (Validator $validator) use ($companyId, $attribute): void {
            if ($validator->errors()->has($attribute)) {
                return;
            }

            $normalized = self::normalize($validator->getData()[$attribute] ?? null);

            if ($normalized === null) {
                return;
            }

            $message = self::duplicateCompanyPhoneMessage($companyId, $normalized);

            if ($message !== null) {
                $validator->errors()->add($attribute, $message);
            }
        });
    }

    public static function duplicateBuyerPhoneMessage(
        int $companyId,
        string $normalizedPhone,
        ?int $excludeBuyerId = null,
    ): ?string {
        $buyers = Buyer::query()
            ->where('company_id', $companyId)
            ->whereNotNull('phone')
            ->when($excludeBuyerId !== null, fn ($q) => $q->where('id', '!=', $excludeBuyerId))
            ->get(['id', 'phone']);

        foreach ($buyers as $buyer) {
            if (self::normalize($buyer->phone) === $normalizedPhone) {
                return 'This mobile number is already used by another buyer.';
            }
        }

        $company = Company::query()->find($companyId);

        if ($company !== null && self::normalize($company->phone) === $normalizedPhone) {
            return 'This mobile number is already used on your company profile.';
        }

        return null;
    }

    public static function duplicateCompanyPhoneMessage(
        int $companyId,
        string $normalizedPhone,
    ): ?string {
        $buyers = Buyer::query()
            ->where('company_id', $companyId)
            ->whereNotNull('phone')
            ->get(['id', 'phone']);

        foreach ($buyers as $buyer) {
            if (self::normalize($buyer->phone) === $normalizedPhone) {
                return 'This mobile number is already used by a buyer.';
            }
        }

        return null;
    }
}
