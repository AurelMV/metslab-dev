<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pedido;
use App\Models\Carrito;
use App\Models\Pago;
use App\Models\DetallePedido;

class PedidoController extends Controller
{
    public function crearPedido(Request $request)
    {
        $request->validate([
            'iduser' => 'required|exists:users,id',
            'tipoPedido' => 'required|string|max:45',
            'idPago' => 'required|exists:pagos,id',
            'direccion' => 'required|array',
            'direccion.first_name' => 'required|string|max:255',
            'direccion.last_name' => 'required|string|max:255',
            'direccion.street_name' => 'required|string|max:255',
            'direccion.department' => 'required|string|max:255',
            'direccion.province' => 'required|string|max:255',
            'direccion.district' => 'required|string|max:255',
            'direccion.postal_code' => 'required|string|max:20',
            'direccion.phone_number' => 'required|string|max:20',
        ]);

        // Crear el pedido
        $pedido = Pedido::create([
            'iduser' => $request->iduser,
            'idPago' => $request->idPago,
            'tipoPedido' => $request->tipoPedido,
            'estado' => 'pendiente',
            'totalPago' => 0, // Se calculará más adelante
            'fentrega' => now()->addDays(3), // Ejemplo de entrega en 3 días
        ]);

        // Obtener los artículos del carrito
        $carritos = Carrito::where('iduser', $request->iduser)->get();

        foreach ($carritos as $carrito) {
            DetallePedido::create([
                'cantidad' => $carrito->cantidad,
                'nombre' => $carrito->modelo->nombre,
                'precio' => $carrito->modelo->precio,
                'precioTotal' => $carrito->cantidad * $carrito->modelo->precio,
                'idModelo' => $carrito->idModelo,
                'idPedido' => $pedido->id,
            ]);

            // Sumar el total del pedido
            $pedido->totalPago += $carrito->cantidad * $carrito->modelo->precio;
        }

        // Guardar el total del pedido
        $pedido->save();

        // Limpiar el carrito después de crear el pedido
        Carrito::where('iduser', $request->iduser)->delete();

        return response()->json(['mensaje' => 'Pedido creado con éxito', 'pedido' => $pedido], 201);
    }
}