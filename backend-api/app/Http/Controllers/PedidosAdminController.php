<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PedidosAdminController extends Controller
{
    // Estados disponibles en el sistema
    private $estadosDisponibles = [
        'pedido_realizado' => ['nombre' => 'Pedido Realizado', 'fase' => 'Pre-procesamiento'],
        'capturado' => ['nombre' => 'Capturado', 'fase' => 'Pre-procesamiento'],
        'pago_confirmado' => ['nombre' => 'Pago Confirmado', 'fase' => 'Pre-procesamiento'],
        'en_espera' => ['nombre' => 'En Espera', 'fase' => 'Preparación & Programación'],
        'pendiente_envio' => ['nombre' => 'Pendiente de Envío', 'fase' => 'Preparación & Programación'],
        'en_preparacion' => ['nombre' => 'En Preparación', 'fase' => 'Preparación & Programación'],
        'en_camino' => ['nombre' => 'En Camino', 'fase' => 'Envío & Entrega'],
        'en_transito' => ['nombre' => 'En Tránsito', 'fase' => 'Envío & Entrega'],
        'en_reparto' => ['nombre' => 'En Reparto', 'fase' => 'Envío & Entrega'],
        'intento_entrega' => ['nombre' => 'Intento de Entrega', 'fase' => 'Envío & Entrega'],
        'pendiente_recogida' => ['nombre' => 'Pendiente de Recogida', 'fase' => 'Envío & Entrega'],
        'entregado' => ['nombre' => 'Entregado', 'fase' => 'Post-entrega & Cierre'],
        'completado' => ['nombre' => 'Completado', 'fase' => 'Post-entrega & Cierre'],
        'retrasado' => ['nombre' => 'Retrasado', 'fase' => 'Post-entrega & Cierre'],
        'perdido' => ['nombre' => 'Perdido', 'fase' => 'Post-entrega & Cierre'],
        'devuelto' => ['nombre' => 'Devuelto', 'fase' => 'Post-entrega & Cierre'],
        'cancelado' => ['nombre' => 'Cancelado', 'fase' => 'Post-entrega & Cierre'],
        'rechazado' => ['nombre' => 'Rechazado', 'fase' => 'Post-entrega & Cierre'],
        'archivado' => ['nombre' => 'Archivado', 'fase' => 'Post-entrega & Cierre']
    ];

    // Transiciones válidas de estados
    private $transicionesValidas = [
        'pedido_realizado' => ['capturado', 'cancelado', 'rechazado'],
        'capturado' => ['pago_confirmado', 'cancelado'],
        'pago_confirmado' => ['en_espera', 'cancelado'],
        'en_espera' => ['pendiente_envio', 'en_preparacion', 'cancelado'],
        'pendiente_envio' => ['en_preparacion', 'en_camino', 'cancelado'],
        'en_preparacion' => ['en_camino', 'en_transito', 'pendiente_recogida', 'cancelado'],
        'en_camino' => ['en_transito', 'en_reparto', 'entregado', 'intento_entrega', 'devuelto', 'perdido'],
        'en_transito' => ['en_reparto', 'entregado', 'intento_entrega', 'devuelto', 'perdido'],
        'en_reparto' => ['entregado', 'intento_entrega', 'devuelto', 'perdido'],
        'intento_entrega' => ['entregado', 'en_reparto', 'devuelto', 'perdido'],
        'pendiente_recogida' => ['entregado', 'cancelado'],
        'entregado' => ['completado', 'devuelto'],
        'completado' => ['archivado'],
        'retrasado' => ['en_reparto', 'entregado', 'devuelto', 'perdido'],
        'perdido' => ['archivado'],
        'devuelto' => ['archivado'],
        'cancelado' => ['archivado'],
        'rechazado' => ['archivado'],
        'archivado' => []
    ];

    /**
     * Obtener lista de pedidos con filtros y paginación
     */
    public function index(Request $request)
    {
        try {
            $query = Pedido::with(['user', 'detalles.modelo', 'address'])
                ->orderBy('created_at', 'desc');

            // Aplicar filtros
            if ($request->filled('estado')) {
                $query->where('estado', $request->input('estado'));
            }

            if ($request->filled('tipo_entrega')) {
                $query->where('TipoPedido', $request->input('tipo_entrega'));
            }

            if ($request->filled('fecha_desde')) {
                $query->where('created_at', '>=', $request->input('fecha_desde'));
            }

            if ($request->filled('fecha_hasta')) {
                $query->where('created_at', '<=', $request->input('fecha_hasta'));
            }

            if ($request->filled('busqueda')) {
                $busqueda = $request->input('busqueda');
                $query->where(function ($q) use ($busqueda) {
                    $q->where('id', 'LIKE', "%{$busqueda}%")
                        ->orWhereHas('user', function ($userQuery) use ($busqueda) {
                            $userQuery->where('name', 'LIKE', "%{$busqueda}%")
                                ->orWhere('email', 'LIKE', "%{$busqueda}%");
                        });
                });
            }

            // Paginación
            $page = $request->input('page', 1);
            $limit = $request->input('limit', 20);
            $offset = ($page - 1) * $limit;
            $total = $query->count();
            $pedidos = $query->offset($offset)->limit($limit)->get();

            // Formatear datos
            $pedidosFormateados = [];
            foreach ($pedidos as $pedido) {
                if (!$pedido->user) {
                    continue;
                }

                $pedidosFormateados[] = [
                    'id' => $pedido->id,
                    'numero_pedido' => $pedido->id,
                    'fecha_pedido' => $pedido->created_at->format('d/m/Y H:i'),
                    'iduser' => $pedido->iduser,
                    'cliente' => [
                        'id' => $pedido->user->id,
                        'nombre' => $pedido->user->name ?? 'Sin nombre',
                        'email' => $pedido->user->email ?? 'Sin email'
                    ],
                    'total_productos' => $pedido->detalles->sum('cantidad'),
                    'total_pago' => number_format($pedido->totalPago, 2),
                    'estado' => $pedido->estado,
                    'estado_formateado' => $this->estadosDisponibles[$pedido->estado]['nombre'] ?? $pedido->estado,
                    'tipo_entrega' => $pedido->TipoPedido ?? 'delivery',
                    'direccion_entrega' => $pedido->address ? $pedido->address->street_name : 'Sin dirección',
                    'telefono_contacto' => $pedido->address ? $pedido->address->phone_number : 'Sin teléfono',
                    'estado_pago' => $pedido->pago ? $pedido->pago->estado : 'pendiente',
                    'metodo_pago' => $pedido->pago ? $pedido->pago->payment_method : 'N/A',
                    'tiempo_transcurrido' => $this->calcularTiempoTranscurrido($pedido->created_at),
                    'dias_desde_pedido' => $pedido->created_at->diffInDays(now()),
                    'fase_actual' => $this->estadosDisponibles[$pedido->estado]['fase'] ?? 'Desconocido',
                    'puede_cambiar_estado' => $this->puedeActualizarEstado($pedido),
                    'siguientes_estados' => $this->obtenerSiguientesEstados($pedido->estado, $pedido->TipoPedido)
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
            Log::error('Error al obtener pedidos: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener pedidos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener detalles de un pedido específico
     */
    public function show($id)
    {
        try {
            $pedido = Pedido::with(['user', 'detalles.modelo', 'address'])->find($id);

            if (!$pedido) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pedido no encontrado'
                ], 404);
            }

            if (!$pedido->user) {
                return response()->json([
                    'success' => false,
                    'message' => 'El pedido no tiene un usuario asociado válido'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $pedido->id,
                    'numero_pedido' => $pedido->id,
                    'fecha_pedido' => $pedido->created_at->format('d/m/Y H:i'),
                    'iduser' => $pedido->iduser,
                    'cliente' => [
                        'id' => $pedido->user->id,
                        'nombre' => $pedido->user->name ?? 'Sin nombre',
                        'email' => $pedido->user->email ?? 'Sin email'
                    ],
                    'items' => $pedido->detalles->map(function ($detalle) {
                        return [
                            'id' => $detalle->id,
                            'modelo' => $detalle->modelo ? $detalle->modelo->nombre : 'Sin modelo',
                            'cantidad' => $detalle->cantidad,
                            'precio_unitario' => number_format($detalle->precio, 2),
                            'subtotal' => number_format($detalle->cantidad * $detalle->precio, 2)
                        ];
                    }),
                    'total_productos' => $pedido->detalles->sum('cantidad'),
                    'total_pago' => number_format($pedido->totalPago, 2),
                    'estado' => $pedido->estado,
                    'estado_formateado' => $this->estadosDisponibles[$pedido->estado]['nombre'] ?? $pedido->estado,
                    'tipo_entrega' => $pedido->TipoPedido ?? 'delivery',
                    'direccion_entrega' => $pedido->address->direccion ?? 'Sin dirección',
                    'telefono_contacto' => $pedido->user->telefono ?? 'Sin teléfono',
                    'estado_pago' => $pedido->estado_pago ?? 'pendiente',
                    'metodo_pago' => $pedido->metodo_pago ?? 'N/A',
                    'fecha_entrega' => $pedido->fecha_entrega ?? null,
                    'hora_entrega' => $pedido->hora_entrega ?? null,
                    'notas' => $pedido->Notas ?? '',
                    'tiempo_transcurrido' => $this->calcularTiempoTranscurrido($pedido->created_at),
                    'dias_desde_pedido' => $pedido->created_at->diffInDays(now()),
                    'fase_actual' => $this->estadosDisponibles[$pedido->estado]['fase'] ?? 'Desconocido',
                    'puede_cambiar_estado' => $this->puedeActualizarEstado($pedido),
                    'siguientes_estados' => $this->obtenerSiguientesEstados($pedido->estado, $pedido->TipoPedido),
                    'historial_estados' => $this->obtenerHistorialEstados($pedido),
                    'created_at' => $pedido->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $pedido->updated_at->format('Y-m-d H:i:s')
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener detalles del pedido: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener detalles del pedido',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar estado de un pedido
     */
    public function actualizarEstado(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'nuevo_estado' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $pedido = Pedido::find($id);

            if (!$pedido) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pedido no encontrado'
                ], 404);
            }

            $nuevoEstado = $request->input('nuevo_estado');
            $estadoAnterior = $pedido->estado;

            // Validar que el estado sea válido
            if (!array_key_exists($nuevoEstado, $this->estadosDisponibles)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Estado no válido: ' . $nuevoEstado,
                    'estados_disponibles' => array_keys($this->estadosDisponibles)
                ], 400);
            }

            // Validar transición
            if (!$this->esTransicionValida($estadoAnterior, $nuevoEstado, $pedido->TipoPedido)) {
                $estadosPermitidos = $this->obtenerSiguientesEstados($estadoAnterior, $pedido->TipoPedido);
                return response()->json([
                    'success' => false,
                    'message' => "Transición no válida de '{$estadoAnterior}' a '{$nuevoEstado}'",
                    'estado_actual' => $estadoAnterior,
                    'tipo_entrega' => $pedido->TipoPedido,
                    'estados_permitidos' => $estadosPermitidos
                ], 400);
            }

            // Actualizar estado
            $pedido->estado = $nuevoEstado;
            $pedido->updated_at = now();
            $pedido->save();

            Log::info("Estado del pedido {$pedido->id} actualizado de '{$estadoAnterior}' a '{$nuevoEstado}' por admin");

            return response()->json([
                'success' => true,
                'message' => 'Estado actualizado correctamente',
                'data' => [
                    'pedido_id' => $pedido->id,
                    'estado_anterior' => $estadoAnterior,
                    'estado_nuevo' => $nuevoEstado,
                    'tipo_entrega' => $pedido->TipoPedido,
                    'siguientes_estados' => $this->obtenerSiguientesEstados($nuevoEstado, $pedido->TipoPedido)
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al actualizar estado: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar estado',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar estados por lotes
     */
    public function actualizarEstadosLote(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pedidos' => 'required|array',
            'pedidos.*' => 'required|integer|exists:pedidos,id',
            'nuevo_estado' => 'required|string',
            'notas' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $pedidosIds = $request->input('pedidos');
            $nuevoEstado = $request->input('nuevo_estado');
            $notas = $request->input('notas');

            // Validar que el estado sea válido
            if (!array_key_exists($nuevoEstado, $this->estadosDisponibles)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Estado no válido: ' . $nuevoEstado,
                    'estados_disponibles' => array_keys($this->estadosDisponibles)
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
                        'pedido_id' => $pedido->id,
                        'estado_actual' => $pedido->estado,
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
                    $pedido->updated_at = now();
                    $pedido->save();
                    $actualizados++;
                } catch (\Exception $e) {
                    $errores++;
                    $detallesErrores[] = [
                        'pedido_id' => $pedido->id,
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
                    'total_procesados' => count($pedidos),
                    'detalles_errores' => $detallesErrores
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error en actualización masiva: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error en actualización masiva',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estados disponibles
     */
    public function estadosDisponibles()
    {
        try {
            $estadosFormateados = [];
            
            foreach ($this->estadosDisponibles as $valor => $info) {
                $estadosFormateados[] = [
                    'valor' => $valor,
                    'nombre' => $info['nombre'],
                    'fase' => $info['fase']
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $estadosFormateados
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener estados disponibles: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estados disponibles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener detalles completos de un pedido específico para administrador
     * Incluye imágenes de productos y toda la información detallada
     */
    public function detallesCompletos($id)
    {
        try {
            $pedido = Pedido::where('id', $id)
                ->with([
                    'user:id,name,email,created_at',
                    'pago:id,estado,monto,payment_method,order_id,token_pago,created_at,Pagocol',
                    'address:id,first_name,last_name,street_name,department,province,district,phone_number,postal_code',
                    'detalles:id,idPedido,cantidad,nombre,precio,precioTotal,idModelo',
                    'detalles.modelo:idModelo,nombre,descripcion,ruta_imagen,precio'
                ])
                ->first();

            if (!$pedido) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pedido no encontrado'
                ], 404);
            }

            $detallesCompletos = [
                // Información básica del pedido
                'pedido' => [
                    'id' => $pedido->id,
                    'numero_pedido' => str_pad($pedido->id, 6, '0', STR_PAD_LEFT),
                    'estado' => $pedido->estado,
                    'estado_formateado' => $this->estadosDisponibles[$pedido->estado]['nombre'] ?? $pedido->estado,
                    'fecha_pedido' => $pedido->created_at->format('d/m/Y H:i:s'),
                    'fecha_entrega_estimada' => $pedido->fentrega ? $pedido->fentrega->format('d/m/Y') : null,
                    'tipo_pedido' => $pedido->TipoPedido ?? 'delivery',
                    'external_reference' => $pedido->external_reference ?? null,
                    'fase_actual' => $this->estadosDisponibles[$pedido->estado]['fase'] ?? 'Desconocido',
                    'puede_cambiar_estado' => $this->puedeActualizarEstado($pedido),
                    'siguientes_estados' => $this->obtenerSiguientesEstados($pedido->estado, $pedido->TipoPedido)
                ],

                // Información completa del cliente
                'cliente' => $pedido->user ? [
                    'id' => $pedido->user->id,
                    'nombre' => $pedido->user->name ?? 'Sin nombre',
                    'email' => $pedido->user->email ?? 'Sin email',
                    'fecha_registro' => $pedido->user->created_at ? $pedido->user->created_at->format('d/m/Y') : null,
                    'tiempo_como_cliente' => $pedido->user->created_at ? $pedido->user->created_at->diffForHumans() : null
                ] : null,

                // Información detallada del pago
                'pago' => $pedido->pago ? [
                    'id' => $pedido->pago->id,
                    'estado' => $pedido->pago->estado,
                    'estado_formateado' => $this->getEstadoPagoFormateado($pedido->pago->estado),
                    'monto' => number_format($pedido->pago->monto, 2),
                    'metodo_pago' => $pedido->pago->payment_method ?? 'N/A',
                    'order_id' => $pedido->pago->order_id ?? null,
                    'token_pago' => $pedido->pago->token_pago ?? null,
                    'fecha_pago' => $pedido->pago->created_at ? $pedido->pago->created_at->format('d/m/Y H:i:s') : null
                ] : [
                    'estado' => 'pendiente',
                    'estado_formateado' => 'Pendiente',
                    'monto' => number_format($pedido->totalPago, 2),
                    'metodo_pago' => 'N/A',
                    'fecha_pago' => null
                ],

                // Información completa de la dirección de entrega
                'direccion_entrega' => $pedido->address ? [
                    'id' => $pedido->address->id,
                    'destinatario' => trim(($pedido->address->first_name ?? '') . ' ' . ($pedido->address->last_name ?? '')),
                    'direccion_completa' => $pedido->address->street_name ?? 'Sin dirección',
                    'calle' => $pedido->address->street_name ?? 'N/A',
                    'departamento' => $pedido->address->department ?? 'N/A',
                    'provincia' => $pedido->address->province ?? 'N/A',
                    'distrito' => $pedido->address->district ?? 'N/A',
                    'codigo_postal' => $pedido->address->postal_code ?? 'N/A',
                    'telefono' => $pedido->address->phone_number ?? 'Sin teléfono'
                ] : [
                    'destinatario' => 'Sin destinatario',
                    'direccion_completa' => 'Sin dirección',
                    'telefono' => 'Sin teléfono'
                ],

                // Lista completa de productos con imágenes
                'productos' => $pedido->detalles->map(function ($detalle) {
                    $modelo = $detalle->modelo;
                    $imagenUrl = null;
                    
                    if ($modelo && $modelo->ruta_imagen) {
                        // Construir la URL completa de la imagen usando el accessor del modelo
                        $imagenUrl = $modelo->url_imagen;
                    }
                    
                    return [
                        'id' => $detalle->id,
                        'nombre' => $detalle->nombre ?? ($modelo ? $modelo->nombre : 'Producto sin nombre'),
                        'cantidad' => $detalle->cantidad,
                        'precio_unitario' => number_format($detalle->precio, 2),
                        'precio_total' => number_format($detalle->precioTotal ?? ($detalle->cantidad * $detalle->precio), 2),
                        'modelo_id' => $detalle->idModelo,
                        'modelo_info' => $modelo ? [
                            'id' => $modelo->idModelo,
                            'nombre' => $modelo->nombre ?? 'Sin nombre',
                            'descripcion' => $modelo->descripcion ?? 'Sin descripción',
                            'precio_catalogo' => $modelo->precio ? number_format($modelo->precio, 2) : 'N/A',
                            'imagen_url' => $imagenUrl,
                            'tiene_imagen' => !empty($modelo->ruta_imagen)
                        ] : [
                            'nombre' => 'Modelo no disponible',
                            'descripcion' => 'Información no disponible',
                            'imagen_url' => null,
                            'tiene_imagen' => false
                        ]
                    ];
                }),

                // Resumen financiero detallado
                'resumen_financiero' => [
                    'subtotal' => number_format($pedido->detalles->sum('precioTotal'), 2),
                    'costo_envio' => number_format($pedido->delivery_fee ?? 0, 2),
                    'descuentos' => number_format(0, 2), // Para futura implementación
                    'impuestos' => number_format(0, 2),  // Para futura implementación
                    'total_final' => number_format($pedido->totalPago, 2),
                    'moneda' => 'PEN' // Soles peruanos
                ],

                // Información de seguimiento y progreso
                'seguimiento' => [
                    'estado_actual' => $pedido->estado,
                    'estado_formateado' => $this->estadosDisponibles[$pedido->estado]['nombre'] ?? $pedido->estado,
                    'fase_actual' => $this->estadosDisponibles[$pedido->estado]['fase'] ?? 'Desconocido',
                    'progreso' => $this->calcularProgreso($pedido->estado, $pedido->TipoPedido),
                    'puede_cambiar_estado' => $this->puedeActualizarEstado($pedido),
                    'siguientes_estados' => $this->obtenerSiguientesEstados($pedido->estado, $pedido->TipoPedido),
                    'proximo_paso' => $this->getProximoPaso($pedido->estado, $pedido->TipoPedido),
                    'timeline' => $this->getTimelineDetallado($pedido->estado, $pedido->TipoPedido),
                    'historial_estados' => $this->obtenerHistorialEstados($pedido)
                ],

                // Estadísticas del pedido
                'estadisticas' => [
                    'total_productos' => $pedido->detalles->sum('cantidad'),
                    'tipos_productos' => $pedido->detalles->count(),
                    'dias_desde_pedido' => $pedido->created_at->diffInDays(now()),
                    'tiempo_transcurrido' => $this->calcularTiempoTranscurrido($pedido->created_at),
                    'producto_mas_caro' => $pedido->detalles->max('precio'),
                    'producto_mas_barato' => $pedido->detalles->min('precio'),
                    'promedio_precio_producto' => $pedido->detalles->avg('precio')
                ],

                // Metadatos administrativos
                'metadatos' => [
                    'created_at' => $pedido->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $pedido->updated_at->format('Y-m-d H:i:s'),
                    'iduser' => $pedido->iduser,
                    'tiene_pago' => !is_null($pedido->pago),
                    'tiene_direccion' => !is_null($pedido->address),
                    'productos_con_imagen' => $pedido->detalles->filter(function($detalle) {
                        return $detalle->modelo && !empty($detalle->modelo->ruta_imagen);
                    })->count()
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $detallesCompletos
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener detalles completos del pedido: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los detalles completos del pedido',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Métodos privados auxiliares

    private function obtenerSiguientesEstados($estadoActual, $tipoEntrega)
    {
        $siguientes = $this->transicionesValidas[$estadoActual] ?? [];

        // Para pedidos de recojo en tienda, excluir estados de envío
        if ($tipoEntrega === 'recojo_tienda' || $tipoEntrega === 'recojo') {
            $estadosEnvio = ['en_camino', 'en_transito', 'en_reparto', 'intento_entrega', 'retrasado', 'perdido'];
            $siguientes = array_diff($siguientes, $estadosEnvio);
        }

        // Para pedidos de delivery, excluir estado de recojo
        if ($tipoEntrega === 'delivery' || $tipoEntrega === 'envio') {
            $estadosRecojo = ['pendiente_recogida'];
            $siguientes = array_diff($siguientes, $estadosRecojo);
        }

        return array_values($siguientes);
    }

    private function esTransicionValida($estadoActual, $nuevoEstado, $tipoEntrega)
    {
        $transicionesPermitidas = $this->obtenerSiguientesEstados($estadoActual, $tipoEntrega);
        return in_array($nuevoEstado, $transicionesPermitidas);
    }

    private function puedeActualizarEstado($pedido)
    {
        $estadosFinales = ['completado', 'archivado', 'cancelado', 'rechazado'];
        return !in_array($pedido->estado, $estadosFinales);
    }

    /**
     * Obtener historial de estados del pedido
     */
    private function obtenerHistorialEstados($pedido)
    {
        // Por ahora retornamos un array básico
        // En el futuro se puede implementar un sistema de tracking de cambios de estado
        return [
            [
                'estado' => 'pedido_realizado',
                'fecha' => $pedido->created_at->format('d/m/Y H:i:s'),
                'descripcion' => 'Pedido registrado en el sistema'
            ],
            [
                'estado' => $pedido->estado,
                'fecha' => $pedido->updated_at->format('d/m/Y H:i:s'),
                'descripcion' => 'Estado actual del pedido'
            ]
        ];
    }

    private function calcularTiempoTranscurrido($fecha)
    {
        $ahora = now();
        $diferencia = $ahora->diff($fecha);

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
            return 'Hace menos de un minuto';
        }
    }

    /**
     * Obtener el estado de pago formateado
     */
    private function getEstadoPagoFormateado($estado)
    {
        return match ($estado) {
            'pendiente' => 'Pendiente',
            'pagado' => 'Pagado',
            'confirmado' => 'Confirmado',
            'fallido' => 'Fallido',
            'rechazado' => 'Rechazado',
            'reembolsado' => 'Reembolsado',
            'cancelado' => 'Cancelado',
            default => ucfirst($estado)
        };
    }

    /**
     * Calcular el progreso del pedido según el tipo de entrega
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
                'entregado' => 100,
                'completado' => 100,
                'cancelado' => 0,
                'rechazado' => 0,
                'archivado' => 100,
                default => 0
            };
        }
    }

    /**
     * Obtener el próximo paso según el estado y tipo de entrega
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
                'entregado' => 'Confirmación de recepción',
                'completado' => 'Proceso finalizado',
                'cancelado' => 'Proceso finalizado',
                'rechazado' => 'Proceso finalizado',
                'archivado' => 'Proceso finalizado',
                default => 'Paso no definido'
            };
        }
    }

    /**
     * Obtener el timeline detallado según el tipo de entrega
     */
    private function getTimelineDetallado($estado, $tipoEntrega)
    {
        if ($tipoEntrega === 'delivery') {
            return [
                'pedido_realizado' => [
                    'nombre' => 'Pedido Realizado',
                    'descripcion' => 'Pedido registrado en el sistema',
                    'completado' => true,
                    'fecha' => null,
                    'icono' => 'check-circle'
                ],
                'capturado' => [
                    'nombre' => 'Capturado',
                    'descripcion' => 'Pedido capturado por el administrador',
                    'completado' => in_array($estado, ['capturado', 'pago_confirmado', 'en_espera', 'pendiente_envio', 'en_preparacion', 'en_camino', 'en_transito', 'en_reparto', 'intento_entrega', 'entregado', 'completado']),
                    'fecha' => null,
                    'icono' => 'user-check'
                ],
                'pago_confirmado' => [
                    'nombre' => 'Pago Confirmado',
                    'descripcion' => 'Pago procesado exitosamente',
                    'completado' => in_array($estado, ['pago_confirmado', 'en_espera', 'pendiente_envio', 'en_preparacion', 'en_camino', 'en_transito', 'en_reparto', 'intento_entrega', 'entregado', 'completado']),
                    'fecha' => null,
                    'icono' => 'credit-card'
                ],
                'en_preparacion' => [
                    'nombre' => 'En Preparación',
                    'descripción' => 'Preparando el pedido para envío',
                    'completado' => in_array($estado, ['en_preparacion', 'en_camino', 'en_transito', 'en_reparto', 'intento_entrega', 'entregado', 'completado']),
                    'fecha' => null,
                    'icono' => 'package'
                ],
                'en_camino' => [
                    'nombre' => 'En Camino',
                    'descripcion' => 'Pedido en ruta de entrega',
                    'completado' => in_array($estado, ['en_camino', 'en_transito', 'en_reparto', 'intento_entrega', 'entregado', 'completado']),
                    'fecha' => null,
                    'icono' => 'truck'
                ],
                'entregado' => [
                    'nombre' => 'Entregado',
                    'descripcion' => 'Pedido entregado exitosamente',
                    'completado' => in_array($estado, ['entregado', 'completado']),
                    'fecha' => null,
                    'icono' => 'check-circle'
                ]
            ];
        } else {
            return [
                'pedido_realizado' => [
                    'nombre' => 'Pedido Realizado',
                    'descripcion' => 'Pedido registrado en el sistema',
                    'completado' => true,
                    'fecha' => null,
                    'icono' => 'check-circle'
                ],
                'capturado' => [
                    'nombre' => 'Capturado',
                    'descripcion' => 'Pedido capturado por el administrador',
                    'completado' => in_array($estado, ['capturado', 'pago_confirmado', 'en_espera', 'pendiente_envio', 'en_preparacion', 'pendiente_recogida', 'entregado', 'completado']),
                    'fecha' => null,
                    'icono' => 'user-check'
                ],
                'pago_confirmado' => [
                    'nombre' => 'Pago Confirmado',
                    'descripcion' => 'Pago procesado exitosamente',
                    'completado' => in_array($estado, ['pago_confirmado', 'en_espera', 'pendiente_envio', 'en_preparacion', 'pendiente_recogida', 'entregado', 'completado']),
                    'fecha' => null,
                    'icono' => 'credit-card'
                ],
                'en_preparacion' => [
                    'nombre' => 'En Preparación',
                    'descripcion' => 'Preparando el pedido',
                    'completado' => in_array($estado, ['en_preparacion', 'pendiente_recogida', 'entregado', 'completado']),
                    'fecha' => null,
                    'icono' => 'package'
                ],
                'pendiente_recogida' => [
                    'nombre' => 'Listo para Recogida',
                    'descripcion' => 'Pedido listo para ser recogido',
                    'completado' => in_array($estado, ['pendiente_recogida', 'entregado', 'completado']),
                    'fecha' => null,
                    'icono' => 'map-pin'
                ],
                'completado' => [
                    'nombre' => 'Completado',
                    'descripcion' => 'Pedido completado exitosamente',
                    'completado' => $estado === 'completado',
                    'fecha' => null,
                    'icono' => 'check-circle'
                ]
            ];
        }
    }
}
