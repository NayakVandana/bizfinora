<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Auth\AuthService;
use App\Support\UserPresentation;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AuthApiController extends Controller
{
    public function __construct(
        private readonly AuthService $auth,
    ) {}

    public function postAdminLogin(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'email' => ['required', 'email'],
                'password' => ['required', 'string'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $user = $this->auth->attemptLogin(
                $request->input('email'),
                $request->input('password'),
            );

            if ($user === null) {
                return $this->sendJsonResponse(false, 'Invalid credentials.', null, 200);
            }

            if (! $user->is_admin) {
                return $this->sendJsonResponse(false, 'Admin access required.', null, 200);
            }

            $token = $this->auth->createApiToken($user, 'admin-api');

            return $this->sendJsonResponse(true, 'Admin logged in successfully.', [
                'user' => UserPresentation::format($user, true),
                'token' => $token,
            ], 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postAdminLogout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()?->delete();

            return $this->sendJsonResponse(true, 'Logged out successfully.', null, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
