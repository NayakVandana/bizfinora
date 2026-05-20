<?php

namespace App\Http\Middleware;

use App\Support\CompanyMembership;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCurrentCompany
{
    public function __construct(
        private readonly CompanyMembership $membership,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() !== null) {
            $this->membership->ensureCurrentCompany($request->user());
        }

        return $next($request);
    }
}
