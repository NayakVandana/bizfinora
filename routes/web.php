<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web — Inertia page shells only (GET, no DB / no business logic).
|--------------------------------------------------------------------------
|
| Browser and mobile app share the same JSON API:
|   /api/v1/...           guest (login, register, share)
|   /api/v1/user/...      auth:sanctum — profile, companies
|   /api/v1/company/...   auth:sanctum + company context
|
| Pass route params (id, token) into the page; React loads data via API.
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

Route::middleware('guest')->group(function () {
    Route::get('register', fn (Request $request) => Inertia::render('Auth/Register', [
        'redirect' => $request->query('redirect'),
    ]))->name('register');

    Route::get('login', fn (Request $request) => Inertia::render('Auth/Login', [
        'canResetPassword' => true,
        'status' => session('status'),
        'redirect' => $request->query('redirect'),
    ]))->name('login');

    Route::get('forgot-password', fn () => Inertia::render('Auth/ForgotPassword', [
        'status' => session('status'),
    ]))->name('password.request');

    Route::get('reset-password/{token}', fn (Request $request, string $token) => Inertia::render('Auth/ResetPassword', [
        'token' => $token,
        'email' => $request->query('email', ''),
    ]))->name('password.reset');
});

Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');

Route::get('/companies', fn () => Inertia::render('Companies/Index'))->name('companies.index');
Route::get('/companies/create', fn () => Inertia::render('Companies/Create'))->name('companies.create');
Route::get('/companies/edit', fn () => Inertia::render('Companies/Edit'))->name('companies.edit');
Route::redirect('/companies/profile', '/companies/edit')->name('companies.profile');

Route::redirect('/profile', '/profile/information');
Route::get('/profile/information', fn () => Inertia::render('Profile/Information'))->name('profile.information');
Route::get('/profile/information/edit', fn () => Inertia::render('Profile/Edit'))->name('profile.information.edit');
Route::get('/profile/password', fn () => Inertia::render('Profile/Password'))->name('profile.password');
Route::get('/profile/appearance', fn () => Inertia::render('Profile/Appearance'))->name('profile.appearance');

Route::get('/buyers', fn () => Inertia::render('Buyers/Index'))->name('buyers.index');
Route::get('/buyers/create', fn () => Inertia::render('Buyers/Create'))->name('buyers.create');
Route::get('/buyers/{id}', fn ($id) => Inertia::render('Buyers/Show', ['buyerId' => $id]))->name('buyers.show');
Route::get('/buyers/{id}/edit', fn ($id) => Inertia::render('Buyers/Edit', ['buyerId' => $id]))->name('buyers.edit');

Route::get('/settings/templates', fn () => Inertia::render('Settings/TemplatesIndex'))->name('settings.templates');
Route::redirect('/settings/templates/library', '/settings/templates');
Route::redirect('/settings/templates/preview', '/settings/templates');
Route::get('/settings/templates/{id}/edit', fn ($id) => Inertia::render('Settings/TemplateEdit', ['templateId' => $id]))->name('settings.templates.edit');
Route::get('/settings/tax', fn () => Inertia::render('Settings/Tax'))->name('settings.tax');
Route::get('/settings/payment', fn () => Inertia::render('Settings/Payment'))->name('settings.payment');
Route::get('/settings/terms', fn () => Inertia::render('Settings/Terms'))->name('settings.terms');
Route::get('/settings/signature', fn () => Inertia::render('Settings/Signature'))->name('settings.signature');

Route::get('/invoices', fn () => Inertia::render('Invoices/Index'))->name('invoices.index');
Route::get('/invoices/create', fn () => Inertia::render('Invoices/Create'))->name('invoices.create');
Route::get('/invoices/{id}', fn ($id) => Inertia::render('Invoices/Show', ['invoiceId' => $id]))->name('invoices.show');
Route::get('/invoices/{id}/edit', fn ($id) => Inertia::render('Invoices/Edit', ['invoiceId' => $id]))->name('invoices.edit');

Route::get('/i/{token}', fn (string $token) => Inertia::render('Invoices/Share', ['shareToken' => $token]))
    ->name('invoices.share');

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('login', fn () => Inertia::render('Admin/Login'))->name('login');

    Route::redirect('/', '/admin/dashboard');
    Route::get('dashboard', fn () => Inertia::render('Admin/Dashboard'))->name('dashboard');
    Route::get('users', fn () => Inertia::render('Admin/Users/Index'))->name('users.index');
    Route::get('users/{id}', fn ($id) => Inertia::render('Admin/Users/Show', ['userId' => $id]))->name('users.show');
    Route::get('companies', fn () => Inertia::render('Admin/Companies/Index'))->name('companies.index');
    Route::get('companies/{id}', fn ($id) => Inertia::render('Admin/Companies/Show', ['companyId' => $id]))->name('companies.show');
    Route::get('invoices', fn () => Inertia::render('Admin/Invoices/Index'))->name('invoices.index');
    Route::get('invoices/{id}', fn ($id) => Inertia::render('Admin/Invoices/Show', ['invoiceId' => $id]))->name('invoices.show');
    Route::get('templates', fn () => Inertia::render('Admin/Templates/Index'))->name('templates.index');
    Route::get('buyers/{id}', fn ($id) => Inertia::render('Admin/Buyers/Show', ['buyerId' => $id]))->name('buyers.show');
});
