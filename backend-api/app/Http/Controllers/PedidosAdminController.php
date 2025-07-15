<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PedidosAdminController extends Controller
{
    // Estados disponibles en el sistema
    private $estadosDisponibles = [
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
        'pendiente_recogida' => 'Pendiente de Recogida',
        'entregado' => 'Entregado',
        'completado' => 'Completado',
        'retrasado' => 'Retrasado',
        'perdido' => 'Perdido',
        'devuelto' => 'Devuelto',
        'cancelado' => 'Cancelado',
        'rechazado' => 'Rechazado',
        'archivado' => 'Archivado'
    ];

    // Fases del pedido
    private $fases = [
        'Pre-procesamiento' => ['pedido_realizado', 'capturado', 'pago_confirmado'],
        'Preparación & Programación' => ['en_espera', 'pendiente_envio', 'en_preparacion'],
        'Envío & Entrega' => ['en_camino', 'en_transito', 'en_reparto', 'intento_entrega', 'pendiente_recogida'],
        'Post-entrega & Cierre' => ['entregado', 'completado', 'retrasado', 'perdido', 'devuelto', 'cancelado', 'rechazado', 'archivado']
    ];

    // Transiciones válidas de estados
    private $transicionesValidas = [
        'pedido_realizado' => ['capturado', 'cancelado', 'rechazado'],
        'capturado' => ['pago_confirmado', 'en_espera', 'cancelado'],
        'pago_confirmado' => ['en_espera', 'en_preparacion', 'pendiente_envio'],
        'en_espera' => ['en_preparacion', 'pendiente_envio', 'retrasado'],
        'pendiente_envio' => ['en_preparacion', 'en_camino', 'retrasado'],
        'en_preparacion' => ['en_camino', 'pendiente_recogida', 'retrasado'],
        'en_camino' => ['en_transito', 'en_reparto', 'retrasado'],
        'en_transito' => ['en_reparto', 'intento_entrega', 'retrasado'],
        'en_reparto' => ['entregado', 'intento_entrega', 'retrasado'],
        'intento_entrega' => ['entregado', 'en_reparto', 'devuelto'],
        'pendiente_recogida' => ['entregado', 'retrasado', 'perdido'],
        'entregado' => ['completado', 'devuelto'],
        'completado' => ['archivado'],
        'retrasado' => ['en_preparacion', 'en_camino', 'cancelado'],
        'perdido' => ['en_camino', 'devuelto', 'cancelado'],
        'devuelto' => ['en_preparacion', 'cancelado', 'archivado'],
        'cancelado' => ['archivado'],
        'rechazado' => ['archivado'],
        'archivado' => []
    ];

    /**
     * Listar pedidos con filtros y paginación
     */
    public function index(Request $request)
    {
        try {
            $query = Pedido::with(['user', 'detalles.modelo'])
                ->orderBy('created_at', 'desc');

            // Aplicar filtros básicos
            if ($request->filled('estado')) {
                $query->where('estado', $request->estado);
            }

            if ($request->filled('busqueda')) {
                $busqueda = $request->busqueda;
                $query->where(function ($q) use ($busqueda) {
                    $q->where('id', 'LIKE', "%{$busqueda}%")
                      ->orWhereHas('user', function ($userQuery) use ($busqueda) {
                          $userQuery->where('name', 'LIKE', "%{$busqueda}%")
                                  ->orWhere('email', 'LIKE', "%{$busqueda}%");
                      });
                });
            }

            // Paginación simple
            $page = $request->get('page', 1);
            $limit = $request->get('limit', 20);
            $offset = ($page - 1) * $limit;

            $total = $query->count();
            $pedidos = $query->offset($offset)->limit($limit)->get();

            // Formatear datos de forma más simple
            $pedidosFormateados = [];
            
            foreach ($pedidos as $pedido) {
                if (!$pedido->user) {
                    continue; // Saltar pedidos sin usuario
                }

                $pedidosFormateados[] = [
                    'id' => $pedido->id,
                    'numero_pedido' => $pedido->id,
                    'fecha_pedido' => $pedido->created_at->format('d/m/Y H:i'),
                    'cliente' => [
                        'id' => $pedido->user->id,
                        'nombre' => $pedido->user->name ?? 'Sin nombre',
                        'email' => $pedido->user->email ?? 'Sin email'
                    ],
                    'total_productos' => $pedido->detalles->sum('cantidad'),
                    'total_pago' => number_format($pedido->totalPago ?? 0, 2),
                    'estado' => $pedido->estado ?? 'pendiente',
                    'estado_formateado' => $pedido->estado ?? 'Pendiente',
                    'tipo_entrega' => $pedido->TipoPedido ?? 'delivery',
                    'created_at' => $pedido->created_at->toISOString(),
                    'updated_at' => $pedido->updated_at->toISOString()
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $pedidosFormateados,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total_items' => $total,
                    'total_pages' => ceil($total / $limit)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener pedidos admin: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener pedidos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estados disponibles
     */
    public function estadosDisponibles()
    {
        $estados = [
            ['valor' => 'pendiente', 'nombre' => 'Pendiente'],
            ['valor' => 'procesando', 'nombre' => 'Procesando'],
            ['valor' => 'enviado', 'nombre' => 'Enviado'],
            ['valor' => 'entregado', 'nombre' => 'Entregado'],
            ['valor' => 'cancelado', 'nombre' => 'Cancelado']
        ];

        return response()->json([
            'success' => true,
            'data' => $estados
        ]);
    }

    /**
     * Actualizar estado de un pedido individual
     */
    public function actualizarEstado(Request $request, $id)
    {
        try {
            $request->validate([
                'nuevo_estado' => 'required|string'
            ]);

            $pedido = Pedido::findOrFail($id);
            $nuevoEstado = $request->nuevo_estado;

            // Validar que el estado sea válido
            if (!array_key_exists($nuevoEstado, $this->estadosDisponibles)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Estado no válido'
                ], 400);
            }

            // Validar transición
            if (!$this->esTransicionValida($pedido->estado, $nuevoEstado, $pedido->TipoPedido)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transición de estado no válida'
                ], 400);
            }

            // Actualizar estado
            $pedido->estado = $nuevoEstado;
            $pedido->save();

            // Log del cambio
            Log::info("Estado del pedido {$pedido->NumPedido} actualizado a {$nuevoEstado} por admin");

            return response()->json([
                'success' => true,
                'message' => 'Estado actualizado correctamente',
                'data' => [
                    'pedido_id' => $pedido->id,
                    'estado_anterior' => $pedido->getOriginal('estado'),
                    'estado_nuevo' => $nuevoEstado
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error al actualizar estado: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar estado'
            ], 500);
        }
    }

    /**
     * Actualizar estados por lotes
     */
    public function actualizarEstadosLote(Request $request)
    {
        try {
            $request->validate([
                'pedidos' => 'required|array',
                'pedidos.*' => 'integer|exists:pedidos,id',
                'nuevo_estado' => 'required|string',
                'notas' => 'nullable|string'
            ]);

            $pedidosIds = $request->pedidos;
            $nuevoEstado = $request->nuevo_estado;
            $notas = $request->notas;

            // Validar que el estado sea válido
            if (!array_key_exists($nuevoEstado, $this->estadosDisponibles)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Estado no válido'
                ], 400);
            }

            $pedidos = Pedido::whereIn('id', $pedidosIds)->get();
            $actualizados = 0;
            $errores = 0;
            $detallesErrores = [];

            foreach ($pedidos as $pedido) {
                // Validar transición para cada pedido
                if (!$this->esTransicionValida($pedido->estado, $nuevoEstado, $pedido->TipoPedido)) {
                    $errores++;
                    $detallesErrores[] = [
                        'pedido' => $pedido->NumPedido,
                        'error' => 'Transición no válida'
                    ];
                    continue;
                }

                try {
                    $pedido->estado = $nuevoEstado;
                    if ($notas) {
                        $pedido->Notas = ($pedido->Notas ? $pedido->Notas . "\n\n" : '') . 
                                       "Admin: " . $notas . " (" . now()->format('d/m/Y H:i') . ")";
                    }
                    $pedido->save();
                    $actualizados++;
                } catch (\Exception $e) {
                    $errores++;
                    $detallesErrores[] = [
                        'pedido' => $pedido->NumPedido,
                        'error' => $e->getMessage()
                    ];
                }
            }

            Log::info("Actualización masiva de estados: {$actualizados} exitosos, {$errores} errores");

            return response()->json([
                'success' => true,
                'message' => 'Actualización masiva completada',
                'data' => [
                    'actualizados' => $actualizados,
                    'errores' => $errores,
                    'detalles_errores' => $detallesErrores
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error en actualización masiva: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error en actualización masiva'
            ], 500);
        }
    }

    /**
     * Obtener detalles de un pedido específico
     */
    public function show($id)
    {
        try {
            $pedido = Pedido::with(['user', 'detalles.modelo'])->findOrFail($id);

            // Validar que el usuario existe
            if (!$pedido->user) {
                Log::warning("Pedido {$id} sin usuario asociado");
                return response()->json([
                    'success' => false,
                    'message' => 'El pedido no tiene un usuario asociado válido'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $pedido->id,
                    'numero_pedido' => $pedido->id,
                    'fecha_pedido' => $pedido->created_at->format('d/m/Y H:i'),
                    'cliente' => [
                        'id' => $pedido->user->id,
                        'nombre' => $pedido->user->name ?? 'Sin nombre',
                        'email' => $pedido->user->email ?? 'Sin email'
                    ],
                    'items' => $pedido->detalles->map(function ($detalle) {
                        return [
                            'id' => $detalle->id,
                            'modelo' => $detalle->modelo->nombre ?? 'Sin modelo',
                            'cantidad' => $detalle->cantidad,
                            'precio_unitario' => $detalle->precio,
                            'subtotal' => $detalle->cantidad * $detalle->precio
                        ];
                    }),
                    'total_pago' => $pedido->totalPago,
                    'estado' => $pedido->estado,
                    'estado_formateado' => $this->estadosDisponibles[$pedido->estado] ?? $pedido->estado,
                    'tipo_entrega' => $pedido->TipoPedido,
                    'direccion_entrega' => $pedido->address->direccion ?? 'Sin dirección',
                    'telefono_contacto' => $pedido->user->telefono ?? 'Sin teléfono',
                    'notas' => $pedido->notas ?? '',
                    'fase_actual' => $this->obtenerFaseActual($pedido->estado),
                    'historial_estados' => $this->obtenerHistorialEstados($pedido)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener detalles del pedido: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener detalles del pedido'
            ], 500);
        }
    }

    /**
     * Obtener detalles administrativos completos de un pedido
     */
    public function obtenerDetallesAdmin($id)
    {
        try {
            $pedido = Pedido::with([
                'user',
                'detalles' => function ($query) {
                    $query->with('modelo');
                }
            ])->findOrFail($id);

            // Obtener información detallada del pedido
            $detalles = [
                'id' => $pedido->id,
                'numero_pedido' => $pedido->id,
                'user_id' => $pedido->iduser,
                'fecha_pedido' => $pedido->created_at->format('Y-m-d H:i:s'),
                'fecha_pedido_formateada' => $pedido->created_at->format('d/m/Y H:i'),
                'estado' => $pedido->estado,
                'estado_formateado' => $this->estadosDisponibles[$pedido->estado] ?? $pedido->estado,
                'fase_actual' => $this->obtenerFaseActual($pedido->estado),
                'tiempo_transcurrido' => $this->calcularTiempoTranscurrido($pedido->created_at),
                'dias_desde_pedido' => $pedido->created_at->diffInDays(now()),
                'puede_cambiar_estado' => $this->puedeAdminCambiarEstado($pedido->estado),
                'siguientes_estados' => $this->obtenerSiguientesEstados($pedido->estado, $pedido->TipoPedido),
                
                // Información del cliente
                'cliente' => [
                    'id' => $pedido->user->id,
                    'nombre' => $pedido->user->name ?? 'Sin nombre',
                    'email' => $pedido->user->email ?? 'Sin email',
                    'fecha_registro' => $pedido->user->created_at->format('d/m/Y'),
                    'total_pedidos' => $pedido->user->pedidos()->count(),
                    'total_gastado' => $pedido->user->pedidos()->sum('totalPago')
                ],
                
                // Información de contacto y entrega
                'telefono_contacto' => $pedido->user->telefono ?? 'Sin teléfono',
                'direccion_entrega' => $pedido->address->direccion ?? 'Sin dirección',
                'tipo_entrega' => $pedido->TipoPedido,
                'fecha_entrega' => $pedido->fentrega,
                'hora_entrega' => $pedido->fentrega ? $pedido->fentrega->format('H:i') : null,
                'instrucciones_entrega' => $pedido->instrucciones ?? '',
                
                // Información de pago
                'total_pago' => number_format($pedido->totalPago, 2),
                'estado_pago' => $pedido->estado ?? 'pendiente',
                'metodo_pago' => $pedido->pago->metodo ?? 'No especificado',
                'referencia_pago' => $pedido->external_reference,
                'fecha_pago' => $pedido->pago ? $pedido->pago->created_at->format('d/m/Y H:i') : null,
                
                // Productos del pedido
                'items' => $pedido->detalles->map(function ($detalle) {
                    return [
                        'id' => $detalle->id,
                        'modelo' => $detalle->modelo->nombre ?? 'Producto no encontrado',
                        'sku' => $detalle->modelo->codigo ?? null,
                        'cantidad' => $detalle->cantidad,
                        'precio_unitario' => number_format($detalle->precio, 2),
                        'subtotal' => number_format($detalle->precio * $detalle->cantidad, 2),
                        'estado' => 'Disponible',
                        'notas' => $detalle->notas ?? ''
                    ];
                }),
                'total_productos' => $pedido->detalles->sum('cantidad'),
                
                // Historial de cambios (simulado por ahora)
                'historial' => [],
                
                // Notas administrativas
                'notas' => $pedido->notas ?? '',
                'notas_internas' => $pedido->notas_internas ?? null,
                
                // Información adicional
                'ip_origen' => null,
                'user_agent' => null,
                'origen_pedido' => 'Web',
                'descuento_aplicado' => 0,
                'codigo_descuento' => null,
                'impuestos' => 0,
                'costo_envio' => $pedido->delivery_fee ?? 0,
                
                // Timestamps
                'created_at' => $pedido->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $pedido->updated_at->format('Y-m-d H:i:s')
            ];

            return response()->json([
                'success' => true,
                'data' => $detalles,
                'message' => 'Detalles administrativos obtenidos exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener detalles administrativos del pedido: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener detalles administrativos del pedido'
            ], 500);
        }
    }

    /**
     * Métodos auxiliares
     */

    private function obtenerFaseActual($estado)
    {
        foreach ($this->fases as $fase => $estados) {
            if (in_array($estado, $estados)) {
                return $fase;
            }
        }
        return 'Sin fase';
    }

    private function puedeAdminCambiarEstado($estado)
    {
        // Los administradores pueden cambiar cualquier estado excepto archivado
        return $estado !== 'archivado';
    }

    private function obtenerSiguientesEstados($estadoActual, $tipoEntrega)
    {
        $siguientes = $this->transicionesValidas[$estadoActual] ?? [];
        
        // Para pedidos de recojo, excluir estados de envío
        if ($tipoEntrega === 'recojo_tienda') {
            $estadosEnvio = ['en_camino', 'en_transito', 'en_reparto', 'intento_entrega'];
            $siguientes = array_diff($siguientes, $estadosEnvio);
        }
        
        return array_values($siguientes);
    }

    private function esTransicionValida($estadoActual, $nuevoEstado, $tipoEntrega)
    {
        $transicionesPermitidas = $this->obtenerSiguientesEstados($estadoActual, $tipoEntrega);
        return in_array($nuevoEstado, $transicionesPermitidas);
    }

    private function obtenerHistorialEstados($pedido)
    {
        // Por simplicidad, retornamos el estado actual
        // En una implementación completa, tendrías una tabla de historial
        return [
            [
                'estado' => $pedido->estado,
                'fecha' => $pedido->updated_at->format('d/m/Y H:i'),
                'usuario' => 'Admin'
            ]
        ];
    }

    private function calcularTiempoTranscurrido($fecha)
    {
        $ahora = now();
        $diferencia = $ahora->diff($fecha);

        // Formatear la diferencia en un string legible
        if ($diferencia->y > 0) {
            return $diferencia->y . ' año' . ($diferencia->y > 1 ? 's' : '');
        } elseif ($diferencia->m > 0) {
            return $diferencia->m . ' mes' . ($diferencia->m > 1 ? 'es' : '');
        } elseif ($diferencia->d > 0) {
            return $diferencia->d . ' día' . ($diferencia->d > 1 ? 's' : '');
        } elseif ($diferencia->h > 0) {
            return $diferencia->h . ' hora' . ($diferencia->h > 1 ? 's' : '');
        } elseif ($diferencia->i > 0) {
            return $diferencia->i . ' minuto' . ($diferencia->i > 1 ? 's' : '');
        } else {
            return 'menos de un minuto';
        }
    }
}
