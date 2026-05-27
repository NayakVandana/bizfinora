<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\InvoiceTemplate;
use App\Support\InvoicePresentation;
use App\Support\InvoiceTemplatePresentation;
use App\Support\InvoiceTypes;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class InvoiceTemplateApiController extends Controller
{
    public function postInvoiceTemplatesList(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'company_id' => ['nullable', 'integer'],
                'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
                'current_page' => ['nullable', 'integer', 'min:1'],
                'keyword' => ['nullable', 'string', 'max:120'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            if ($request->filled('company_id')) {
                return $this->companyTemplatesList((int) $request->input('company_id'));
            }

            return $this->globalCustomTemplatesList($request);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postInvoiceTemplatePreview(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'company_id' => ['required', 'integer'],
                'custom_template_id' => ['nullable', 'integer', 'required_without:system_type'],
                'system_type' => ['nullable', 'string', 'required_without:custom_template_id'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $company = Company::query()->find((int) $request->input('company_id'));

            if ($company === null) {
                return $this->sendJsonResponse(false, 'Company not found.', null, 200);
            }

            $seller = InvoicePresentation::sellerFromCompany($company);
            $seller['logo_data_url'] = $company->logo_data_url;

            $taxSettings = [
                'default_tax_type' => $company->default_tax_type ?? 'vat',
                'default_tax_label' => $company->default_tax_label ?? 'VAT',
                'default_tax_rate' => (float) ($company->default_tax_rate ?? 0),
                'tax_calculation_mode' => $company->tax_calculation_mode ?? 'exclusive',
                'tax_per_line' => (bool) ($company->tax_per_line ?? false),
            ];

            if ($request->filled('custom_template_id')) {
                $template = InvoiceTemplate::query()
                    ->where('company_id', $company->id)
                    ->where('id', (int) $request->input('custom_template_id'))
                    ->first();

                if ($template === null) {
                    return $this->sendJsonResponse(false, 'Template not found.', null, 200);
                }

                $formatted = InvoiceTemplatePresentation::format($template);

                return $this->sendJsonResponse(true, 'Template preview fetched successfully.', [
                    'template_name' => $template->name,
                    'invoice_type' => $template->base_invoice_type,
                    'layout' => $template->layout,
                    'preset' => $template->preset ?? [],
                    'seller' => $seller,
                    'tax_settings' => $taxSettings,
                    'base_type_label' => $formatted['base_type_label'] ?? $template->base_invoice_type,
                ], 200);
            }

            $systemType = (string) $request->input('system_type');

            if (! InvoiceTypes::isValid($systemType)) {
                return $this->sendJsonResponse(false, 'Invalid template type.', null, 200);
            }

            $meta = InvoiceTypes::get($systemType);

            return $this->sendJsonResponse(true, 'Template preview fetched successfully.', [
                'template_name' => $meta['label'] ?? $systemType,
                'invoice_type' => $systemType,
                'layout' => InvoiceTypes::layoutFor($systemType),
                'preset' => null,
                'seller' => $seller,
                'tax_settings' => $taxSettings,
                'base_type_label' => $meta['label'] ?? $systemType,
            ], 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    private function companyTemplatesList(int $companyId)
    {
        $company = Company::query()->find($companyId);

        if ($company === null) {
            return $this->sendJsonResponse(false, 'Company not found.', null, 200);
        }

        $custom = InvoiceTemplate::query()
            ->where('company_id', $company->id)
            ->orderBy('name')
            ->get()
            ->map(function (InvoiceTemplate $template) use ($company) {
                $row = InvoiceTemplatePresentation::format($template);
                $row['company_id'] = $company->id;
                $row['company_name'] = $company->name;
                $row['is_default'] = $company->default_custom_template_id === $template->id;

                return $row;
            })
            ->values()
            ->all();

        $system = array_map(function (array $type) use ($company) {
            $isDefault = $company->default_custom_template_id === null
                && ($company->default_invoice_type ?? 'standard') === $type['id'];

            return [
                'id' => $type['id'],
                'name' => $type['label'],
                'description' => $type['description'],
                'base_invoice_type' => $type['id'],
                'base_type_label' => $type['label'],
                'layout' => $type['layout'],
                'is_custom' => false,
                'is_system' => true,
                'company_id' => $company->id,
                'company_name' => $company->name,
                'is_default' => $isDefault,
            ];
        }, InvoiceTypes::listForApi());

        return $this->sendJsonResponse(true, 'Invoice templates fetched successfully.', [
            'system' => $system,
            'custom' => $custom,
            'default_invoice_type' => $company->default_invoice_type ?? 'standard',
            'default_custom_template_id' => $company->default_custom_template_id,
        ], 200);
    }

    private function globalCustomTemplatesList(Request $request)
    {
        $perPage = (int) ($request->input('per_page') ?: 10);
        $currentPage = (int) ($request->input('current_page') ?: 1);

        $query = InvoiceTemplate::query()
            ->with('company:id,name,slug')
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if ($request->filled('keyword')) {
            $keyword = $request->input('keyword');
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', '%'.$keyword.'%')
                    ->orWhere('description', 'like', '%'.$keyword.'%')
                    ->orWhereHas('company', function ($cq) use ($keyword) {
                        $cq->where('name', 'like', '%'.$keyword.'%')
                            ->orWhere('slug', 'like', '%'.$keyword.'%');
                    });
            });
        }

        $paginator = $query->paginate($perPage, ['*'], 'page', $currentPage);

        $paginator->getCollection()->transform(function (InvoiceTemplate $template) {
            $row = InvoiceTemplatePresentation::format($template);
            $row['company_id'] = $template->company_id;
            $row['company_name'] = $template->company?->name;
            $row['company_slug'] = $template->company?->slug;
            $row['is_default'] = $template->company?->default_custom_template_id === $template->id;

            return $row;
        });

        return $this->sendJsonResponse(true, 'Custom templates fetched successfully.', $paginator, 200);
    }
}
