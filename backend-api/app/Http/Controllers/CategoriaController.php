<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Categoria;
class CategoriaController extends Controller
{
      public function index()
    {
        try {
            $categorias = Categoria::all();
            return response()->json($categorias, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener categorías'], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'nombre' => 'required|string|max:255|unique:categorias,nombre'
            ]);

            $categoria = new Categoria();
            $categoria->nombre = $request->nombre;
            $categoria->save();

            return response()->json([
                'message' => 'Categoría creada exitosamente',
                'categoria' => $categoria
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al crear categoría'], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $categoria = Categoria::findOrFail($id);
            return response()->json($categoria, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Categoría no encontrada'], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $request->validate([
                'nombre' => 'required|string|max:255|unique:categorias,nombre,' . $id
            ]);

            $categoria = Categoria::findOrFail($id);
            $categoria->nombre = $request->nombre;
            $categoria->save();

            return response()->json([
                'message' => 'Categoría actualizada exitosamente',
                'categoria' => $categoria
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al actualizar categoría'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $categoria = Categoria::findOrFail($id);
            $categoria->delete();

            return response()->json([
                'message' => 'Categoría eliminada exitosamente'
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al eliminar categoría'], 500);
        }
    }
}
