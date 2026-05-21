<?php

use App\Http\Controllers\Api\Company\BuyerApiController;
use App\Http\Controllers\Api\Company\CompanyContextApiController;
use App\Http\Controllers\Api\Company\InvoiceApiController;
use App\Http\Controllers\Api\Company\InvoiceTemplateApiController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'api.company'])->prefix('v1/company')->group(function () {
    Route::post('/company/company-show', [CompanyContextApiController::class, 'postCompanyShow']);
    Route::post('/company/company-update', [CompanyContextApiController::class, 'postCompanyUpdate']);
    Route::post('/company/company-profile-update', [CompanyContextApiController::class, 'postCompanyProfileUpdate']);
    Route::post('/company/company-tax-settings-update', [CompanyContextApiController::class, 'postCompanyTaxSettingsUpdate']);
    Route::post('/company/company-template-settings-update', [CompanyContextApiController::class, 'postCompanyTemplateSettingsUpdate']);

    Route::post('/invoice-templates/invoice-templates-list', [InvoiceTemplateApiController::class, 'postInvoiceTemplatesList']);
    Route::post('/invoice-templates/invoice-template-show', [InvoiceTemplateApiController::class, 'postInvoiceTemplateShow']);
    Route::post('/invoice-templates/invoice-template-store', [InvoiceTemplateApiController::class, 'postInvoiceTemplateStore']);
    Route::post('/invoice-templates/invoice-template-update', [InvoiceTemplateApiController::class, 'postInvoiceTemplateUpdate']);
    Route::post('/invoice-templates/invoice-template-clone', [InvoiceTemplateApiController::class, 'postInvoiceTemplateClone']);
    Route::post('/invoice-templates/invoice-template-destroy', [InvoiceTemplateApiController::class, 'postInvoiceTemplateDestroy']);
    Route::post('/invoice-templates/invoice-template-set-default', [InvoiceTemplateApiController::class, 'postInvoiceTemplateSetDefault']);

    Route::post('/buyers/buyers-list', [BuyerApiController::class, 'postBuyersList']);
    Route::post('/buyers/buyer-store', [BuyerApiController::class, 'postBuyerStore']);
    Route::post('/buyers/buyer-update', [BuyerApiController::class, 'postBuyerUpdate']);
    Route::post('/buyers/buyer-destroy', [BuyerApiController::class, 'postBuyerDestroy']);

    Route::post('/invoices/invoices-list', [InvoiceApiController::class, 'postInvoicesList']);
    Route::post('/invoices/invoice-meta', [InvoiceApiController::class, 'postInvoiceMeta']);
    Route::post('/invoices/invoice-show', [InvoiceApiController::class, 'postInvoiceShow']);
    Route::post('/invoices/invoice-store', [InvoiceApiController::class, 'postInvoiceStore']);
    Route::post('/invoices/invoice-update', [InvoiceApiController::class, 'postInvoiceUpdate']);
    Route::post('/invoices/invoice-destroy', [InvoiceApiController::class, 'postInvoiceDestroy']);
    Route::post('/invoices/invoice-share-enable', [InvoiceApiController::class, 'postInvoiceShareEnable']);
});
