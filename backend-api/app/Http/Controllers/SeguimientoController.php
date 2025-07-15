<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SeguimientoController extends Controller
{
    /**
     * SEGUIMIENTO DE PEDIDOS ACTIVOS
     * Muestra solo los pedidos que se pueden seguir según el tipo de entrega
     */
    public function seguimiento(Request $request)
    {
        try {
            $userId = Auth::id();

            // Estados que se pueden seguir (excluyendo estados finales)
            $estadosActivos = $this->getEstadosActivos();

            $pedidosActivos = Pedido::where('iduser', $userId)
                ->whereIn('estado', $estadosActivos)
                ->with([
                    'pago:id,estado,monto,payment_method',
                    'detalles:id,idPedido,cantidad,nombre,precio'
                ])
                ->orderBy('fecha_pedido', 'desc')
                ->get();

            $seguimiento = $pedidosActivos->map(function ($pedido) {
                // Determinar el tipo de entrega
                $tipoEntrega = $pedido->TipoPedido;
                
                // Obtener el primer producto como representativo
                $productoRepresentativo = $pedido->detalles->first();

                return [
                    'id' => $pedido->id,
                    'numero_pedido' => str_pad($pedido->id, 6, '0', STR_PAD_LEFT),
                    'estado' => $pedido->estado,
                    'estado_formateado' => $this->getEstadoFormateado($pedido->estado),
                    'fecha_pedido' => $pedido->fecha_pedido->format('d/m/Y'),
                    'fecha_entrega_estimada' => $pedido->fentrega ? $pedido->fentrega->format('d/m/Y') : null,
                    'total_pago' => $pedido->totalPago,
                    'tipo_pedido' => $tipoEntrega,

                    // Información del producto principal
                    'producto_principal' => $productoRepresentativo ? [
                        'nombre' => $productoRepresentativo->nombre,
                        'cantidad' => $productoRepresentativo->cantidad,
                        'precio' => $productoRepresentativo->precio
                    ] : null,

                    'total_productos' => $pedido->detalles->sum('cantidad'),
                    'estado_pago' => $pedido->pago ? $pedido->pago->estado : null,
                    'progreso' => $this->calcularProgreso($pedido->estado, $tipoEntrega),
                    'proximo_paso' => $this->getProximoPaso($pedido->estado, $tipoEntrega),
                    'fase_actual' => $this->getFaseActual($pedido->estado, $tipoEntrega),
                    'visible_para_usuario' => $this->esVisibleParaUsuario($pedido->estado)
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
                    'estado_formateado' => $this->getEstadoFormateado($pedido->estado),
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
                    'se_puede_seguir' => in_array($pedido->estado, $this->getEstadosActivos()),

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
                    'pedidos_completados' => Pedido::where('iduser', $userId)->where('estado', 'completado')->count(),
                    'pedidos_activos' => Pedido::where('iduser', $userId)->whereIn('estado', $this->getEstadosActivos())->count()
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
                    'progreso' => $this->calcularProgreso($pedido->estado, $pedido->TipoPedido),
                    'se_puede_seguir' => in_array($pedido->estado, $this->getEstadosActivos()),
                    'timeline' => $this->getTimelineDetallado($pedido->estado, $pedido->TipoPedido),
                    'proximo_paso' => $this->getProximoPaso($pedido->estado, $pedido->TipoPedido)
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

    /**
     * Obtiene los estados que se consideran activos (no finales)
     */
    private function getEstadosActivos()
    {
        return [
            'pedido_realizado', 'capturado', 'pago_confirmado', 'en_espera',
            'pendiente_envio', 'en_preparacion', 'en_camino', 'en_transito',
            'en_reparto', 'intento_entrega', 'retrasado', 'perdido', 'pendiente_recogida'
        ];
    }

    /**
     * Obtiene el texto formateado del estado
     */
    private function getEstadoFormateado($estado)
    {
        return match ($estado) {
            'pedido_realizado' => 'Pedido Realizado',
            'capturado' => 'Capturado',
            'pago_confirmado' => 'Pago Confirmado',
            'en_espera' => 'En Espera',
            'pendiente_envio' => 'Pendiente de Envío',
            'en_preparacion' => 'En Preparación',
            'en_camino' => 'En Camino',
            'en_transito' => 'En Tránsito',
            'en_reparto' => 'En Reparto',
            'intento_entrega' => 'Intento de Entrega',
            'entregado' => 'Entregado',
            'pendiente_recogida' => 'Pendiente de Recogida',
            'completado' => 'Completado',
            'devuelto' => 'Devuelto',
            'cancelado' => 'Cancelado',
            'rechazado' => 'Rechazado',
            'retrasado' => 'Retrasado',
            'perdido' => 'Perdido',
            'archivado' => 'Archivado',
            default => ucfirst(str_replace('_', ' ', $estado))
        };
    }

    /**
     * Obtiene la fase actual del pedido
     */
    private function getFaseActual($estado, $tipoEntrega)
    {
        if (in_array($estado, ['pedido_realizado', 'capturado', 'pago_confirmado', 'en_espera'])) {
            return 'Pre-procesamiento';
        }
        
        if (in_array($estado, ['pendiente_envio', 'en_preparacion'])) {
            return 'Preparación & Programación';
        }
        
        if ($tipoEntrega === 'delivery') {
            if (in_array($estado, ['en_camino', 'en_transito', 'en_reparto', 'intento_entrega', 'entregado', 'retrasado', 'perdido'])) {
                return 'Envío & Entrega';
            }
        } else {
            if ($estado === 'pendiente_recogida') {
                return 'Listo para Recogida';
            }
        }
        
        if (in_array($estado, ['completado', 'devuelto', 'cancelado', 'rechazado', 'archivado'])) {
            return 'Post-entrega & Cierre';
        }
        
        return 'Fase no definida';
    }

    /**
     * Calcula el progreso del pedido según el tipo de entrega
     */
    private function calcularProgreso($estado, $tipoEntrega)
    {
        if ($tipoEntrega === 'delivery') {
            return match ($estado) {
                'pedido_realizado' => 10,
                'capturado' => 20,
                'pago_confirmado' => 30,
                'en_espera' => 40,
                'pendiente_envio' => 50,
                'en_preparacion' => 60,
                'en_camino' => 70,
                'en_transito' => 80,
                'en_reparto' => 90,
                'intento_entrega' => 85,
                'entregado' => 100,
                'completado' => 100,
                'retrasado' => 75,
                'perdido' => 50,
                'devuelto' => 30,
                'cancelado' => 0,
                'rechazado' => 0,
                'archivado' => 100,
                default => 0
            };
        } else {
            return match ($estado) {
                'pedido_realizado' => 15,
                'capturado' => 25,
                'pago_confirmado' => 40,
                'en_espera' => 50,
                'pendiente_envio' => 60,
                'en_preparacion' => 80,
                'pendiente_recogida' => 90,
                'completado' => 100,
                'cancelado' => 0,
                'archivado' => 100,
                default => 0
            };
        }
    }

    /**
     * Obtiene el próximo paso según el estado y tipo de entrega
     */
    private function getProximoPaso($estado, $tipoEntrega)
    {
        if ($tipoEntrega === 'delivery') {
            return match ($estado) {
                'pedido_realizado' => 'Procesamiento del pago',
                'capturado' => 'Confirmación del pago',
                'pago_confirmado' => 'Preparación del pedido',
                'en_espera' => 'Programación del envío',
                'pendiente_envio' => 'Preparación del producto',
                'en_preparacion' => 'Envío del pedido',
                'en_camino' => 'Entrega en destino',
                'en_transito' => 'Reparto final',
                'en_reparto' => 'Entrega al cliente',
                'intento_entrega' => 'Nuevo intento de entrega',
                'entregado' => 'Confirmación de recepción',
                'retrasado' => 'Reprogramación de entrega',
                'perdido' => 'Investigación y reposición',
                'completado' => 'Proceso finalizado',
                'devuelto' => 'Proceso de devolución',
                'cancelado' => 'Proceso finalizado',
                'rechazado' => 'Proceso finalizado',
                'archivado' => 'Proceso finalizado',
                default => 'Paso no definido'
            };
        } else {
            return match ($estado) {
                'pedido_realizado' => 'Procesamiento del pago',
                'capturado' => 'Confirmación del pago',
                'pago_confirmado' => 'Preparación del pedido',
                'en_espera' => 'Programación de preparación',
                'pendiente_envio' => 'Preparación del producto',
                'en_preparacion' => 'Notificación de recogida',
                'pendiente_recogida' => 'Recogida del cliente',
                'completado' => 'Proceso finalizado',
                'cancelado' => 'Proceso finalizado',
                'archivado' => 'Proceso finalizado',
                default => 'Paso no definido'
            };
        }
    }

    /**
     * Verifica si el estado es visible para el usuario
     */
    private function esVisibleParaUsuario($estado)
    {
        return !in_array($estado, ['archivado', 'rechazado']);
    }

    /**
     * Obtiene el timeline detallado según el tipo de entrega
     */
    private function getTimelineDetallado($estado, $tipoEntrega)
    {
        if ($tipoEntrega === 'delivery') {
            return [
                'pedido_realizado' => [
                    'nombre' => 'Pedido Realizado',
                    'descripcion' => 'Tu pedido ha sido registrado',
                    'completado' => true,
                    'fecha' => null
                ],
                'capturado' => [
                    'nombre' => 'Capturado',
                    'descripcion' => 'El pedido ha sido capturado por el administrador',
                    'completado' => in_array($estado, ['capturado', 'pago_confirmado', 'en_espera', 'pendiente_envio', 'en_preparacion', 'en_camino', 'en_transito', 'en_reparto', 'intento_entrega', 'entregado', 'completado']),
                    'fecha' => null
                ],
                'pago_confirmado' => [
                    'nombre' => 'Pago Confirmado',
                    'descripcion' => 'El pago ha sido procesado exitosamente',
                    'completado' => in_array($estado, ['pago_confirmado', 'en_espera', 'pendiente_envio', 'en_preparacion', 'en_camino', 'en_transito', 'en_reparto', 'intento_entrega', 'entregado', 'completado']),
                    'fecha' => null
                ],
                'en_preparacion' => [
                    'nombre' => 'En Preparación',
                    'descripcion' => 'Estamos preparando tu pedido',
                    'completado' => in_array($estado, ['en_preparacion', 'en_camino', 'en_transito', 'en_reparto', 'intento_entrega', 'entregado', 'completado']),
                    'fecha' => null
                ],
                'en_camino' => [
                    'nombre' => 'En Camino',
                    'descripcion' => 'Tu pedido está en ruta',
                    'completado' => in_array($estado, ['en_camino', 'en_transito', 'en_reparto', 'intento_entrega', 'entregado', 'completado']),
                    'fecha' => null
                ],
                'entregado' => [
                    'nombre' => 'Entregado',
                    'descripcion' => 'Tu pedido ha sido entregado exitosamente',
                    'completado' => in_array($estado, ['entregado', 'completado']),
                    'fecha' => null
                ]
            ];
        } else {
            return [
                'pedido_realizado' => [
                    'nombre' => 'Pedido Realizado',
                    'descripcion' => 'Tu pedido ha sido registrado',
                    'completado' => true,
                    'fecha' => null
                ],
                'capturado' => [
                    'nombre' => 'Capturado',
                    'descripcion' => 'El pedido ha sido capturado por el administrador',
                    'completado' => in_array($estado, ['capturado', 'pago_confirmado', 'en_espera', 'pendiente_envio', 'en_preparacion', 'pendiente_recogida', 'completado']),
                    'fecha' => null
                ],
                'pago_confirmado' => [
                    'nombre' => 'Pago Confirmado',
                    'descripcion' => 'El pago ha sido procesado exitosamente',
                    'completado' => in_array($estado, ['pago_confirmado', 'en_espera', 'pendiente_envio', 'en_preparacion', 'pendiente_recogida', 'completado']),
                    'fecha' => null
                ],
                'en_preparacion' => [
                    'nombre' => 'En Preparación',
                    'descripcion' => 'Estamos preparando tu pedido',
                    'completado' => in_array($estado, ['en_preparacion', 'pendiente_recogida', 'completado']),
                    'fecha' => null
                ],
                'pendiente_recogida' => [
                    'nombre' => 'Listo para Recogida',
                    'descripcion' => 'Tu pedido está listo para ser recogido',
                    'completado' => in_array($estado, ['pendiente_recogida', 'completado']),
                    'fecha' => null
                ],
                'completado' => [
                    'nombre' => 'Completado',
                    'descripcion' => 'Tu pedido ha sido completado exitosamente',
                    'completado' => $estado === 'completado',
                    'fecha' => null
                ]
            ];
        }
    }

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
}
