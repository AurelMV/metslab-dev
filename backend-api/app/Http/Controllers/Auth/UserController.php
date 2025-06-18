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
}
