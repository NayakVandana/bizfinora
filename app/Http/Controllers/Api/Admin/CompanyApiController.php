<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Support\CompanyPresentation;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CompanyApiController extends Controller
{
    public function postCompaniesList(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
                'current_page' => ['nullable', 'integer', 'min:1'],
                'keyword' => ['nullable', 'string', 'max:120'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $perPage = (int) ($request->input('per_page') ?: 10);
            $currentPage = (int) ($request->input('current_page') ?: 1);

            $query = Company::query()
                ->withCount('users')
                ->orderBy('name');

            if ($request->filled('keyword')) {
                $keyword = $request->input('keyword');
                $query->where(function ($q) use ($keyword) {
                    $q->where('name', 'like', '%'.$keyword.'%')
                        ->orWhere('slug', 'like', '%'.$keyword.'%');
                });
            }

            $paginator = $query->paginate($perPage, [
                'id',
                'name',
                'slug',
                'created_at',
                'updated_at',
            ], 'page', $currentPage);

            $paginator->getCollection()->transform(function (Company $company) {
                $row = CompanyPresentation::format($company);
                $row['users_count'] = $company->users_count;

                return $row;
            });

            return $this->sendJsonResponse(true, 'Companies fetched successfully.', $paginator, 200);
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

            $company = Company::query()
                ->withCount('users')
                ->with(['users:id,name,email'])
                ->find($request->input('id'));

            if ($company === null) {
                return $this->sendJsonResponse(false, 'Company not found.', null, 200);
            }

            $data = CompanyPresentation::format($company);
            $data['users_count'] = $company->users_count;
            $data['users'] = $company->users->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->pivot->role,
            ])->values()->all();

            return $this->sendJsonResponse(true, 'Company fetched successfully.', $data, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
