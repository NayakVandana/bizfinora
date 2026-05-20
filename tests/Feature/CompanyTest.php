<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use App\Support\CompanyMembership;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CompanyTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_additional_company(): void
    {
        $user = User::factory()->create();
        app(CompanyMembership::class)->createForUser($user, 'First Co');

        $response = $this->actingAs($user)->post('/companies', [
            'name' => 'Second Co',
        ]);

        $response->assertRedirect(route('companies.index'));
        $this->assertDatabaseHas('companies', ['name' => 'Second Co']);
        $this->assertEquals(2, $user->companies()->count());
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'current_company_id' => Company::query()->where('name', 'Second Co')->value('id'),
        ]);
    }

    public function test_user_can_switch_company(): void
    {
        $user = User::factory()->create();
        $membership = app(CompanyMembership::class);
        $membership->createForUser($user, 'Alpha');
        $beta = $membership->createForUser($user, 'Beta');

        $response = $this->actingAs($user)->patch(route('companies.switch', $beta));

        $response->assertRedirect();
        $this->assertEquals($beta->id, $user->fresh()->current_company_id);
    }
}
