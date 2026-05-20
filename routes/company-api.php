<?php

use App\Http\Controllers\Api\Company\CompanyContextApiController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'api.company'])->prefix('v1/company')->group(function () {
    Route::post('/company/company-show', [CompanyContextApiController::class, 'postCompanyShow']);
    Route::post('/company/company-update', [CompanyContextApiController::class, 'postCompanyUpdate']);
});
