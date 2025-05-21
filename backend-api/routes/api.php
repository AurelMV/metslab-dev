<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ModeloController;

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

    
    Route::get('/modelos/modelcata/{idCategoria}', [ModeloController::class, 'modelosPorCategoria']);
    Route::post('/modelos', [ModeloController::class, 'store']);
    Route::get('/modelos/{id}', [ModeloController::class, 'show']);
    Route::put('/modelos/{id}', [ModeloController::class, 'update']);
    Route::delete('/modelos/{id}', [ModeloController::class, 'destroy']);