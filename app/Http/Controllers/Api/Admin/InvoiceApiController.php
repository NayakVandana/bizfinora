<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class InvoiceApiController extends Controller
{
    public function postInvoicesList(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
                'current_page' => ['nullable', 'integer', 'min:1'],
                'company_id' => ['nullable', 'integer'],
                'status' => ['nullable', 'string', Rule::in(['draft', 'sent', 'paid'])],
                'keyword' => ['nullable', 'string', 'max:120'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $perPage = (int) ($request->input('per_page') ?: 10);
            $currentPage = (int) ($request->input('current_page') ?: 1);

            $query = Invoice::query()
                ->with([
                    'buyer:id,name,company_name,email,phone',
                    'company:id,name,slug',
                ])
                ->orderByDesc('invoice_date')
                ->orderByDesc('id');

            if ($request->filled('company_id')) {
                $query->where('company_id', $request->input('company_id'));
            }

            if ($request->filled('status')) {
                $query->where('status', $request->input('status'));
            }

            if ($request->filled('keyword')) {
                $keyword = $request->input('keyword');
                $query->where(function ($q) use ($keyword) {
                    $q->where('invoice_number', 'like', '%'.$keyword.'%')
                        ->orWhereHas('buyer', function ($bq) use ($keyword) {
                            $bq->where('name', 'like', '%'.$keyword.'%')
                                ->orWhere('company_name', 'like', '%'.$keyword.'%')
                                ->orWhere('phone', 'like', '%'.$keyword.'%');
                        })
                        ->orWhereHas('company', function ($cq) use ($keyword) {
                            $cq->where('name', 'like', '%'.$keyword.'%')
                                ->orWhere('slug', 'like', '%'.$keyword.'%');
                        });
                });
            }

            $paginator = $query->paginate($perPage, [
                'id',
                'company_id',
                'buyer_id',
                'invoice_number',
                'status',
                'invoice_date',
                'due_date',
                'currency',
                'total',
                'share_token',
                'created_at',
            ], 'page', $currentPage);

            $paginator->getCollection()->transform(function (Invoice $invoice) {
                return [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'status' => $invoice->status,
                    'invoice_date' => $invoice->invoice_date?->format('Y-m-d'),
                    'due_date' => $invoice->due_date?->format('Y-m-d'),
                    'currency' => $invoice->currency,
                    'total' => (float) $invoice->total,
                    'buyer_id' => $invoice->buyer_id,
                    'buyer_name' => $invoice->buyer?->name,
                    'buyer_company_name' => $invoice->buyer?->company_name,
                    'buyer_phone' => $invoice->buyer?->phone,
                    'company_id' => $invoice->company_id,
                    'company_name' => $invoice->company?->name,
                    'company_slug' => $invoice->company?->slug,
                    'created_at' => $invoice->created_at?->toIso8601String(),
                    'has_share_link' => $invoice->share_token !== null,
                ];
            });

            return $this->sendJsonResponse(true, 'Invoices fetched successfully.', $paginator, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
