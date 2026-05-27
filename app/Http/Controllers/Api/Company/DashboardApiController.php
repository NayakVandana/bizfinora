<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Models\Buyer;
use App\Models\Company;
use App\Models\Invoice;
use App\Support\InvoiceSummary;
use Exception;
use Illuminate\Http\Request;

class DashboardApiController extends Controller
{
    public function postDashboardSummary(Request $request)
    {
        try {
            /** @var Company $company */
            $company = $request->attributes->get('company');

            $base = Invoice::query()->where('company_id', $company->id);

            $statusSummary = InvoiceSummary::forDashboard($base);

            $recent = (clone $base)
                ->with('buyer:id,name,company_name')
                ->orderByDesc('invoice_date')
                ->orderByDesc('id')
                ->limit(5)
                ->get(['id', 'invoice_number', 'status', 'invoice_date', 'total', 'buyer_id', 'created_at'])
                ->map(fn (Invoice $invoice) => [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'status' => $invoice->status,
                    'invoice_date' => $invoice->invoice_date?->format('Y-m-d'),
                    'total' => (float) $invoice->total,
                    'buyer_name' => $invoice->buyer?->company_name
                        ?: $invoice->buyer?->name,
                    'created_at' => $invoice->created_at?->toIso8601String(),
                ])
                ->values()
                ->all();

            return $this->sendJsonResponse(true, 'Dashboard summary fetched successfully.', [
                'invoices' => $statusSummary['invoices'],
                'amounts' => $statusSummary['amounts'],
                'summary' => InvoiceSummary::fromQuery($base),
                'buyers_count' => Buyer::query()
                    ->where('company_id', $company->id)
                    ->count(),
                'recent_invoices' => $recent,
            ], 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
