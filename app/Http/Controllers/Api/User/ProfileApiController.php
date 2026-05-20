<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Support\UserPresentation;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;

class ProfileApiController extends Controller
{
    public function postProfileShow(Request $request)
    {
        try {
            $user = $request->user()->load(['currentCompany', 'companies']);

            return $this->sendJsonResponse(
                true,
                'Profile fetched successfully.',
                UserPresentation::format($user, true),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postProfileUpdate(Request $request)
    {
        try {
            $user = $request->user();

            $validation = Validator::make($request->all(), [
                'name' => ['required', 'string', 'max:255'],
                'email' => [
                    'required',
                    'string',
                    'lowercase',
                    'email',
                    'max:255',
                    Rule::unique('users', 'email')->ignore($user->id),
                ],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $user->update($validation->validated());

            return $this->sendJsonResponse(
                true,
                'Profile updated successfully.',
                UserPresentation::format($user->fresh(['currentCompany', 'companies']), true),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postProfilePasswordUpdate(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'current_password' => ['required', 'current_password'],
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $request->user()->update([
                'password' => Hash::make($request->input('password')),
            ]);

            return $this->sendJsonResponse(true, 'Password updated successfully.', null, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postProfileDestroy(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'password' => ['required', 'current_password'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $user = $request->user();
            $user->tokens()->delete();
            $user->delete();

            return $this->sendJsonResponse(true, 'Account deleted successfully.', null, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
