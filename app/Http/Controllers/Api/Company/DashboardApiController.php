<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Models\Buyer;
use App\Models\Company;
use App\Models\Invoice;
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

            $byStatus = (clone $base)
                ->selectRaw('status, COUNT(*) as count, COALESCE(SUM(total), 0) as amount')
                ->groupBy('status')
                ->get()
                ->keyBy('status');

            $statusCount = fn (string $status): int => (int) ($byStatus->get($status)?->count ?? 0);
            $statusAmount = fn (string $status): float => (float) ($byStatus->get($status)?->amount ?? 0);

            $recent = (clone $base)
                ->with('buyer:id,name,company_name')
                ->orderByDesc('invoice_date')
                ->orderByDesc('id')
                ->limit(5)
                ->get(['id', 'invoice_number', 'status', 'invoice_date', 'total', 'buyer_id'])
                ->map(fn (Invoice $invoice) => [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'status' => $invoice->status,
                    'invoice_date' => $invoice->invoice_date?->format('Y-m-d'),
                    'total' => (float) $invoice->total,
                    'buyer_name' => $invoice->buyer?->company_name
                        ?: $invoice->buyer?->name,
                ])
                ->values()
                ->all();

            return $this->sendJsonResponse(true, 'Dashboard summary fetched successfully.', [
                'invoices' => [
                    'total' => (clone $base)->count(),
                    'draft' => $statusCount('draft'),
                    'sent' => $statusCount('sent'),
                    'paid' => $statusCount('paid'),
                ],
                'amounts' => [
                    'draft' => $statusAmount('draft'),
                    'sent' => $statusAmount('sent'),
                    'paid' => $statusAmount('paid'),
                    'all' => (float) (clone $base)->sum('total'),
                ],
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
