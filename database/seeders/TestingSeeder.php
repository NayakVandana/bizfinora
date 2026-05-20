<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use App\Support\CompanyMembership;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestingSeeder extends Seeder
{
    /**
     * Demo accounts for local / QA testing.
     *
     * Password for all accounts: password
     *
     * | Email                 | Companies                                    |
     * |-----------------------|----------------------------------------------|
     * | demo@bizfinora.test   | Bizfinora Demo, Acme Trading (active: Acme)  |
     * | jane@bizfinora.test   | Sunrise Retail (active), member on Acme       |
     * | multi@bizfinora.test  | Northwind, Contoso, Fabrikam (3 companies)   |
     */
    public function run(): void
    {
        $membership = app(CompanyMembership::class);

        $demo = $this->user('demo@bizfinora.test', 'Demo User', isAdmin: true);
        $this->attachCompany($demo, 'Bizfinora Demo', 'bizfinora-demo', CompanyMembership::ROLE_OWNER);
        $this->attachCompany($demo, 'Acme Trading Ltd', 'acme-trading-ltd', CompanyMembership::ROLE_OWNER);
        $membership->switchTo($demo, Company::query()->where('slug', 'acme-trading-ltd')->firstOrFail());

        $jane = $this->user('jane@bizfinora.test', 'Jane Owner');
        $this->attachCompany($jane, 'Sunrise Retail', 'sunrise-retail', CompanyMembership::ROLE_OWNER, setCurrent: true);
        $acme = Company::query()->where('slug', 'acme-trading-ltd')->firstOrFail();
        $this->attachCompany($jane, $acme->name, $acme->slug, 'member');

        $multi = $this->user('multi@bizfinora.test', 'Multi Company User');
        $this->attachCompany($multi, 'Northwind Books', 'northwind-books', CompanyMembership::ROLE_OWNER);
        $this->attachCompany($multi, 'Contoso Services', 'contoso-services', CompanyMembership::ROLE_OWNER);
        $this->attachCompany($multi, 'Fabrikam Logistics', 'fabrikam-logistics', CompanyMembership::ROLE_OWNER);
        $membership->ensureCurrentCompany($multi->fresh());

        $this->command?->info('Testing users seeded (password: password)');
        $this->command?->table(
            ['Email', 'Active company'],
            [
                ['demo@bizfinora.test', $demo->fresh()->currentCompany?->name ?? '—'],
                ['jane@bizfinora.test', $jane->fresh()->currentCompany?->name ?? '—'],
                ['multi@bizfinora.test', $multi->fresh()->currentCompany?->name ?? '—'],
            ],
        );
    }

    private function user(string $email, string $name, bool $isAdmin = false): User
    {
        return User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_admin' => $isAdmin,
            ],
        );
    }

    private function attachCompany(
        User $user,
        string $name,
        string $slug,
        string $role = CompanyMembership::ROLE_OWNER,
        bool $setCurrent = false,
    ): Company {
        $company = Company::query()->firstOrCreate(
            ['slug' => $slug],
            ['name' => $name],
        );

        if ($company->name !== $name) {
            $company->update(['name' => $name]);
        }

        $existing = $user->companies()->where('companies.id', $company->id)->first();

        if ($existing === null) {
            $user->companies()->attach($company->id, ['role' => $role]);
        } elseif ($existing->pivot->role !== $role) {
            $user->companies()->updateExistingPivot($company->id, ['role' => $role]);
        }

        if ($setCurrent) {
            $user->forceFill(['current_company_id' => $company->id])->save();
        }

        return $company;
    }
}
