<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use App\Support\UserPresentation;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserApiController extends Controller
{
    public function postUsersList(Request $request)
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

            $query = User::query()
                ->withCount('companies')
                ->orderByDesc('created_at');

            if ($request->filled('keyword')) {
                $keyword = $request->input('keyword');
                $query->where(function ($q) use ($keyword) {
                    $q->where('name', 'like', '%'.$keyword.'%')
                        ->orWhere('email', 'like', '%'.$keyword.'%');
                });
            }

            $paginator = $query->paginate($perPage, [
                'id',
                'name',
                'email',
                'is_admin',
                'current_company_id',
                'email_verified_at',
                'created_at',
            ], 'page', $currentPage);

            $paginator->getCollection()->transform(
                fn (User $user) => UserPresentation::format($user),
            );

            return $this->sendJsonResponse(true, 'Users fetched successfully.', $paginator, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postUserShow(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $user = User::query()
                ->with(['companies:id,name,slug,created_at'])
                ->find($request->input('id'));

            if ($user === null) {
                return $this->sendJsonResponse(false, 'User not found.', null, 200);
            }

            $data = UserPresentation::format($user);
            $data['companies_count'] = $user->companies->count();
            $data['companies'] = $user->companies->map(fn (Company $company) => [
                'id' => $company->id,
                'name' => $company->name,
                'slug' => $company->slug,
                'role' => $company->pivot->role,
                'is_current' => $company->id === $user->current_company_id,
                'created_at' => $company->created_at?->toIso8601String(),
            ])->values()->all();

            return $this->sendJsonResponse(true, 'User fetched successfully.', $data, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
