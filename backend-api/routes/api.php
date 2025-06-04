<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ModeloController;
use App\Http\Controllers\UbicacionController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::get('/categorias', [CategoriaController::class, 'index']);
    Route::post('/categorias', [CategoriaController::class, 'store']);
    Route::get('/categorias/{id}', [CategoriaController::class, 'show']);
    Route::put('/categorias/{id}', [CategoriaController::class, 'update']);
    Route::delete('/categorias/{id}', [CategoriaController::class, 'destroy']);

    // Modelos
    Route::get('/modelos', [ModeloController::class, 'index']);
    Route::get('/modelos/recursocatalogo', [ModeloController::class, 'RecursoCatalogo']);
    //Ubicaciones 
    Route::post('/ubicaciones', [UbicacionController::class, 'store']);

       Route::get('/modelos/categoria/{idCategoria}', [ModeloController::class, 'modelosPorCategoria']);
    Route::post('/modelos', [ModeloController::class, 'store']);
    Route::get('/modelos/{id}', [ModeloController::class, 'show']);
   // Route::get('/modelos/imagenes/{id}', [ModeloController::class, 'Imagenmodelo']);
    Route::get('/modelos/modelo/{id}', [ModeloController::class, 'Cargamodelo']);
   
    Route::put('/modelos/{id}', [ModeloController::class, 'update']);
    Route::delete('/modelos/{id}', [ModeloController::class, 'destroy']);

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
