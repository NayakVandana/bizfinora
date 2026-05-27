<?php

namespace App\Support;

use App\Models\User;

class UserPresentation
{
    /**
     * @return array<string, mixed>
     */
    public static function format(User $user, bool $withCompanies = false): array
    {
        $payload = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'address' => $user->address,
            'city' => $user->city,
            'state' => $user->state,
            'postal_code' => $user->postal_code,
            'is_admin' => (bool) $user->is_admin,
            'current_company_id' => $user->current_company_id,
            'email_verified_at' => $user->email_verified_at?->toIso8601String(),
            'created_at' => $user->created_at?->toIso8601String(),
            'updated_at' => $user->updated_at?->toIso8601String(),
        ];

        if ($withCompanies) {
            $payload['current_company'] = CompanyPresentation::formatCurrentForUser($user);
            $payload['companies'] = CompanyPresentation::formatCollectionForUser($user);
        }

        return $payload;
    }
}
