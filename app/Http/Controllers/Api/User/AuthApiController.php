<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\Request;

class AuthApiController extends Controller
{
    public function postUserLogout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()?->delete();

            return $this->sendJsonResponse(true, 'Logged out successfully.', null, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
