<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Support\CompanyMembership;
use App\Support\CompanyPresentation;
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
            $validation = Validator::make($request->all(), [
                'address' => ['nullable', 'string', 'max:2000'],
                'tax_id' => ['nullable', 'string', 'max:100'],
                'tax_id_label' => ['nullable', 'string', 'max:50'],
                'email' => ['nullable', 'email', 'max:255'],
                'phone' => ['nullable', 'string', 'max:50'],
                'account_number' => ['nullable', 'string', 'max:100'],
                'swift_bic' => ['nullable', 'string', 'max:50'],
                'logo_data_url' => ['nullable', 'string'],
                'seller_notes' => ['nullable', 'string', 'max:5000'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            /** @var Company $company */
            $company = $request->attributes->get('company');
            $user = $request->user();
            $membership = $user->companies()->where('companies.id', $company->id)->first();

            if ($membership === null || $membership->pivot->role !== CompanyMembership::ROLE_OWNER) {
                return $this->sendJsonResponse(false, 'Only company owners can update the seller profile.', null, 200);
            }

            $company->update($validation->validated());

            return $this->sendJsonResponse(
                true,
                'Seller profile updated successfully.',
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

    public function postCompanyTemplateSettingsUpdate(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'default_invoice_template' => ['required', 'string', Rule::in(['stripe', 'classic'])],
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

            $company->update($validation->validated());

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
