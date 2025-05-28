<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SocialController;
Route::get('/', function () {
    return view('welcome');
});
Route::get('/login', function () {
    return view('login');
})->name('login');
// ...existing code...
use App\Http\Controllers\Auth\LoginController;

Route::post('/login', [LoginController::class, 'login'])->name('login');
// ...existing code...

// ...existing code...
Route::get('/verify-token', function () {
    return view('verify-token');
})->name('verify.token.form');
// ...existing code...

Route::get('/auth/{provider}', [SocialController::class, 'redirectToProvider']);
Route::get('/auth/{provider}/callback', [SocialController::class, 'handleProviderCallback']);

// ...existing code...
Route::get('/verify-token', function () {
    return view('verify-token');
})->name('verify.token.form');
// ...existing code...

// ...existing code...
use App\Http\Controllers\Auth\RegisterController;

Route::get('/register', [RegisterController::class, 'showRegistrationForm'])->name('register');
Route::post('/register', [RegisterController::class, 'register']);
// ...existing code...

// ...existing code...


Route::post('/verify-token', [LoginController::class, 'verifyToken'])->name('verify.token');
// ...existing code...// ...existing code...


Route::post('/verify-token', [LoginController::class, 'verifyToken'])->name('verify.token');
// ...existing code...