<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web routes — Inertia page renders only (no business POST/PATCH here).
| Data & mutations: routes/api.php, user-api.php, company-api.php, admin-api.php
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

Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');

Route::get('/companies', fn () => Inertia::render('Companies/Index'))->name('companies.index');

Route::get('/companies/create', fn () => Inertia::render('Companies/Create'))->name('companies.create');

Route::get('/companies/profile', fn () => Inertia::render('Companies/Profile'))->name('companies.profile');

Route::get('/profile', fn () => Inertia::render('Profile/Edit', [
    'mustVerifyEmail' => false,
    'status' => null,
]))->name('profile.edit');

Route::get('/buyers', fn () => Inertia::render('Buyers/Index'))->name('buyers.index');
Route::get('/buyers/create', fn () => Inertia::render('Buyers/Create'))->name('buyers.create');
Route::get('/buyers/{id}', fn (int $id) => Inertia::render('Buyers/Show', ['buyerId' => $id]))
    ->whereNumber('id')
    ->name('buyers.show');
Route::get('/buyers/{id}/edit', fn (int $id) => Inertia::render('Buyers/Edit', ['buyerId' => $id]))
    ->whereNumber('id')
    ->name('buyers.edit');

Route::get('/settings/templates', fn () => Inertia::render('Settings/TemplateDefault'))->name('settings.templates');

Route::get('/settings/templates/library', fn () => Inertia::render('Settings/TemplatesIndex'))->name('settings.templates.library');

Route::get('/settings/templates/preview', fn () => Inertia::render('Settings/TemplatePreview'))->name('settings.templates.preview');

Route::get('/settings/templates/{id}/edit', fn (int $id) => Inertia::render('Settings/TemplateEdit', ['templateId' => $id]))
    ->whereNumber('id')
    ->name('settings.templates.edit');

Route::get('/settings/tax', fn () => Inertia::render('Settings/Tax'))->name('settings.tax');

Route::get('/invoices', fn () => Inertia::render('Invoices/Index'))->name('invoices.index');
Route::get('/invoices/create', fn () => Inertia::render('Invoices/Create'))->name('invoices.create');
Route::get('/invoices/{id}/edit', fn (int $id) => Inertia::render('Invoices/Edit', ['invoiceId' => $id]))
    ->whereNumber('id')
    ->name('invoices.edit');

Route::get('/i/{token}', fn (string $token) => Inertia::render('Invoices/Share', ['shareToken' => $token]))
    ->name('invoices.share');

require __DIR__.'/auth.php';
