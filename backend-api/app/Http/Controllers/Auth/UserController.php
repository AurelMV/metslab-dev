<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function getUsers()
    {
        $users = User::all()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->getRoleNames()->first(),
            ];
        });
        return response()->json($users);
    }

    public function changeUserRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|string|exists:roles,name'
        ]);

        $user = User::findOrFail($id);

        // Usar Spatie para asignar el nuevo rol (elimina roles anteriores)
        $user->syncRoles([$request->input('role')]);

        return response()->json(['message' => 'Rol de usuario actualizado']);
    }
    public function getUsersWithPedidos()
    {
        // Excluir el administrador por rol (ajusta si tu campo es diferente)
        $usuarios = User::where('name', '!=', 'Administrador')
            ->with([
                'addresses',
                'pedidos.detalles.modelo' // Relación: pedidos -> detalles -> modelo
            ])
            ->get();

        // Puedes personalizar la estructura si lo necesitas
        $data = $usuarios->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'role' => $user->role,
                'addresses' => $user->addresses,
                'pedidos' => $user->pedidos->map(function ($pedido) {
                    return [
                        'id' => $pedido->id,
                        'estado' => $pedido->estado,
                        'totalPago' => $pedido->totalPago,
                        'TipoPedido' => $pedido->TipoPedido,
                        'fecha_pedido' => $pedido->fecha_pedido,
                        'detalles' => $pedido->detalles->map(function ($detalle) {
                            return [
                                'id' => $detalle->id,
                                'cantidad' => $detalle->cantidad,
                                'precio' => $detalle->precio,
                                'modelo' => $detalle->modelo ? [
                                    'id' => $detalle->modelo->idModelo,
                                    'nombre' => $detalle->modelo->nombre,
                                    'descripcion' => $detalle->modelo->descripcion,
                                    'precio' => $detalle->modelo->precio,
                                    'imagen' => $detalle->modelo->ruta_imagen,
                                ] : null,
                            ];
                        }),
                    ];
                }),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }
}
