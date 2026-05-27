<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\InvoiceTemplate;
use App\Support\CompanyMembership;
use App\Support\InvoiceTemplatePresetBuilder;
use App\Support\InvoiceTemplatePresentation;
use App\Support\InvoiceTypes;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class InvoiceTemplateApiController extends Controller
{
    public function postInvoiceTemplatesList(Request $request)
    {
        try {
            /** @var Company $company */
            $company = $request->attributes->get('company');

            $custom = InvoiceTemplate::query()
                ->where('company_id', $company->id)
                ->orderBy('name')
                ->get()
                ->map(fn (InvoiceTemplate $t) => InvoiceTemplatePresentation::format($t))
                ->values()
                ->all();

            $system = array_map(fn (array $type) => [
                'id' => $type['id'],
                'name' => $type['label'],
                'description' => $type['description'],
                'base_invoice_type' => $type['id'],
                'layout' => $type['layout'],
                'is_custom' => false,
                'is_system' => true,
            ], InvoiceTypes::listForApi());

            return $this->sendJsonResponse(true, 'Invoice templates fetched successfully.', [
                'system' => $system,
                'custom' => $custom,
                'default_invoice_type' => $company->default_invoice_type ?? 'standard',
                'default_custom_template_id' => $company->default_custom_template_id,
            ], 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postInvoiceTemplateShow(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $template = $this->findCompanyTemplate($request, (int) $request->input('id'));

            if ($template === null) {
                return $this->sendJsonResponse(false, 'Template not found.', null, 200);
            }

            return $this->sendJsonResponse(
                true,
                'Template fetched successfully.',
                InvoiceTemplatePresentation::format($template),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postInvoiceTemplateStore(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'name' => ['required', 'string', 'max:120'],
                'description' => ['nullable', 'string', 'max:2000'],
                'base_invoice_type' => ['required', 'string', Rule::in(InvoiceTypes::ids())],
                'clone_from_id' => ['nullable', 'integer'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            /** @var Company $company */
            $company = $request->attributes->get('company');
            $user = $request->user();
            $data = $validation->validated();

            if (! $this->userCanManageTemplates($request)) {
                return $this->sendJsonResponse(false, 'Only company owners can create templates.', null, 200);
            }

            $preset = InvoiceTemplatePresetBuilder::fromSystemType($data['base_invoice_type'], $company);

            if (! empty($data['clone_from_id'])) {
                $source = $this->findCompanyTemplate($request, (int) $data['clone_from_id']);
                if ($source === null) {
                    return $this->sendJsonResponse(false, 'Source template not found.', null, 200);
                }
                $preset = $source->preset ?? $preset;
            }

            $template = InvoiceTemplate::query()->create([
                'company_id' => $company->id,
                'user_id' => $user->id,
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'base_invoice_type' => $data['base_invoice_type'],
                'layout' => InvoiceTypes::layoutFor($data['base_invoice_type']),
                'preset' => $preset,
            ]);

            return $this->sendJsonResponse(
                true,
                'Custom template created successfully.',
                InvoiceTemplatePresentation::format($template),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postInvoiceTemplateUpdate(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer'],
                'name' => ['required', 'string', 'max:120'],
                'description' => ['nullable', 'string', 'max:2000'],
                'preset' => ['required', 'array'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            if (! $this->userCanManageTemplates($request)) {
                return $this->sendJsonResponse(false, 'Only company owners can update templates.', null, 200);
            }

            $template = $this->findCompanyTemplate($request, (int) $request->input('id'));

            if ($template === null) {
                return $this->sendJsonResponse(false, 'Template not found.', null, 200);
            }

            $data = $validation->validated();
            $preset = $data['preset'];
            $typeId = $preset['invoice_type'] ?? $template->base_invoice_type;

            $template->update([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'base_invoice_type' => $typeId,
                'layout' => InvoiceTypes::layoutFor($typeId),
                'preset' => $preset,
            ]);

            return $this->sendJsonResponse(
                true,
                'Template saved successfully.',
                InvoiceTemplatePresentation::format($template->fresh()),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postInvoiceTemplateClone(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['nullable', 'integer'],
                'system_type' => ['nullable', 'string', Rule::in(InvoiceTypes::ids())],
                'name' => ['nullable', 'string', 'max:120'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            if (! $this->userCanManageTemplates($request)) {
                return $this->sendJsonResponse(false, 'Only company owners can clone templates.', null, 200);
            }

            /** @var Company $company */
            $company = $request->attributes->get('company');
            $user = $request->user();
            $data = $validation->validated();

            $baseType = 'standard';
            $preset = InvoiceTemplatePresetBuilder::fromSystemType('standard', $company);
            $name = $data['name'] ?? 'Custom template';

            if (! empty($data['id'])) {
                $source = $this->findCompanyTemplate($request, (int) $data['id']);
                if ($source === null) {
                    return $this->sendJsonResponse(false, 'Source template not found.', null, 200);
                }
                $baseType = $source->base_invoice_type;
                $preset = $source->preset ?? $preset;
                $name = $data['name'] ?? ($source->name.' (copy)');
            } elseif (! empty($data['system_type'])) {
                $baseType = $data['system_type'];
                $preset = InvoiceTemplatePresetBuilder::fromSystemType($baseType, $company);
                $meta = InvoiceTypes::get($baseType);
                $name = $data['name'] ?? (($meta['label'] ?? $baseType).' (custom)');
            }

            $template = InvoiceTemplate::query()->create([
                'company_id' => $company->id,
                'user_id' => $user->id,
                'name' => $name,
                'description' => 'Cloned template — customize and save to reuse.',
                'base_invoice_type' => $baseType,
                'layout' => InvoiceTypes::layoutFor($baseType),
                'preset' => $preset,
            ]);

            return $this->sendJsonResponse(
                true,
                'Template cloned successfully.',
                InvoiceTemplatePresentation::format($template),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postInvoiceTemplateDestroy(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            if (! $this->userCanManageTemplates($request)) {
                return $this->sendJsonResponse(false, 'Only company owners can delete templates.', null, 200);
            }

            /** @var Company $company */
            $company = $request->attributes->get('company');
            $template = $this->findCompanyTemplate($request, (int) $request->input('id'));

            if ($template === null) {
                return $this->sendJsonResponse(false, 'Template not found.', null, 200);
            }

            if ($company->default_custom_template_id === $template->id) {
                $company->update(['default_custom_template_id' => null]);
            }

            $template->delete();

            return $this->sendJsonResponse(true, 'Template removed successfully.', null, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postInvoiceTemplateSetDefault(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'custom_template_id' => ['nullable', 'integer'],
                'system_type' => ['nullable', 'string', Rule::in(InvoiceTypes::ids())],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            if (! $this->userCanManageTemplates($request)) {
                return $this->sendJsonResponse(false, 'Only company owners can set default template.', null, 200);
            }

            /** @var Company $company */
            $company = $request->attributes->get('company');
            $data = $validation->validated();

            if (! empty($data['custom_template_id'])) {
                $template = $this->findCompanyTemplate($request, (int) $data['custom_template_id']);
                if ($template === null) {
                    return $this->sendJsonResponse(false, 'Template not found.', null, 200);
                }

                $company->update([
                    'default_custom_template_id' => $template->id,
                    'default_invoice_type' => $template->base_invoice_type,
                    'default_invoice_template' => $template->layout,
                ]);
            } else {
                $typeId = $data['system_type'] ?? 'standard';
                $company->update([
                    'default_custom_template_id' => null,
                    'default_invoice_type' => $typeId,
                    'default_invoice_template' => InvoiceTypes::layoutFor($typeId),
                ]);
            }

            return $this->sendJsonResponse(true, 'Default template updated.', [
                'default_invoice_type' => $company->fresh()->default_invoice_type,
                'default_custom_template_id' => $company->fresh()->default_custom_template_id,
            ], 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    private function findCompanyTemplate(Request $request, int $id): ?InvoiceTemplate
    {
        /** @var Company $company */
        $company = $request->attributes->get('company');

        return InvoiceTemplate::query()
            ->where('company_id', $company->id)
            ->where('id', $id)
            ->first();
    }

    private function userCanManageTemplates(Request $request): bool
    {
        /** @var Company $company */
        $company = $request->attributes->get('company');
        $user = $request->user();
        $membership = $user->companies()->where('companies.id', $company->id)->first();

        return $membership !== null && $membership->pivot->role === CompanyMembership::ROLE_OWNER;
    }
}
