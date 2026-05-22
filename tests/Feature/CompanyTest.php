<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use App\Support\CompanyMembership;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CompanyTest extends TestCase
{
    use RefreshDatabase;

    private function validCompanyPayload(string $name): array
    {
        return [
            'name' => $name,
            'address' => '123 Test Street',
            'email' => 'company@example.com',
            'phone' => '9876543210',
        ];
    }

    public function test_user_can_create_additional_company_via_api(): void
    {
        $user = User::factory()->create();
        app(CompanyMembership::class)->createForUser($user, ['name' => 'First Co']);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/user/companies/company-store', $this->validCompanyPayload('Second Co'));

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertDatabaseHas('companies', ['name' => 'Second Co']);
        $this->assertEquals(2, $user->companies()->count());
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'current_company_id' => Company::query()->where('name', 'Second Co')->value('id'),
        ]);
    }

    public function test_user_can_switch_company_via_api(): void
    {
        $user = User::factory()->create();
        $membership = app(CompanyMembership::class);
        $membership->createForUser($user, ['name' => 'Alpha']);
        $beta = $membership->createForUser($user, ['name' => 'Beta']);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/user/companies/company-switch', [
            'id' => $beta->id,
        ]);

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertEquals($beta->id, $user->fresh()->current_company_id);
    }
}
