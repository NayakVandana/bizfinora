<?php

use App\Http\Controllers\Api\User\AuthApiController;
use App\Http\Controllers\Api\User\CompanyApiController;
use App\Http\Controllers\Api\User\ProfileApiController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->prefix('v1/user')->group(function () {
    Route::post('/auth/user-logout', [AuthApiController::class, 'postUserLogout']);

    Route::post('/profile/profile-show', [ProfileApiController::class, 'postProfileShow']);
    Route::post('/profile/profile-update', [ProfileApiController::class, 'postProfileUpdate']);
    Route::post('/profile/profile-password-update', [ProfileApiController::class, 'postProfilePasswordUpdate']);
    Route::post('/profile/profile-destroy', [ProfileApiController::class, 'postProfileDestroy']);

    Route::post('/companies/companies-list', [CompanyApiController::class, 'postCompaniesList']);
    Route::post('/companies/company-show', [CompanyApiController::class, 'postCompanyShow']);
    Route::post('/companies/company-store', [CompanyApiController::class, 'postCompanyStore']);
    Route::post('/companies/company-switch', [CompanyApiController::class, 'postCompanySwitch']);
});
