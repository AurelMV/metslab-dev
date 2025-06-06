<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ModeloController;
use App\Http\Controllers\UbicacionController;
use App\Http\Controllers\CarritoController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\SocialController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rutas públicas de autenticación
Route::post('/login', [LoginController::class, 'apiLogin']);
Route::post('/register', [RegisterController::class, 'apiRegister']);
Route::post('/verify-code', [RegisterController::class, 'verifyCode']);
Route::post('/resend-code', [RegisterController::class, 'resendCode']);

// Rutas sociales
Route::post('/social-callback', [SocialController::class, 'handleApiCallback']);

// Rutas públicas de modelos
Route::get('/modelos/recursocatalogo', [ModeloController::class, 'RecursoCatalogo']);

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    // Ruta del usuario actual
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Reenviar correo de verificación
    Route::post('/email/verification-notification', function (Request $request) {
        $user = $request->user();
        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'El correo ya está verificado'], 400);
        }
        
        $verificationToken = Str::random(64);
        $user->verification_token = $verificationToken;
        $user->save();
        
        Mail::send('emails.verify', ['token' => $verificationToken], function($message) use ($user) {
            $message->to($user->email)
                   ->subject('Verifica tu cuenta - Metslab');
        });
        
        return response()->json(['message' => 'Correo de verificación reenviado']);
    });

    // Cerrar sesión
    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada correctamente']);
    });
});
    // Rutas de categorías
    Route::get('/categorias', [CategoriaController::class, 'index']);
   Route::post('/categorias', [CategoriaController::class, 'store']);
Route::get('/categorias/{id}', [CategoriaController::class, 'show']);
Route::put('/categorias/{id}', [CategoriaController::class, 'update']);
Route::delete('/categorias/{id}', [CategoriaController::class, 'destroy']);
    
    Route::post('/ubicaciones', [UbicacionController::class, 'store']);
    // Rutas de modelos
    Route::get('/modelos', [ModeloController::class, 'index']);
    Route::get('/modelos/categoria/{idCategoria}', [ModeloController::class, 'modelosPorCategoria']);
    Route::post('/modelos', [ModeloController::class, 'store']);
    Route::get('/modelos/{id}', [ModeloController::class, 'show']);
    Route::get('/modelos/modelo/{id}', [ModeloController::class, 'Cargamodelo']);
    Route::put('/modelos/{id}', [ModeloController::class, 'update']);
    Route::delete('/modelos/{id}', [ModeloController::class, 'destroy']);
    
    // Rutas para el carrito
    Route::get('/carrito', [CarritoController::class, 'index']);
    Route::post('/carrito', [CarritoController::class, 'store']);
    Route::get('/carrito/{id}', [CarritoController::class, 'show']);
    Route::put('/carrito/{id}', [CarritoController::class, 'update']);
    Route::delete('/carrito/{id}', [CarritoController::class, 'destroy']);
    Route::delete('/carrito/vaciar/todo', [CarritoController::class, 'vaciarCarrito']);

Route::get('/modelo-obj/{filename}', function ($filename) {
    $path = storage_path('app/public/modelos/' . $filename);

    if (!file_exists($path)) {
        abort(404, 'Archivo no encontrado');
    }

    return response()->file($path, [
        'Access-Control-Allow-Origin' => '*',
        'Content-Type' => 'application/octet-stream'
    ]);
});


