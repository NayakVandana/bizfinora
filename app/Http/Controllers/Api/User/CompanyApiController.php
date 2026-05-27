<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Support\CompanyMembership;
use App\Support\CompanyPresentation;
use App\Support\CompanyProfileValidation;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CompanyApiController extends Controller
{
    public function __construct(
        private readonly CompanyMembership $membership,
    ) {}

    public function postCompaniesList(Request $request)
    {
        try {
            $user = $request->user();

            return $this->sendJsonResponse(
                true,
                'Companies fetched successfully.',
                CompanyPresentation::formatCollectionForUser($user),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCompanyShow(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $user = $request->user();
            $company = $user->companies()->where('companies.id', $request->input('id'))->first();

            if ($company === null) {
                return $this->sendJsonResponse(false, 'Company not found.', null, 200);
            }

            return $this->sendJsonResponse(
                true,
                'Company fetched successfully.',
                CompanyPresentation::format(
                    $company,
                    $company->pivot->role,
                    $company->id === $user->current_company_id,
                ),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCompanyStore(Request $request)
    {
        try {
            $validation = CompanyProfileValidation::makeValidator($request->all());

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $data = CompanyProfileValidation::preparePayload($validation->validated());
            $data['slug'] = Company::uniqueSlugFromName($data['name']);

            $company = $this->membership->createForUser($request->user(), $data);

            return $this->sendJsonResponse(
                true,
                'Company created successfully.',
                CompanyPresentation::format($company, CompanyMembership::ROLE_OWNER, true),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCompanySwitch(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $user = $request->user();
            $company = Company::query()->find($request->input('id'));

            if ($company === null) {
                return $this->sendJsonResponse(false, 'Company not found.', null, 200);
            }

            $this->membership->switchTo($user, $company);

            $pivot = $user->companies()->where('companies.id', $company->id)->first();

            return $this->sendJsonResponse(
                true,
                'Active company switched successfully.',
                CompanyPresentation::format($company, $pivot?->pivot->role, true),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
