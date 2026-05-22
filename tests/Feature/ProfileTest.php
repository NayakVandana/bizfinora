<?php

namespace Tests\Feature;

use Tests\TestCase;

class ProfileTest extends TestCase
{
    public function test_profile_redirects_to_information_page(): void
    {
        $response = $this->get('/profile');

        $response->assertRedirect('/profile/information');
    }

    public function test_profile_information_page_is_displayed(): void
    {
        $response = $this->get('/profile/information');

        $response->assertOk();
    }

    public function test_profile_password_page_is_displayed(): void
    {
        $response = $this->get('/profile/password');

        $response->assertOk();
    }

    public function test_profile_information_edit_page_is_displayed(): void
    {
        $response = $this->get('/profile/information/edit');

        $response->assertOk();
    }
}
