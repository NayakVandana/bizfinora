<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Support\CompanyMembership;
use App\Support\CompanyPresentation;
use App\Support\CompanyProfileValidation;
use App\Support\InvoiceTypes;
use App\Support\PaymentSettings;
use App\Support\TermsAndConditionsSettings;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CompanyContextApiController extends Controller
{
    public function postCompanyShow(Request $request)
    {
        try {
            /** @var Company $company */
            $company = $request->attributes->get('company');
            $user = $request->user();
            $pivot = $user->companies()->where('companies.id', $company->id)->first();

            return $this->sendJsonResponse(
                true,
                'Active company fetched successfully.',
                CompanyPresentation::format($company, $pivot?->pivot->role, true),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCompanyUpdate(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'name' => ['required', 'string', 'max:255'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            /** @var Company $company */
            $company = $request->attributes->get('company');
            $user = $request->user();
            $membership = $user->companies()->where('companies.id', $company->id)->first();

            if ($membership === null || $membership->pivot->role !== CompanyMembership::ROLE_OWNER) {
                return $this->sendJsonResponse(false, 'Only company owners can update company details.', null, 200);
            }

            $name = $validation->validated()['name'];
            $company->update([
                'name' => $name,
                'slug' => Company::uniqueSlugFromName($name),
            ]);

            return $this->sendJsonResponse(
                true,
                'Company updated successfully.',
                CompanyPresentation::format($company->fresh(), CompanyMembership::ROLE_OWNER, true),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCompanyProfileUpdate(Request $request)
    {
        try {
            /** @var Company $company */
            $company = $request->attributes->get('company');

            $validation = CompanyProfileValidation::makeValidator(
                $request->all(),
                $company->id,
            );

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $user = $request->user();
            $membership = $user->companies()->where('companies.id', $company->id)->first();

            if ($membership === null || $membership->pivot->role !== CompanyMembership::ROLE_OWNER) {
                return $this->sendJsonResponse(false, 'Only company owners can update the seller profile.', null, 200);
            }

            $data = CompanyProfileValidation::preparePayload($validation->validated());
            $data['slug'] = Company::uniqueSlugFromName($data['name']);
            $company->update($data);

            return $this->sendJsonResponse(
                true,
                'Company profile updated successfully.',
                CompanyPresentation::format($company->fresh(), CompanyMembership::ROLE_OWNER, true),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCompanyTaxSettingsUpdate(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'default_tax_type' => ['required', 'string', Rule::in(['none', 'vat', 'gst', 'sales_tax', 'custom'])],
                'default_tax_label' => ['required', 'string', 'max:50'],
                'default_tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
                'tax_calculation_mode' => ['required', 'string', Rule::in(['exclusive', 'inclusive'])],
                'tax_per_line' => ['nullable', 'boolean'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            /** @var Company $company */
            $company = $request->attributes->get('company');
            $user = $request->user();
            $membership = $user->companies()->where('companies.id', $company->id)->first();

            if ($membership === null || $membership->pivot->role !== CompanyMembership::ROLE_OWNER) {
                return $this->sendJsonResponse(false, 'Only company owners can update tax settings.', null, 200);
            }

            $company->update($validation->validated());

            return $this->sendJsonResponse(
                true,
                'Tax settings saved successfully.',
                CompanyPresentation::format($company->fresh(), CompanyMembership::ROLE_OWNER, true),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCompanyPaymentSettingsUpdate(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'account_number' => ['nullable', 'string', 'max:100'],
                'account_holder' => ['nullable', 'string', 'max:255'],
                'account_type' => ['nullable', 'string', 'max:32'],
                'upi_id' => ['nullable', 'string', 'max:100'],
                'branch_ifsc' => ['nullable', 'string', 'max:20'],
                'branch_name' => ['nullable', 'string', 'max:255'],
                'payment_note' => ['nullable', 'string', 'max:2000'],
                'default_payment_terms' => ['nullable', 'string', 'max:2000'],
                'default_show_payment_on_invoice' => ['nullable', 'boolean'],
                'default_show_bank_details_on_invoice' => ['nullable', 'boolean'],
                'default_show_qr_on_invoice' => ['nullable', 'boolean'],
                'default_show_payment_terms_on_invoice' => ['nullable', 'boolean'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            /** @var Company $company */
            $company = $request->attributes->get('company');
            $user = $request->user();
            $membership = $user->companies()->where('companies.id', $company->id)->first();

            if ($membership === null || $membership->pivot->role !== CompanyMembership::ROLE_OWNER) {
                return $this->sendJsonResponse(false, 'Only company owners can update payment settings.', null, 200);
            }

            $company->update(
                PaymentSettings::prepareUpdatePayload($request, $validation->validated()),
            );

            $fresh = $company->fresh();

            return $this->sendJsonResponse(
                true,
                'Payment settings saved successfully.',
                array_merge(
                    CompanyPresentation::format($fresh, CompanyMembership::ROLE_OWNER, true),
                    PaymentSettings::fromCompany($fresh),
                ),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCompanyTermsSettingsUpdate(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'default_terms_and_conditions' => ['nullable', 'string', 'max:10000'],
                'default_show_terms_on_invoice' => ['nullable', 'boolean'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            /** @var Company $company */
            $company = $request->attributes->get('company');
            $user = $request->user();
            $membership = $user->companies()->where('companies.id', $company->id)->first();

            if ($membership === null || $membership->pivot->role !== CompanyMembership::ROLE_OWNER) {
                return $this->sendJsonResponse(false, 'Only company owners can update terms and conditions.', null, 200);
            }

            $company->update(
                TermsAndConditionsSettings::prepareUpdatePayload(
                    $request,
                    $validation->validated(),
                ),
            );

            return $this->sendJsonResponse(
                true,
                'Terms and conditions saved successfully.',
                TermsAndConditionsSettings::fromCompany($company->fresh()),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCompanyTemplateSettingsUpdate(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'default_invoice_type' => ['required', 'string', Rule::in(InvoiceTypes::ids())],
                'default_invoice_template' => ['nullable', 'string', Rule::in(['stripe', 'classic'])],
                'default_custom_template_id' => ['nullable', 'integer'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            /** @var Company $company */
            $company = $request->attributes->get('company');
            $user = $request->user();
            $membership = $user->companies()->where('companies.id', $company->id)->first();

            if ($membership === null || $membership->pivot->role !== CompanyMembership::ROLE_OWNER) {
                return $this->sendJsonResponse(false, 'Only company owners can update template settings.', null, 200);
            }

            $data = $validation->validated();
            $typeId = $data['default_invoice_type'];
            $data['default_invoice_template'] = $data['default_invoice_template']
                ?? InvoiceTypes::layoutFor($typeId);

            if (array_key_exists('default_custom_template_id', $data)) {
                $customId = $data['default_custom_template_id'];
                if ($customId) {
                    $exists = $company->invoiceTemplates()->where('id', $customId)->exists();
                    if (! $exists) {
                        return $this->sendJsonResponse(false, 'Custom template not found.', null, 200);
                    }
                }
            } else {
                unset($data['default_custom_template_id']);
            }

            $company->update($data);

            return $this->sendJsonResponse(
                true,
                'Template settings saved successfully.',
                CompanyPresentation::format($company->fresh(), CompanyMembership::ROLE_OWNER, true),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

}
