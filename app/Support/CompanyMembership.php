<?php

namespace App\Support;

use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CompanyMembership
{
    public const ROLE_OWNER = 'owner';

    public function attachOwner(User $user, Company $company): void
    {
        if (! $user->companies()->where('companies.id', $company->id)->exists()) {
            $user->companies()->attach($company->id, ['role' => self::ROLE_OWNER]);
        }

        $user->forceFill(['current_company_id' => $company->id])->save();
    }

    public function createForUser(User $user, string $name): Company
    {
        return DB::transaction(function () use ($user, $name) {
            $company = Company::query()->create([
                'name' => $name,
                'slug' => Company::uniqueSlugFromName($name),
            ]);

            $this->attachOwner($user, $company);

            return $company;
        });
    }

    public function ensureCurrentCompany(User $user): void
    {
        if ($user->current_company_id !== null
            && $user->companies()->where('companies.id', $user->current_company_id)->exists()) {
            return;
        }

        $first = $user->companies()->orderBy('companies.name')->first();

        if ($first !== null) {
            $user->forceFill(['current_company_id' => $first->id])->save();
        }
    }

    public function switchTo(User $user, Company $company): void
    {
        if (! $user->companies()->where('companies.id', $company->id)->exists()) {
            abort(403);
        }

        $user->forceFill(['current_company_id' => $company->id])->save();
    }
}
