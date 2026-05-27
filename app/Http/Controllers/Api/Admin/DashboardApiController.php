<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Invoice;
use App\Models\User;
use App\Support\InvoiceSummary;
use Exception;
use Illuminate\Http\Request;

class DashboardApiController extends Controller
{
    public function postDashboardSummary(Request $request)
    {
        try {
            return $this->sendJsonResponse(true, 'Dashboard summary fetched successfully.', [
                'users_count' => User::query()->count(),
                'companies_count' => Company::query()->count(),
                'invoices' => InvoiceSummary::fromQuery(Invoice::query()),
            ], 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
