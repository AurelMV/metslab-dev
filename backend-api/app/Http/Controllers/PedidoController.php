<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\MercadoPagoConfig;
use App\Models\Pedido;
use App\Models\DetallePedido;
use App\Models\Carrito;
use App\Models\Address;

class PedidoController extends Controller
{
    public function create(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->all();

        // Validar datos mínimos
        $request->validate([
            'items' => 'required|array|min:1',
            'delivery_type' => 'required|in:pickup,delivery',
            'delivery_fee' => 'required|numeric|min:0',
            'address_id' => 'nullable|exists:addresses,id',
        ]);

        try {
            DB::beginTransaction();

            // Crear pedido con estado inicial correcto
            $pedido = Pedido::create([
                'iduser' => $user->id,
                'estado' => 'pedido_realizado',
                'totalPago' => $data['total'],
                'TipoPedido' => $data['delivery_type'],
                'fentrega' => now()->addDays(7),
                'fecha_pedido' => now(),
                'address_id' => $data['address_id'] ?? null,
                'delivery_fee' => $data['delivery_fee'],
            ]);

            // Crear detalles del pedido
            foreach ($data['items'] as $item) {
                DetallePedido::create([
                    'idPedido' => $pedido->id,
                    'idModelo' => $item['idModelo'],
                    'cantidad' => $item['cantidad'],
                    'nombre' => $item['nombre'],
                    'precio' => $item['precio'],
                    'precioTotal' => $item['cantidad'] * $item['precio'],
                ]);
            }

            // Generar external_reference único
            $externalReference = 'pedido_' . $pedido->id;
            $pedido->external_reference = $externalReference;
            $pedido->save();

            // Crear preferencia de pago en MercadoPago
            $accessToken = config('services.mercadopago.access_token');
            MercadoPagoConfig::setAccessToken($accessToken);
            if (app()->environment('local')) {
                MercadoPagoConfig::setRuntimeEnviroment(MercadoPagoConfig::LOCAL);
            }
            $preferenceClient = new PreferenceClient();

            $mpItems = [];
            foreach ($data['items'] as $item) {
                $mpItems[] = [
                    'id' => (string) $item['idModelo'],
                    'title' => $item['nombre'],
                    'quantity' => (int) $item['cantidad'],
                    'unit_price' => (float) $item['precio'],
                    'currency_id' => 'PEN',
                ];
            }
            if ($data['delivery_fee'] > 0) {
                $mpItems[] = [
                    'id' => 'delivery_fee',
                    'title' => 'Costo de envío',
                    'quantity' => 1,
                    'unit_price' => (float) $data['delivery_fee'],
                    'currency_id' => 'PEN',
                ];
            }

            $preferenceData = [
                'items' => $mpItems,
                'payer' => [
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'external_reference' => $externalReference,
                'back_urls' => [
                    'success' => $data['back_urls']['success'] ?? '',
                    'failure' => $data['back_urls']['failure'] ?? '',
                    'pending' => $data['back_urls']['pending'] ?? '',
                ],
                'notification_url' => config('app.url') . '/api/payments/webhook',
            ];

            $preference = $preferenceClient->create($preferenceData);

            DB::commit();

            return response()->json([
                'success' => true,
                'pedido_id' => $pedido->id,
                'preference_id' => $preference->id,
                'external_reference' => $externalReference,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creando pedido y preferencia', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el pedido o la preferencia de pago',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
