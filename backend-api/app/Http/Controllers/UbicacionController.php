<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ubicacion;

class UbicacionController extends Controller
{
     public function store(Request $request)
    {
           // Validación (puedes agregar reglas específicas si es necesario)
    $data = $request->validate([
        'latitud' => 'required|numeric',
        'longitud' => 'required|numeric',
    ]);

    // Guardar en la base de datos
    $ubicacion = new Ubicacion();
    $ubicacion->latitud = $data['latitud'];
    $ubicacion->longitud = $data['longitud'];
    $ubicacion->save();

    return response()->json(['message' => 'Ubicación guardada correctamente'], 201);
    }
}
