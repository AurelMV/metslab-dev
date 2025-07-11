<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SeguimientoController extends Controller
{
    /**
     * SEGUIMIENTO DE PEDIDOS ACTIVOS
     * Muestra solo los pedidos que se pueden seguir con información mínima
     * Similar al seguimiento de AliExpress
     */
    public function seguimiento(Request $request)
    {
        try {
            $userId = Auth::id();

            // Estados que se pueden seguir (pedidos activos)
            $estadosActivos = ['pendiente', 'pagado', 'en_proceso', 'enviado'];

            $pedidosActivos = Pedido::where('iduser', $userId)
                ->whereIn('estado', $estadosActivos)
                ->with([
                    'pago:id,estado,monto,payment_method',
                    'detalles:id,idPedido,cantidad,nombre,precio'
                ])
                ->orderBy('fecha_pedido', 'desc')
                ->get();

            $seguimiento = $pedidosActivos->map(function ($pedido) {
                // Obtener el primer producto como representativo
                $productoRepresentativo = $pedido->detalles->first();

                return [
                    'id' => $pedido->id,
                    'numero_pedido' => str_pad($pedido->id, 6, '0', STR_PAD_LEFT),
                    'estado' => $pedido->estado,
                    'estado_formateado' => $this->getEstadoSeguimiento($pedido->estado),
                    'fecha_pedido' => $pedido->fecha_pedido->format('d/m/Y'),
                    'fecha_entrega_estimada' => $pedido->fentrega ? $pedido->fentrega->format('d/m/Y') : null,
                    'total_pago' => $pedido->totalPago,
                    'tipo_pedido' => $pedido->TipoPedido,

                    // Información mínima del producto principal
                    'producto_principal' => $productoRepresentativo ? [
                        'nombre' => $productoRepresentativo->nombre,
                        'cantidad' => $productoRepresentativo->cantidad,
                        'precio' => $productoRepresentativo->precio
                    ] : null,

                    // Cantidad total de productos en el pedido
                    'total_productos' => $pedido->detalles->sum('cantidad'),

                    // Estado del pago (importante para seguimiento)
                    'estado_pago' => $pedido->pago ? $pedido->pago->estado : null,

                    // Progreso del pedido (porcentaje)
                    'progreso' => $this->calcularProgreso($pedido->estado),

                    // Próximo paso en el proceso
                    'proximo_paso' => $this->getProximoPaso($pedido->estado)
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $seguimiento,
                'total_pedidos_activos' => $seguimiento->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el seguimiento de pedidos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * HISTORIAL COMPLETO DE PEDIDOS
     * Muestra todos los pedidos del usuario con información preview
     */
    public function historial(Request $request)
    {
        try {
            $userId = Auth::id();

            // Parámetros de paginación
            $page = $request->get('page', 1);
            $limit = $request->get('limit', 10);
            $estado = $request->get('estado', null); // Filtro opcional por estado

            $query = Pedido::where('iduser', $userId)
                ->with([
                    'pago:id,estado,monto,payment_method',
                    'detalles:id,idPedido,cantidad,nombre,precio'
                ])
                ->orderBy('fecha_pedido', 'desc');

            // Aplicar filtro por estado si se proporciona
            if ($estado) {
                $query->where('estado', $estado);
            }

            $pedidos = $query->paginate($limit, ['*'], 'page', $page);

            $historial = $pedidos->getCollection()->map(function ($pedido) {
                $productoRepresentativo = $pedido->detalles->first();

                return [
                    'id' => $pedido->id,
                    'numero_pedido' => str_pad($pedido->id, 6, '0', STR_PAD_LEFT),
                    'estado' => $pedido->estado,
                    'estado_formateado' => $pedido->estado_formateado,
                    'fecha_pedido' => $pedido->fecha_pedido->format('d/m/Y H:i'),
                    'total_pago' => $pedido->totalPago,
                    'tipo_pedido' => $pedido->TipoPedido,

                    // Preview del producto principal
                    'producto_preview' => $productoRepresentativo ? [
                        'nombre' => $productoRepresentativo->nombre,
                        'cantidad' => $productoRepresentativo->cantidad
                    ] : null,

                    // Resumen del pedido
                    'resumen' => [
                        'total_productos' => $pedido->detalles->sum('cantidad'),
                        'estado_pago' => $pedido->pago ? $pedido->pago->estado : null,
                        'metodo_pago' => $pedido->pago ? $pedido->pago->payment_method : null
                    ],

                    // Indicador si se puede seguir
                    'se_puede_seguir' => in_array($pedido->estado, ['pendiente', 'pagado', 'en_proceso', 'enviado']),

                    // Fechas importantes
                    'fecha_entrega' => $pedido->fentrega ? $pedido->fentrega->format('d/m/Y') : null,
                    'dias_desde_pedido' => $pedido->fecha_pedido->diffInDays(now())
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $historial,
                'pagination' => [
                    'current_page' => $pedidos->currentPage(),
                    'total_pages' => $pedidos->lastPage(),
                    'total_items' => $pedidos->total(),
                    'per_page' => $pedidos->perPage(),
                    'has_more' => $pedidos->hasMorePages()
                ],
                'estadisticas' => [
                    'total_pedidos' => Pedido::where('iduser', $userId)->count(),
                    'pedidos_completados' => Pedido::where('iduser', $userId)->where('estado', 'entregado')->count(),
                    'pedidos_activos' => Pedido::where('iduser', $userId)->whereIn('estado', ['pendiente', 'pagado', 'en_proceso', 'enviado'])->count()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el historial de pedidos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * DETALLES COMPLETOS DE UN PEDIDO
     * Muestra toda la información detallada de un pedido específico
     */
    public function detalles($id)
    {
        try {
            $userId = Auth::id();

            $pedido = Pedido::where('id', $id)
                ->where('iduser', $userId)
                ->with([
                    'pago:id,estado,monto,payment_method,order_id,token_pago,Pagocol,created_at',
                    'address:id,first_name,last_name,street_name,department,province,district,phone_number,postal_code',
                    'detalles:id,idPedido,cantidad,nombre,precio,precioTotal,idModelo',
                    'detalles.modelo:idModelo,nombre,descripcion,ruta_imagen'
                ])
                ->first();

            if (!$pedido) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pedido no encontrado o no tienes permisos para verlo'
                ], 404);
            }

            $detallesCompletos = [
                // Información básica del pedido
                'pedido' => [
                    'id' => $pedido->id,
                    'numero_pedido' => str_pad($pedido->id, 6, '0', STR_PAD_LEFT),
                    'estado' => $pedido->estado,
                    'estado_formateado' => $pedido->estado_formateado,
                    'fecha_pedido' => $pedido->fecha_pedido->format('d/m/Y H:i:s'),
                    'fecha_entrega_estimada' => $pedido->fentrega ? $pedido->fentrega->format('d/m/Y') : null,
                    'tipo_pedido' => $pedido->TipoPedido,
                    'external_reference' => $pedido->external_reference,
                    'notas' => $pedido->notas ?? null
                ],

                // Información detallada del pago
                'pago' => $pedido->pago ? [
                    'id' => $pedido->pago->id,
                    'estado' => $pedido->pago->estado,
                    'estado_formateado' => $pedido->pago->estado_formateado,
                    'monto' => $pedido->pago->monto,
                    'metodo_pago' => $pedido->pago->payment_method,
                    'order_id' => $pedido->pago->order_id,
                    'token_pago' => $pedido->pago->token_pago,
                    'fecha_pago' => $pedido->pago->created_at ? $pedido->pago->created_at->format('d/m/Y H:i:s') : null
                ] : null,

                // Información de la dirección de entrega
                'direccion_entrega' => $pedido->address ? [
                    'id' => $pedido->address->id,
                    'destinatario' => $pedido->address->first_name . ' ' . $pedido->address->last_name,
                    'direccion_completa' => $pedido->address->street_name,
                    'departamento' => $pedido->address->department,
                    'provincia' => $pedido->address->province,
                    'distrito' => $pedido->address->district,
                    'codigo_postal' => $pedido->address->postal_code,
                    'telefono' => $pedido->address->phone_number
                ] : null,

                // Lista completa de productos
                'productos' => $pedido->detalles->map(function ($detalle) {
                    return [
                        'id' => $detalle->id,
                        'nombre' => $detalle->nombre,
                        'cantidad' => $detalle->cantidad,
                        'precio_unitario' => $detalle->precio,
                        'precio_total' => $detalle->precioTotal,
                        'modelo_id' => $detalle->idModelo,
                        'modelo_info' => $detalle->modelo ? [
                            'nombre' => $detalle->modelo->nombre,
                            'descripcion' => $detalle->modelo->descripcion,
                            'imagen' => $detalle->modelo->ruta_imagen ? asset($detalle->modelo->ruta_imagen) : null
                        ] : null
                    ];
                }),

                // Resumen financiero
                'resumen_financiero' => [
                    'subtotal' => $pedido->detalles->sum('precioTotal'),
                    'costo_envio' => $pedido->delivery_fee,
                    'total_final' => $pedido->totalPago,
                    'descuentos' => 0, // Por si se implementan descuentos en el futuro
                    'impuestos' => 0   // Por si se implementan impuestos en el futuro
                ],

                // Información de seguimiento
                'seguimiento' => [
                    'estado_actual' => $pedido->estado,
                    'progreso' => $this->calcularProgreso($pedido->estado),
                    'se_puede_seguir' => in_array($pedido->estado, ['pendiente', 'pagado', 'en_proceso', 'enviado']),
                    'timeline' => $this->getTimelineDetallado($pedido->estado),
                    'proximo_paso' => $this->getProximoPaso($pedido->estado)
                ],

                // Estadísticas del pedido
                'estadisticas' => [
                    'total_productos' => $pedido->detalles->sum('cantidad'),
                    'tipos_productos' => $pedido->detalles->count(),
                    'dias_desde_pedido' => $pedido->fecha_pedido->diffInDays(now()),
                    'tiempo_estimado_entrega' => $pedido->fentrega ? $pedido->fentrega->diffInDays(now()) : null
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $detallesCompletos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los detalles del pedido: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * MÉTODOS PRIVADOS DE APOYO
     */

    private function getEstadoSeguimiento($estado)
    {
        return match ($estado) {
            'pendiente' => 'Pendiente de Pago',
            'pagado' => 'Pago Confirmado',
            'en_proceso' => 'En Preparación',
            'enviado' => 'En Camino',
            'entregado' => 'Entregado',
            'cancelado' => 'Cancelado',
            'rechazado' => 'Rechazado',
            default => ucfirst($estado)
        };
    }

    private function calcularProgreso($estado)
    {
        return match ($estado) {
            'pendiente' => 10,
            'pagado' => 25,
            'en_proceso' => 50,
            'enviado' => 75,
            'entregado' => 100,
            'cancelado' => 0,
            'rechazado' => 0,
            default => 0
        };
    }

    private function getProximoPaso($estado)
    {
        return match ($estado) {
            'pendiente' => 'Esperando confirmación de pago',
            'pagado' => 'Preparando tu pedido',
            'en_proceso' => 'Empacando productos',
            'enviado' => 'En camino a tu dirección',
            'entregado' => 'Pedido completado',
            'cancelado' => 'Pedido cancelado',
            'rechazado' => 'Pago rechazado',
            default => 'Estado desconocido'
        };
    }

    private function getTimelineDetallado($estadoActual)
    {
        $timeline = [
            'pedido_creado' => [
                'nombre' => 'Pedido Creado',
                'descripcion' => 'Tu pedido ha sido registrado',
                'completado' => true,
                'fecha' => null
            ],
            'pago_confirmado' => [
                'nombre' => 'Pago Confirmado',
                'descripcion' => 'El pago ha sido procesado exitosamente',
                'completado' => in_array($estadoActual, ['pagado', 'en_proceso', 'enviado', 'entregado']),
                'fecha' => null
            ],
            'en_preparacion' => [
                'nombre' => 'En Preparación',
                'descripcion' => 'Estamos preparando tu pedido',
                'completado' => in_array($estadoActual, ['en_proceso', 'enviado', 'entregado']),
                'fecha' => null
            ],
            'enviado' => [
                'nombre' => 'Enviado',
                'descripcion' => 'Tu pedido está en camino',
                'completado' => in_array($estadoActual, ['enviado', 'entregado']),
                'fecha' => null
            ],
            'entregado' => [
                'nombre' => 'Entregado',
                'descripcion' => 'Tu pedido ha sido entregado exitosamente',
                'completado' => $estadoActual === 'entregado',
                'fecha' => null
            ]
        ];

        return $timeline;
    }
}
