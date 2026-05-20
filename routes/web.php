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

Route::get('/profile', fn () => Inertia::render('Profile/Edit', [
    'mustVerifyEmail' => false,
    'status' => null,
]))->name('profile.edit');

require __DIR__.'/auth.php';
