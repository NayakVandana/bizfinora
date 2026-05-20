<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Support\CompanyMembership;
use App\Support\CompanyPresentation;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
}
