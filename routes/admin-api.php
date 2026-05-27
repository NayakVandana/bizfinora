<?php

use App\Http\Controllers\Api\Admin\AuthApiController;
use App\Http\Controllers\Api\Admin\BuyerApiController;
use App\Http\Controllers\Api\Admin\CompanyApiController;
use App\Http\Controllers\Api\Admin\DashboardApiController;
use App\Http\Controllers\Api\Admin\InvoiceApiController;
use App\Http\Controllers\Api\Admin\InvoiceTemplateApiController;
use App\Http\Controllers\Api\Admin\UserApiController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/admin')->group(function () {
    Route::post('/auth/admin-login', [AuthApiController::class, 'postAdminLogin']);
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('v1/admin')->group(function () {
    Route::post('/auth/admin-logout', [AuthApiController::class, 'postAdminLogout']);

    Route::post('/dashboard/dashboard-summary', [DashboardApiController::class, 'postDashboardSummary']);

    Route::post('/users/users-list', [UserApiController::class, 'postUsersList']);
    Route::post('/users/user-show', [UserApiController::class, 'postUserShow']);

    Route::post('/companies/companies-list', [CompanyApiController::class, 'postCompaniesList']);
    Route::post('/companies/company-show', [CompanyApiController::class, 'postCompanyShow']);

    Route::post('/buyers/buyer-show', [BuyerApiController::class, 'postBuyerShow']);

    Route::post('/invoices/invoices-list', [InvoiceApiController::class, 'postInvoicesList']);
    Route::post('/invoices/invoice-show', [InvoiceApiController::class, 'postInvoiceShow']);
    Route::post('/invoices/invoice-share-enable', [InvoiceApiController::class, 'postInvoiceShareEnable']);

    Route::post('/invoice-templates/invoice-templates-list', [InvoiceTemplateApiController::class, 'postInvoiceTemplatesList']);
    Route::post('/invoice-templates/invoice-template-preview', [InvoiceTemplateApiController::class, 'postInvoiceTemplatePreview']);
});
