<?php

namespace App\Http\Middleware;

use App\Support\CompanyMembership;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureApiCompany
{
    public function __construct(
        private readonly CompanyMembership $membership,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
                'data' => null,
            ], 401);
        }

        $this->membership->ensureCurrentCompany($user);
        $user->refresh()->loadMissing('currentCompany');

        if ($user->current_company_id === null || $user->currentCompany === null) {
            return response()->json([
                'success' => false,
                'message' => 'No active company. Create or switch a company first.',
                'data' => null,
            ], 200);
        }

        if (! $user->companies()->where('companies.id', $user->current_company_id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have access to the active company.',
                'data' => null,
            ], 403);
        }

        $request->attributes->set('company', $user->currentCompany);

        return $next($request);
    }
}
