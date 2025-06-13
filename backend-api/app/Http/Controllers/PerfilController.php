<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; 
 
class PerfilController extends Controller
{
    public function show()
    {
        $user = Auth::user();
        return response()->json($user->perfil);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'nombre_completo' => 'required|string|max:255',
            'celular' => 'required|string|max:20',
            'direccion' => 'required|string|max:255',
            'referencia' => 'nullable|string|max:255',
            'latitud' => 'nullable|numeric',
            'longitud' => 'nullable|numeric',
        ]);

        $perfil = $user->perfil;

        if ($perfil) {
            $perfil->update($validated);
        } else {
            $perfil = $user->perfil()->create($validated);
        }

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'perfil' => $perfil
        ]);
    }
}
