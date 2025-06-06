<?php

namespace App\Http\Controllers;

use App\Models\Carrito;
use App\Models\Modelo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CarritoController extends Controller
{
    public function index(Request $request)
    {
        try {
            $userId = $request->user_id; // Para pruebas con Thunder Client
            $carritoItems = Carrito::where('iduser', $userId)
                ->with(['modelo' => function ($query) {
                    $query->select('idModelo', 'nombre', 'precio', 'descripcion', 'dimensiones', 'ruta_imagen');
                }])
                ->get();

            $items = $carritoItems->map(function ($item) {
                $modelo = $item->modelo;
                $imagen_url = $modelo->ruta_imagen ? asset($modelo->ruta_imagen) : null;

                return [
                    'carrito_id' => $item->id,
                    'modelo_id' => $modelo->idModelo,
                    'nombre' => $modelo->nombre,
                    'precio' => $modelo->precio,
                    'descripcion' => $modelo->descripcion,
                    'dimensiones' => $modelo->dimensiones,
                    'imagen_url' => $imagen_url,
                    'cantidad' => $item->cantidad,
                    'subtotal' => $item->cantidad * $modelo->precio
                ];
            });

            $total = $items->sum('subtotal');

            return response()->json([
                'success' => true,
                'data' => [
                    'items' => $items,
                    'total' => $total,
                    'cantidad_items' => $carritoItems->sum('cantidad')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el carrito: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'idModelo' => 'required|exists:modelos,idModelo',
                'cantidad' => 'required|integer|min:1',
                'user_id' => 'required|exists:users,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verificar si ya existe el item en el carrito
            $carritoExistente = Carrito::where('iduser', $request->user_id)
                ->where('idModelo', $request->idModelo)
                ->first();

            if ($carritoExistente) {
                // Si ya existe, actualizar la cantidad
                $carritoExistente->cantidad += $request->cantidad;
                $carritoExistente->save();

                $item = $carritoExistente;
            } else {
                // Si no existe, crear nuevo item en carrito
                $item = Carrito::create([
                    'iduser' => $request->user_id,
                    'idModelo' => $request->idModelo,
                    'cantidad' => $request->cantidad
                ]);
            }

            // Obtener información detallada del modelo
            $modelo = Modelo::findOrFail($request->idModelo);
            $imagen_url = $modelo->ruta_imagen ? asset($modelo->ruta_imagen) : null;

            return response()->json([
                'success' => true,
                'message' => 'Producto añadido al carrito',
                'data' => [
                    'carrito_id' => $item->id,
                    'modelo_id' => $modelo->idModelo,
                    'nombre' => $modelo->nombre,
                    'precio' => $modelo->precio,
                    'descripcion' => $modelo->descripcion,
                    'dimensiones' => $modelo->dimensiones,
                    'imagen_url' => $imagen_url,
                    'cantidad' => $item->cantidad,
                    'subtotal' => $item->cantidad * $modelo->precio
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al añadir al carrito: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $carritoItem = Carrito::with(['modelo' => function ($query) {
                $query->select('idModelo', 'nombre', 'precio', 'descripcion', 'dimensiones', 'ruta_imagen');
            }])->findOrFail($id);

            $modelo = $carritoItem->modelo;
            $imagen_url = $modelo->ruta_imagen ? asset($modelo->ruta_imagen) : null;

            return response()->json([
                'success' => true,
                'data' => [
                    'carrito_id' => $carritoItem->id,
                    'modelo_id' => $modelo->idModelo,
                    'nombre' => $modelo->nombre,
                    'precio' => $modelo->precio,
                    'descripcion' => $modelo->descripcion,
                    'dimensiones' => $modelo->dimensiones,
                    'imagen_url' => $imagen_url,
                    'cantidad' => $carritoItem->cantidad,
                    'subtotal' => $carritoItem->cantidad * $modelo->precio
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el item del carrito: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'cantidad' => 'required|integer|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $carritoItem = Carrito::findOrFail($id);
            $carritoItem->cantidad = $request->cantidad;
            $carritoItem->save();

            $modelo = $carritoItem->modelo;
            $imagen_url = $modelo->ruta_imagen ? asset($modelo->ruta_imagen) : null;

            return response()->json([
                'success' => true,
                'message' => 'Cantidad actualizada correctamente',
                'data' => [
                    'carrito_id' => $carritoItem->id,
                    'modelo_id' => $modelo->idModelo,
                    'nombre' => $modelo->nombre,
                    'precio' => $modelo->precio,
                    'descripcion' => $modelo->descripcion,
                    'dimensiones' => $modelo->dimensiones,
                    'imagen_url' => $imagen_url,
                    'cantidad' => $carritoItem->cantidad,
                    'subtotal' => $carritoItem->cantidad * $modelo->precio
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el carrito: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un artículo del carrito
     * 
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $carritoItem = Carrito::findOrFail($id);
            $carritoItem->delete();

            return response()->json([
                'success' => true,
                'message' => 'Item eliminado del carrito correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar del carrito: ' . $e->getMessage()
            ], 500);
        }
    }

    public function vaciarCarrito(Request $request)
    {
        try {
            $userId = $request->user_id;

            Carrito::where('iduser', $userId)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Carrito vaciado correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al vaciar el carrito: ' . $e->getMessage()
            ], 500);
        }
    }
}
