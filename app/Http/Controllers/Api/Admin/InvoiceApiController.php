<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Support\InvoicePresentation;
use App\Support\InvoiceSummary;
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
                'buyer_id' => ['nullable', 'integer'],
                'status' => ['nullable', 'string', Rule::in(['draft', 'sent', 'unpaid', 'paid', 'rejected'])],
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
                    'user:id,name,email',
                ])
                ->orderByDesc('invoice_date')
                ->orderByDesc('id');

            if ($request->filled('company_id')) {
                $query->where('company_id', $request->input('company_id'));
            }

            if ($request->filled('buyer_id')) {
                $query->where('buyer_id', $request->input('buyer_id'));
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
                        })
                        ->orWhereHas('user', function ($uq) use ($keyword) {
                            $uq->where('name', 'like', '%'.$keyword.'%')
                                ->orWhere('email', 'like', '%'.$keyword.'%');
                        });
                });
            }

            $summaryQuery = clone $query;

            if ($request->filled('status')) {
                $query->where('status', $request->input('status'));
            }

            $paginator = $query->paginate($perPage, [
                'id',
                'company_id',
                'user_id',
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
                    'user_id' => $invoice->user_id,
                    'user_name' => $invoice->user?->name,
                    'user_email' => $invoice->user?->email,
                    'created_at' => $invoice->created_at?->toIso8601String(),
                    'has_share_link' => $invoice->share_token !== null,
                ];
            });

            return $this->sendJsonResponse(true, 'Invoices fetched successfully.', array_merge(
                $paginator->toArray(),
                ['summary' => InvoiceSummary::fromQuery($summaryQuery)],
            ), 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postInvoiceShow(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $invoice = Invoice::query()
                ->with(['buyer', 'lineItems', 'company'])
                ->find($request->input('id'));

            if ($invoice === null) {
                return $this->sendJsonResponse(false, 'Invoice not found.', null, 200);
            }

            return $this->sendJsonResponse(
                true,
                'Invoice fetched successfully.',
                InvoicePresentation::format($invoice, true),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postInvoiceShareEnable(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $invoice = Invoice::query()->find($request->input('id'));

            if ($invoice === null) {
                return $this->sendJsonResponse(false, 'Invoice not found.', null, 200);
            }

            if ($invoice->share_token === null) {
                $invoice->update(['share_token' => Invoice::generateShareToken()]);
            }

            return $this->sendJsonResponse(
                true,
                'Share link enabled.',
                [
                    'share_url' => url('/i/'.$invoice->fresh()->share_token),
                    'share_token' => $invoice->share_token,
                ],
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
