<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Color;

class ColorController extends Controller
{
    public function index()
    {
        return response()->json(Color::all());
    }
    public function indexDisponible()
    {
        return response()->json(Color::where('estado', true)->get());
    }


    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:50',
            'codigo_hex' => 'required|regex:/^#[0-9A-Fa-f]{6}$/',
            'estado' => 'boolean',
        ]);

        $color = Color::create([
            'nombre' => $request->nombre,
            'codigo_hex' => strtoupper($request->codigo_hex),
            'estado' => $request->get('estado', true), // Por defecto, estado es true
        ]);

        return response()->json([
            'message' => 'Color registrado correctamente',
            'data' => $color,
        ], 201);
    }


    public function show($id)
    {
        $color = Color::find($id);
        if (!$color) {
            return response()->json(['message' => 'Color no encontrado'], 404);
        }

        return response()->json($color);
    }

    // Actualizar un color (opcional)
    public function update(Request $request, $id)
    {
        $color = Color::find($id);
        if (!$color) {
            return response()->json(['message' => 'Color no encontrado'], 404);
        }

        $request->validate([
            'nombre' => 'sometimes|string|max:50',
            'codigo_hex' => 'sometimes|regex:/^#[0-9A-Fa-f]{6}$/',
            'estado' => 'sometimes|boolean',
        ]);

        $color->update($request->only(['nombre', 'codigo_hex', 'estado']));

        return response()->json([
            'message' => 'Color actualizado',
            'data' => $color,
        ]);
    }

    // Eliminar un color (opcional)
    public function destroy($id)
    {
        $color = Color::find($id);
        if (!$color) {
            return response()->json(['message' => 'Color no encontrado'], 404);
        }

        $color->delete();
        return response()->json(['message' => 'Color eliminado']);
    }
}
