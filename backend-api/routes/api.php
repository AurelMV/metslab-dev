<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ModeloController;
use App\Http\Controllers\CarritoController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\ColorController;
use App\Http\Controllers\SocialController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\Auth\UserController;
use App\Http\Controllers\Auth\ProfileController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\MetricsController;
use App\Http\Controllers\SeguimientoController;
use App\Http\Controllers\PedidosAdminController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rutas públicas de autenticación
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/verify-code', [RegisterController::class, 'verifyCode']);
Route::post('/resend-code', [RegisterController::class, 'resendCode']);

// Rutas sociales
Route::post('/social-callback', [SocialController::class, 'handleApiCallback']);

// Rutas públicas de modelos
Route::get('/modelos/recursocatalogo', [ModeloController::class, 'RecursoCatalogo']);

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    // Ruta del usuario actual
    Route::get('/user', [AuthController::class, 'me']);

    // Reenviar correo de verificación
    Route::post('/email/verification-notification', function (Request $request) {
        $user = $request->user();
        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'El correo ya está verificado'], 400);
        }

        $verificationToken = Str::random(64);
        $user->verification_token = $verificationToken;
        $user->save();

        Mail::send('emails.verify', ['token' => $verificationToken], function ($message) use ($user) {
            $message->to($user->email)
                ->subject('Verifica tu cuenta - Metslab');
        });

        return response()->json(['message' => 'Correo de verificación reenviado']);
    });

    // Cerrar sesión
    Route::post('/logout', [AuthController::class, 'logout']);
    // Cambiar contraseña y actualizar perfil
    Route::post('/user/change-password', [ProfileController::class, 'changePassword']);
    Route::put('/user/profile', [ProfileController::class, 'updateProfile']);

    // Rutas protegidas
    Route::post('/create-preference', [App\Http\Controllers\PaymentController::class, 'createPreferenceFromCart']);
    Route::post('/create-custom-preference', [App\Http\Controllers\PaymentController::class, 'createPreferenceWithPaymentMethods']);
    Route::post('/process-payment', [App\Http\Controllers\PaymentController::class, 'processPaymentRequest']);
    Route::get('/status/{paymentId}', [App\Http\Controllers\PaymentController::class, 'getPaymentStatus']);
    Route::get('/user-payments', [App\Http\Controllers\PaymentController::class, 'getUserPayments']);
    Route::post('/orders/create', [PedidoController::class, 'create']);
});

// Rutas protegidas para usuarios autenticados (cliente)
Route::middleware(['auth:sanctum', 'role:cliente'])->group(function () {
    // Carrito solo para clientes autenticados
    Route::get('/carrito', [CarritoController::class, 'index']);
    Route::post('/carrito', [CarritoController::class, 'store']);
    Route::get('/carrito/{id}', [CarritoController::class, 'show']);
    Route::put('/carrito/{id}', [CarritoController::class, 'update']);
    Route::delete('/carrito/{id}', [CarritoController::class, 'destroy']);
    Route::delete('/carrito/vaciar/todo', [CarritoController::class, 'vaciarCarrito']);
    
    // Seguimiento de pedidos solo para clientes autenticados
    Route::get('/seguimiento', [SeguimientoController::class, 'seguimiento']); // Pedidos activos que se pueden seguir
    Route::get('/historial', [SeguimientoController::class, 'historial']); // Historial completo de pedidos
    Route::get('/pedido/{id}/detalles', [SeguimientoController::class, 'detalles']); // Detalles completos de un pedido
    
    // Puedes agregar aquí otras rutas exclusivas para clientes
    // Rutas para gestionar pedidos
    Route::post('/pedidos', [PedidoController::class, 'crearPedido']);
    Route::get('/pedidos/{id}', [PedidoController::class, 'mostrarPedido']);
    Route::get('/pedidos', [PedidoController::class, 'listarPedidos']);
    Route::put('/pedidos/{id}', [PedidoController::class, 'actualizarPedido']);
    Route::delete('/pedidos/{id}', [PedidoController::class, 'eliminarPedido']);
});

// Rutas protegidas solo para admin
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Rutas de categorías
    Route::post('/categorias', [CategoriaController::class, 'store']);
    Route::put('/categorias/{id}', [CategoriaController::class, 'update']);
    //Route::delete('/categorias/{id}', [CategoriaController::class, 'destroy']);
    // Rutas de modelos (crear, editar, eliminar)
    Route::post('/modelos', [ModeloController::class, 'store']);
    Route::put('/modelos/{id}', [ModeloController::class, 'update']);
    // Rutas de usuarios
    Route::get('/users', [UserController::class, 'getUsers']);
    Route::get('/users-with-pedidos', [UserController::class, 'getUsersWithPedidos']);
    Route::put('/users/{id}/role', [UserController::class, 'changeUserRole']);
    // Rutas de métricas
    Route::get('/metricas/pedidos-por-mes', [MetricsController::class, 'pedidosPorMes']);
    Route::get('/metricas/ingresos-por-mes', [MetricsController::class, 'ingresosPorMes']);
    
    // Rutas de administración de pedidos
    Route::prefix('admin')->group(function () {
        Route::get('/pedidos', [PedidosAdminController::class, 'index']);
        Route::get('/pedidos/{id}', [PedidosAdminController::class, 'show']);
        Route::get('/pedidos/{id}/detalles-admin', [PedidosAdminController::class, 'obtenerDetallesAdmin']);
        Route::put('/pedidos/{id}/estado', [PedidosAdminController::class, 'actualizarEstado']);
        Route::put('/pedidos/batch-update', [PedidosAdminController::class, 'actualizarEstadosLote']);
        Route::get('/estados-disponibles', [PedidosAdminController::class, 'estadosDisponibles']);
    });
    
    // Puedes agregar aquí otras rutas exclusivas para admin
});

// Rutas públicas y de solo lectura
Route::get('/categorias', [CategoriaController::class, 'index']);
Route::get('/categorias/{id}', [CategoriaController::class, 'show']);
Route::get('/modelos', [ModeloController::class, 'index']);
Route::get('/modelos/categoria/{idCategoria}', [ModeloController::class, 'modelosPorCategoria']);
Route::get('/modelos/{id}', [ModeloController::class, 'show']);
Route::get('/modelos/modelo/{id}', [ModeloController::class, 'Cargamodelo']);
Route::get('/modelos/recursocatalogo', [ModeloController::class, 'RecursoCatalogo']);
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

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::get('/addresses/{address}', [AddressController::class, 'show']);
    Route::put('/addresses/{address}', [AddressController::class, 'update']);
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);
});

// Rutas de pagos
Route::prefix('payments')->group(function () {
    // Ruta pública para webhook
    Route::post('/webhook', [App\Http\Controllers\PaymentController::class, 'webhook']);

    // Ruta de prueba
    Route::get('/test', [App\Http\Controllers\PaymentController::class, 'test']);
    Route::post('/test-minimal-preference', [App\Http\Controllers\PaymentController::class, 'testMinimalPreference']);

    // Rutas protegidas
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/create-preference', [App\Http\Controllers\PaymentController::class, 'createPreferenceFromCart']);
        Route::post('/create-custom-preference', [App\Http\Controllers\PaymentController::class, 'createPreferenceWithPaymentMethods']);
        Route::post('/process-payment', [App\Http\Controllers\PaymentController::class, 'processPaymentRequest']);
        Route::get('/status/{paymentId}', [App\Http\Controllers\PaymentController::class, 'getPaymentStatus']);
        Route::get('/user-payments', [App\Http\Controllers\PaymentController::class, 'getUserPayments']);
    });
});
