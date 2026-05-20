<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Support\CompanyMembership;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(
        private readonly CompanyMembership $membership,
    ) {}

    public function register(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            $this->membership->createForUser($user, $data['company_name']);

            return $user->fresh(['currentCompany']);
        });
    }

    public function attemptLogin(string $email, string $password): ?User
    {
        $user = User::query()->where('email', $email)->first();

        if ($user === null || ! Hash::check($password, $user->password)) {
            return null;
        }

        $this->membership->ensureCurrentCompany($user);

        return $user->fresh(['currentCompany']);
    }

    public function createApiToken(User $user, string $name = 'api'): string
    {
        return $user->createToken($name)->plainTextToken;
    }
}
