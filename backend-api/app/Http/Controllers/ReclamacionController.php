<?php

namespace App\Http\Controllers;

use App\Models\Reclamacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReclamacionController extends Controller
{
    // Listar todas las reclamaciones (admin)
    public function index()
{
    $reclamaciones = Reclamacion::with(['user', 'pedido'])->latest()->get();
    return response()->json([
        'success' => true,
        'data' => $reclamaciones
    ]);
}

    // Registrar una nueva reclamación
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'telefono' => 'nullable|string|max:20',
            'detalle' => 'required|string',
            'idPedido' => 'nullable|exists:pedidos,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Validar que el pedido pertenezca al usuario autenticado
        if ($request->idPedido) {
            $pedido = \App\Models\Pedido::where('id', $request->idPedido)
                ->where('iduser', auth()->id())
                ->first();
            if (!$pedido) {
                return response()->json(['error' => 'El pedido no pertenece al usuario.'], 403);
            }
        }

        $reclamacion = Reclamacion::create([
            'user_id' => auth()->id(),
            'telefono' => $request->telefono,
            'detalle' => $request->detalle,
            'idPedido' => $request->idPedido,
            'estado' => 'pendiente',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reclamación registrada correctamente',
            'data' => $reclamacion
        ], 201);
    }

    // Ver una reclamación específica
    public function show($id)
    {
        $reclamacion = Reclamacion::with(['user', 'pedido'])->findOrFail($id);
        return response()->json($reclamacion);
    }
    public function misReclamaciones()
    {
        $userId = auth()->id();
        $reclamaciones = Reclamacion::with(['pedido'])
            ->where('user_id', $userId)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reclamaciones
        ]);
    }
}