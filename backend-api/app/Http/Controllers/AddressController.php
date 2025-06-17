<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Address;

class AddressController extends Controller
{
    public function index()
    {
        return response()->json(Auth::user()->addresses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name'    => 'required|string|max:255',
            'last_name'     => 'required|string|max:255',
            'street_name'   => 'required|string|max:255',
            'department'    => 'required|string|max:255',
            'province'      => 'required|string|max:255',
            'district'      => 'required|string|max:255',
            'postal_code'   => 'required|string|max:20',
            'phone_number'  => 'required|string|max:20',
            'latitude'      => 'nullable|numeric|between:-90,90',
            'longitude'     => 'nullable|numeric|between:-180,180',
        ]);

        $address = Address::create([
            ...$validated,
            'user_id' => Auth::id(),
        ]);

        return response()->json($address, 201);
    }

    public function show(Address $address)
    {
        if (Auth::id() !== $address->user_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json($address);
    }

    public function update(Request $request, Address $address)
    {
        if (Auth::id() !== $address->user_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'first_name'    => 'sometimes|string|max:255',
            'last_name'     => 'sometimes|string|max:255',
            'street_name'   => 'sometimes|string|max:255',
            'department'    => 'sometimes|string|max:255',
            'province'      => 'sometimes|string|max:255',
            'district'      => 'sometimes|string|max:255',
            'postal_code'   => 'sometimes|string|max:20',
            'phone_number'  => 'sometimes|string|max:20',
            'latitude'      => 'nullable|numeric|between:-90,90',
            'longitude'     => 'nullable|numeric|between:-180,180',
        ]);

        if (empty($validated)) {
            return response()->json(['message' => 'Nada que actualizar'], 400);
        }

        $address->update($validated);

        return response()->json($address);
    }

    public function destroy(Address $address)
    {
        if (Auth::id() !== $address->user_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $address->delete();

        return response()->json(null, 204);
    }
}
