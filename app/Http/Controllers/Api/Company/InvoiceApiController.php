<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Models\Buyer;
use App\Models\Company;
use App\Models\Invoice;
use App\Support\InvoiceCalculator;
use App\Support\InvoiceTypes;
use App\Support\InvoiceDocumentMapper;
use App\Support\InvoicePresentation;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
                'status' => ['nullable', 'string', Rule::in(['draft', 'sent', 'paid'])],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            /** @var Company $company */
            $company = $request->attributes->get('company');
            $perPage = (int) ($request->input('per_page') ?: 15);
            $currentPage = (int) ($request->input('current_page') ?: 1);

            $query = Invoice::query()
                ->where('company_id', $company->id)
                ->with('buyer:id,name,email')
                ->orderByDesc('invoice_date')
                ->orderByDesc('id');

            if ($request->filled('status')) {
                $query->where('status', $request->input('status'));
            }

            $paginator = $query->paginate($perPage, [
                'id',
                'invoice_number',
                'status',
                'invoice_date',
                'due_date',
                'currency',
                'total',
                'buyer_id',
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
                    'buyer_name' => $invoice->buyer?->name,
                    'has_share_link' => $invoice->share_token !== null,
                ];
            });

            return $this->sendJsonResponse(true, 'Invoices fetched successfully.', $paginator, 200);
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

            $invoice = $this->findCompanyInvoice($request, $request->input('id'));

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

    public function postInvoiceMeta(Request $request)
    {
        try {
            /** @var Company $company */
            $company = $request->attributes->get('company');

            $customPreset = null;
            $defaultTemplateLabel = InvoiceTypes::get($company->default_invoice_type ?? 'standard')['label'] ?? 'Standard Invoice';
            if ($company->default_custom_template_id) {
                $custom = $company->invoiceTemplates()
                    ->where('id', $company->default_custom_template_id)
                    ->first();
                if ($custom) {
                    $customPreset = $custom->preset;
                    $defaultTemplateLabel = $custom->name;
                }
            }

            return $this->sendJsonResponse(true, 'Invoice meta fetched successfully.', [
                'seller' => InvoicePresentation::sellerFromCompany($company),
                'next_invoice_number' => Invoice::nextInvoiceNumber($company->id),
                'currencies' => ['INR'],
                'default_currency' => 'INR',
                'templates' => [
                    ['id' => 'stripe', 'label' => 'Modern (Stripe-style)'],
                    ['id' => 'classic', 'label' => 'Classic'],
                ],
                'invoice_types' => InvoiceTypes::listForApi(),
                'default_invoice_type' => $company->default_invoice_type ?? 'standard',
                'tax_types' => config('tax.types'),
                'tax_calculation_modes' => config('tax.calculation_modes'),
                'tax_settings' => [
                    'default_tax_type' => $company->default_tax_type ?? 'vat',
                    'default_tax_label' => $company->default_tax_label ?? 'VAT',
                    'default_tax_rate' => (float) ($company->default_tax_rate ?? 0),
                    'tax_calculation_mode' => $company->tax_calculation_mode ?? 'exclusive',
                    'tax_per_line' => (bool) ($company->tax_per_line ?? false),
                ],
                'default_template' => $company->default_invoice_template ?? 'stripe',
                'default_custom_template_id' => $company->default_custom_template_id,
                'custom_template_preset' => $customPreset,
                'default_template_label' => $defaultTemplateLabel,
                'default_template_selection' => $company->default_custom_template_id
                    ? 'custom:'.$company->default_custom_template_id
                    : 'system:'.($company->default_invoice_type ?? 'standard'),
            ], 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postInvoiceStore(Request $request)
    {
        return $this->saveInvoice($request);
    }

    public function postInvoiceUpdate(Request $request)
    {
        $validation = Validator::make($request->all(), [
            'id' => ['required', 'integer'],
        ]);

        if ($validation->fails()) {
            return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
        }

        $invoice = $this->findCompanyInvoice($request, $request->input('id'));

        if ($invoice === null) {
            return $this->sendJsonResponse(false, 'Invoice not found.', null, 200);
        }

        return $this->saveInvoice($request, $invoice);
    }

    public function postInvoiceDestroy(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $invoice = $this->findCompanyInvoice($request, $request->input('id'));

            if ($invoice === null) {
                return $this->sendJsonResponse(false, 'Invoice not found.', null, 200);
            }

            $invoice->delete();

            return $this->sendJsonResponse(true, 'Invoice deleted successfully.', null, 200);
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

            $invoice = $this->findCompanyInvoice($request, $request->input('id'));

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

    private function saveInvoice(Request $request, ?Invoice $existing = null)
    {
        try {
            $rules = [
                'buyer_id' => [$existing === null ? 'required' : 'nullable', 'integer'],
                'invoice_number' => ['required', 'string', 'max:50'],
                'status' => ['required', 'string', Rule::in(['draft', 'sent', 'paid'])],
                'invoice_date' => ['required', 'date'],
                'invoice_date_label' => ['nullable', 'string', 'max:50'],
                'due_date' => ['nullable', 'date'],
                'currency' => ['nullable', 'string', Rule::in(['INR'])],
                'language' => ['nullable', 'string', 'max:5'],
                'template' => ['required', 'string', Rule::in(['stripe', 'classic'])],
                'invoice_type' => ['nullable', 'string', Rule::in(InvoiceTypes::ids())],
                'tax_type' => ['required', 'string', Rule::in(['none', 'vat', 'gst', 'sales_tax', 'custom'])],
                'tax_label' => ['nullable', 'string', 'max:50'],
                'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
                'document' => ['required', 'array'],
                'document.seller' => ['required', 'array'],
                'document.buyer' => ['required', 'array'],
                'document.items' => ['required', 'array', 'min:1'],
                'document.items.*.description' => ['required', 'string', 'max:500'],
                'document.items.*.quantity' => ['required', 'numeric', 'min:0'],
                'document.items.*.unit' => ['nullable', 'string', 'max:20'],
                'document.items.*.unit_price' => ['required', 'numeric', 'min:0'],
                'document.items.*.tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
                'tax_calculation_mode' => ['nullable', 'string', Rule::in(['exclusive', 'inclusive'])],
                'tax_per_line' => ['nullable', 'boolean'],
                'invoice_number_label' => ['nullable', 'string', 'max:50'],
                'date_of_service' => ['nullable', 'date'],
                'date_format' => ['nullable', 'string', 'max:20'],
                'payment_method' => ['nullable', 'string', 'max:100'],
                'header_notes' => ['nullable', 'string', 'max:5000'],
                'stripe_pay_url' => ['nullable', 'string', 'max:500'],
                'qr_code_data' => ['nullable', 'string', 'max:500'],
                'qr_code_description' => ['nullable', 'string', 'max:500'],
                'person_authorized_receive' => ['nullable', 'string', 'max:255'],
                'person_authorized_issue' => ['nullable', 'string', 'max:255'],
                'discount_amount' => ['nullable', 'numeric', 'min:0'],
                'vat_summary_visible' => ['nullable', 'boolean'],
                'field_visibility' => ['nullable', 'array'],
            ];

            $validation = Validator::make($request->all(), $rules);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            /** @var Company $company */
            $company = $request->attributes->get('company');
            $data = $validation->validated();
            $document = $data['document'];
            $discount = (float) ($data['discount_amount'] ?? $document['discount_amount'] ?? 0);
            $document['discount_amount'] = $discount;
            $document['qr_payload'] = $data['qr_code_data'] ?? $document['qr_payload'] ?? null;

            $totals = InvoiceCalculator::calculate(
                $document['items'],
                (float) ($data['tax_rate'] ?? 0),
                $data['tax_type'],
                $discount,
                $data['tax_calculation_mode'] ?? 'exclusive',
                (bool) ($data['tax_per_line'] ?? false),
                $data['tax_label'] ?? 'Tax',
            );

            $document['tax_breakdown'] = $totals['tax_breakdown'] ?? [];

            if (! empty($data['buyer_id'])) {
                $buyerExists = Buyer::query()
                    ->where('company_id', $company->id)
                    ->where('id', $data['buyer_id'])
                    ->exists();

                if (! $buyerExists) {
                    return $this->sendJsonResponse(false, 'Buyer not found for this company.', null, 200);
                }
            }

            $invoice = DB::transaction(function () use ($request, $company, $data, $document, $totals, $existing) {
                $attributes = [
                    'company_id' => $company->id,
                    'user_id' => $request->user()->id,
                    'buyer_id' => $data['buyer_id'] ?? null,
                    'invoice_number' => $data['invoice_number'],
                    'invoice_number_label' => $data['invoice_number_label'] ?? 'Invoice #',
                    'status' => $data['status'],
                    'invoice_date' => $data['invoice_date'],
                    'invoice_date_label' => $data['invoice_date_label'] ?? 'Invoice date',
                    'due_date' => $data['due_date'] ?? null,
                    'date_of_service' => $data['date_of_service'] ?? null,
                    'currency' => 'INR',
                    'language' => $data['language'] ?? 'en',
                    'date_format' => $data['date_format'] ?? 'YYYY-MM-DD',
                    'template' => $data['template'],
                    'invoice_type' => $data['invoice_type'] ?? 'standard',
                    'tax_type' => $data['tax_type'],
                    'tax_label' => $data['tax_label'] ?? 'Tax',
                    'tax_rate' => $data['tax_rate'] ?? 0,
                    'tax_calculation_mode' => $data['tax_calculation_mode'] ?? 'exclusive',
                    'tax_per_line' => (bool) ($data['tax_per_line'] ?? false),
                    'payment_method' => $data['payment_method'] ?? null,
                    'header_notes' => $data['header_notes'] ?? null,
                    'stripe_pay_url' => $data['stripe_pay_url'] ?? null,
                    'qr_code_data' => $data['qr_code_data'] ?? $document['qr_payload'] ?? null,
                    'qr_code_description' => $data['qr_code_description'] ?? null,
                    'person_authorized_receive' => $data['person_authorized_receive'] ?? null,
                    'person_authorized_issue' => $data['person_authorized_issue'] ?? null,
                    'discount_amount' => $totals['discount_amount'],
                    'vat_summary_visible' => $data['vat_summary_visible'] ?? true,
                    'field_visibility' => $data['field_visibility'] ?? [],
                    'subtotal' => $totals['subtotal'],
                    'tax_amount' => $totals['tax_amount'],
                    'total' => $totals['total'],
                    'document' => $document,
                ];

                if ($existing !== null) {
                    $existing->update($attributes);
                    InvoiceDocumentMapper::syncLineItems($existing->fresh(), $document['items']);
                    $invoice = $existing->fresh(['buyer', 'lineItems']);

                    return $invoice;
                }

                $created = Invoice::query()->create($attributes);
                InvoiceDocumentMapper::syncLineItems($created, $document['items']);

                return $created->load(['buyer', 'lineItems']);
            });

            $message = $existing !== null
                ? 'Invoice updated successfully.'
                : 'Invoice created successfully.';

            return $this->sendJsonResponse(
                true,
                $message,
                InvoicePresentation::format($invoice, true),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    private function findCompanyInvoice(Request $request, int $id): ?Invoice
    {
        /** @var Company $company */
        $company = $request->attributes->get('company');

        return Invoice::query()
            ->where('company_id', $company->id)
            ->with(['buyer', 'lineItems'])
            ->find($id);
    }
}
