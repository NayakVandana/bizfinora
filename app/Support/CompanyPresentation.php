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
