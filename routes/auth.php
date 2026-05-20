<?php

use App\Http\Controllers\Web\AuthPageController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth pages — GET / Inertia only. Login, register, logout use API routes.
|--------------------------------------------------------------------------
*/

Route::middleware('guest')->group(function () {
    Route::get('register', [AuthPageController::class, 'register'])->name('register');
    Route::get('login', [AuthPageController::class, 'login'])->name('login');
    Route::get('forgot-password', [AuthPageController::class, 'forgotPassword'])->name('password.request');
    Route::get('reset-password/{token}', [AuthPageController::class, 'resetPassword'])->name('password.reset');
});
