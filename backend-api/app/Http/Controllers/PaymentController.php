<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\MercadoPagoConfig;
use MercadoPago\Exceptions\MPApiException;
use App\Models\Pedido;
use App\Models\Pago;
use App\Models\Carrito;
use App\Models\DetallePedido;
use App\Models\Address;

class PaymentController extends Controller
{
    private $preferenceClient;
    private $paymentClient;

    public function __construct()
    {
        // Configurar MercadoPago
        $accessToken = config('services.mercadopago.access_token');
        if (empty($accessToken)) {
            Log::error('MercadoPago access token no está configurado');
            return;
        }

        MercadoPagoConfig::setAccessToken($accessToken);

        // Configurar entorno de runtime
        if (app()->environment('local')) {
            MercadoPagoConfig::setRuntimeEnviroment(MercadoPagoConfig::LOCAL);
        }

        $this->preferenceClient = new PreferenceClient();
        $this->paymentClient = new PaymentClient();
    }

    /**
     * Crear preferencia de pago desde el carrito
     */
    public function createPreferenceFromCart(Request $request): JsonResponse
    {
        Log::info('[DEBUG] Datos recibidos en createPreferenceFromCart', [
            'request' => $request->all()
        ]);
        try {
            // Validar datos de entrada
            $validator = Validator::make($request->all(), [
                'delivery_type' => 'required|in:pickup,delivery',
                'address_id' => 'required_if:delivery_type,delivery|nullable|exists:addresses,id',
                'delivery_fee' => 'required|numeric|min:0',
                'payment_methods' => 'nullable|array',
                'payment_methods.excluded_payment_methods' => 'nullable|array',
                'payment_methods.excluded_payment_types' => 'nullable|array',
                'payment_methods.installments' => 'nullable|integer|min:1|max:24',
                'expires' => 'nullable|boolean',
                'expiration_date_to' => 'nullable|date|after:now',
                'platform' => 'nullable|string|in:web,mobile',
                'return_urls' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();

            // Obtener items del carrito del usuario
            $cartItems = Carrito::with('modelo')
                ->where('iduser', $user->id)
                ->get();

            if ($cartItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'El carrito está vacío'
                ], 400);
            }

            // Preparar items para MercadoPago
            $items = [];
            $total = 0;

            foreach ($cartItems as $cartItem) {
                $itemTotal = $cartItem->cantidad * $cartItem->modelo->precio;
                $total += $itemTotal;

                $items[] = [
                    'id' => (string) $cartItem->modelo->idModelo,
                    'title' => $cartItem->modelo->nombre,
                    'quantity' => (int) $cartItem->cantidad,
                    'unit_price' => (float) $cartItem->modelo->precio,
                    'currency_id' => 'PEN', // Cambiado a PEN según la documentación
                    'picture_url' => $cartItem->modelo->imagen ?? null,
                    'description' => $cartItem->modelo->descripcion ?? null,
                    'category_id' => 'art', // Categoría por defecto
                ];
            }

            // Agregar costo de envío si aplica
            if ($request->delivery_fee > 0) {
                $items[] = [
                    'id' => 'delivery_fee',
                    'title' => 'Costo de envío',
                    'quantity' => 1,
                    'unit_price' => (float) $request->delivery_fee,
                    'currency_id' => 'PEN',
                    'category_id' => 'services',
                ];
                $total += $request->delivery_fee;
            }

            // Obtener dirección si es delivery
            $address = null;
            if ($request->delivery_type === 'delivery' && $request->address_id) {
                $address = Address::where('id', $request->address_id)
                    ->where('user_id', $user->id)
                    ->first();
            }

            // Determinar URLs de retorno basadas en plataforma
            $backUrls = $this->getBackUrls($request->platform, $request->return_urls);

            // Crear preferencia de pago con funcionalidades avanzadas
            $preferenceData = [
                'items' => $items,
                'payer' => [
                    'name' => $user->name,
                    'surname' => $user->surname ?? '',
                    'email' => $user->email,
                    'phone' => [
                        'area_code' => $user->phone_area_code ?? '51',
                        'number' => $user->phone_number ?? ''
                    ],
                    'identification' => [
                        'type' => 'DNI',
                        'number' => $user->dni ?? ''
                    ],
                ],
                'back_urls' => $backUrls,
                'external_reference' => 'order_' . time() . '_' . $user->id,
                'notification_url' => $this->getNotificationUrl(),
                'statement_descriptor' => 'METSLAB',
                'expires' => $request->expires ?? true,
                'expiration_date_to' => $request->expiration_date_to ?? now()->addHours(24)->toISOString(),
            ];

            // Configurar métodos de pago según la documentación oficial de MercadoPago
            $preferenceData['payment_methods'] = [
                'excluded_payment_methods' => [],
                'excluded_payment_types' => [],
                'installments' => 12,
                'default_installments' => 1,
            ];

            // Agregar información de envío si aplica
            if ($address) {
                $preferenceData['payer']['address'] = [
                    'street_name' => $address->street,
                    'street_number' => $address->number,
                    'zip_code' => $address->postal_code,
                ];

                $preferenceData['shipments'] = [
                    'receiver_address' => [
                        'street_name' => $address->street,
                        'street_number' => $address->number,
                        'zip_code' => $address->postal_code,
                        'city' => [
                            'name' => $address->city
                        ],
                        'state' => [
                            'name' => $address->state
                        ],
                        'country' => [
                            'name' => $address->country
                        ]
                    ]
                ];
            } else {
                // Si es pickup, configurar envío sin costo
                $preferenceData['shipments'] = [
                    'cost' => 0,
                    'mode' => 'not_specified',
                ];
            }

            // Justo antes de crear la preferencia - forzar formato de back_urls
            $preferenceData['back_urls'] = [
                'success' => (string) $backUrls['success'],
                'failure' => (string) $backUrls['failure'],
                'pending' => (string) $backUrls['pending'],
            ];

            Log::info('Creating MercadoPago preference with advanced features', [
                'user_id' => $user->id,
                'total' => $total,
                'items_count' => count($items),
                'delivery_type' => $request->delivery_type,
                'payment_methods' => $preferenceData['payment_methods'],
                'back_urls' => $preferenceData['back_urls'],
            ]);

            // Log completo de los datos que se envían a MercadoPago
            Log::info('Complete preference data being sent to MercadoPago', [
                'preference_data' => $preferenceData,
                'back_urls_type' => gettype($preferenceData['back_urls']),
                'back_urls_keys' => array_keys($preferenceData['back_urls'])
            ]);

            $preference = $this->preferenceClient->create($preferenceData);

            // Guardar información temporal del pedido
            $orderData = [
                'user_id' => $user->id,
                'preference_id' => $preference->id,
                'total' => $total,
                'delivery_type' => $request->delivery_type,
                'address_id' => $request->address_id,
                'delivery_fee' => $request->delivery_fee,
                'status' => 'pending',
                'external_reference' => $preferenceData['external_reference'],
                'payment_methods_config' => $preferenceData['payment_methods']
            ];

            // Guardar en caché temporal
            cache()->put('order_' . $preferenceData['external_reference'], $orderData, 3600);

            return response()->json([
                'success' => true,
                'preference_id' => $preference->id,
                'init_point' => $preference->init_point,
                'sandbox_init_point' => $preference->sandbox_init_point,
                'total' => $total,
                'currency' => 'PEN',
                'expires' => $preferenceData['expires'],
                'expiration_date_to' => $preferenceData['expiration_date_to']
            ]);
        } catch (MPApiException $e) {
            Log::error('MercadoPago API error', [
                'status_code' => $e->getApiResponse()->getStatusCode(),
                'content' => $e->getApiResponse()->getContent(),
                'user_id' => $request->user()->id ?? null
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error en MercadoPago: ' . $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            Log::error('Error creating payment preference', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'user_id' => $request->user()->id ?? null
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Webhook para recibir notificaciones de MercadoPago
     */
    public function webhook(Request $request): JsonResponse
    {
        try {
            Log::info('MercadoPago webhook received', $request->all());

            $type = $request->input('type');
            $data = $request->input('data');

            if ($type === 'payment') {
                $paymentId = $data['id'];
                $this->processPayment($paymentId);
            }

            return response()->json(['status' => 'ok']);
        } catch (\Exception $e) {
            Log::error('Error processing webhook', [
                'message' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    /**
     * Procesar pago recibido
     */
    private function processPayment($paymentId): void
    {
        try {
            $payment = $this->paymentClient->get($paymentId);

            Log::info('Processing payment', [
                'payment_id' => $paymentId,
                'status' => $payment->status,
                'external_reference' => $payment->external_reference
            ]);

            DB::transaction(function () use ($payment) {
                // Crear o actualizar registro de pago
                $pago = Pago::updateOrCreate(
                    ['token_pago' => $payment->id],
                    [
                        'estado' => $payment->status,
                        'monto' => $payment->transaction_amount,
                        'order_id' => $payment->external_reference,
                        'Pagocol' => json_encode($payment),
                        'payment_method' => $payment->payment_method_id ?? null,
                    ]
                );

                // Buscar pedido por external_reference
                $pedido = Pedido::where('external_reference', $payment->external_reference)->first();

                if ($pedido) {
                    // Actualizar estado del pedido
                    switch ($payment->status) {
                        case 'approved':
                            $pedido->estado = 'pagado';
                            $pedido->idPago = $pago->id;
                            break;
                        case 'pending':
                            $pedido->estado = 'pendiente';
                            break;
                        case 'rejected':
                        case 'cancelled':
                            $pedido->estado = 'rechazado';
                            break;
                        default:
                            $pedido->estado = 'pendiente';
                    }
                    $pedido->save();
                } else {
                    // Crear pedido si no existe
                    $this->createOrderFromPayment($payment, $pago);
                }
            });
        } catch (\Exception $e) {
            Log::error('Error processing payment', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Crear pedido desde el pago
     */
    private function createOrderFromPayment($payment, $pago): void
    {
        // Obtener datos del pedido desde caché usando external_reference
        $orderData = cache()->get('order_' . $payment->external_reference);

        Log::info('[DEBUG] Intentando crear pedido desde pago', [
            'external_reference' => $payment->external_reference,
            'orderData' => $orderData
        ]);

        if (!$orderData) {
            Log::warning('Order data not found in cache', [
                'external_reference' => $payment->external_reference
            ]);
            return;
        }

        // Log de valores clave
        Log::info('[DEBUG] Valores clave para crear pedido', [
            'TipoPedido' => $orderData['delivery_type'] ?? null,
            'address_id' => $orderData['address_id'] ?? null,
            'delivery_fee' => $orderData['delivery_fee'] ?? null
        ]);

        DB::transaction(function () use ($payment, $pago, $orderData) {
            // Crear pedido
            $pedido = Pedido::create([
                'iduser' => $orderData['user_id'],
                'idPago' => $pago->id,
                'estado' => $payment->status === 'approved' ? 'pagado' : 'pendiente',
                'totalPago' => $payment->transaction_amount,
                'TipoPedido' => $orderData['delivery_type'],
                'fentrega' => now()->addDays(7),
                'fecha_pedido' => now(),
                'external_reference' => $payment->external_reference,
                'address_id' => $orderData['address_id'],
                'delivery_fee' => $orderData['delivery_fee']
            ]);

            // Crear detalles del pedido desde el carrito
            $cartItems = Carrito::with('modelo')
                ->where('iduser', $orderData['user_id'])
                ->get();

            foreach ($cartItems as $cartItem) {
                DetallePedido::create([
                    'idPedido' => $pedido->id,
                    'idModelo' => $cartItem->idModelo,
                    'cantidad' => $cartItem->cantidad,
                    'nombre' => $cartItem->modelo->nombre,
                    'precio' => $cartItem->modelo->precio,
                    'precioTotal' => $cartItem->cantidad * $cartItem->modelo->precio
                ]);
            }

            // Vaciar carrito
            Carrito::where('iduser', $orderData['user_id'])->delete();

            // Limpiar caché
            cache()->forget('order_' . $payment->external_reference);

            Log::info('Order created from payment', [
                'order_id' => $pedido->id,
                'payment_id' => $payment->id,
                'user_id' => $orderData['user_id']
            ]);
        });
    }

    /**
     * Obtener estado de un pago
     */
    public function getPaymentStatus($paymentId): JsonResponse
    {
        try {
            $payment = $this->paymentClient->get($paymentId);

            return response()->json([
                'success' => true,
                'payment_id' => $payment->id,
                'status' => $payment->status,
                'amount' => $payment->transaction_amount,
                'payment_method' => $payment->payment_method_id,
                'external_reference' => $payment->external_reference
            ]);
        } catch (MPApiException $e) {
            Log::error('Error getting payment status', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el estado del pago'
            ], 500);
        }
    }

    /**
     * Obtener historial de pagos del usuario
     */
    public function getUserPayments(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $payments = Pago::with(['pedido' => function ($query) use ($user) {
                $query->where('iduser', $user->id);
            }])
                ->whereHas('pedido', function ($query) use ($user) {
                    $query->where('iduser', $user->id);
                })
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'payments' => $payments
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting user payments', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el historial de pagos'
            ], 500);
        }
    }

    /**
     * Método de prueba para verificar configuración
     */
    public function test(): JsonResponse
    {
        try {
            $accessToken = config('services.mercadopago.access_token');
            $publicKey = config('services.mercadopago.public_key');

            return response()->json([
                'success' => true,
                'message' => 'PaymentController está funcionando',
                'mercadopago_configured' => !empty($accessToken),
                'access_token_length' => strlen($accessToken),
                'public_key_length' => strlen($publicKey),
                'app_url' => config('app.url'),
                'notification_url' => $this->getNotificationUrl(),
                'environment' => app()->environment(),
                'ssl_verification_disabled' => app()->environment('local'),
                'timestamp' => now()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en test: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Método de prueba para crear preferencia mínima
     */
    public function testMinimalPreference(): JsonResponse
    {
        try {
            // Crear preferencia mínima para debug
            $minimalData = [
                'items' => [
                    [
                        'id' => 'test_item_1',
                        'title' => 'Producto de prueba',
                        'quantity' => 1,
                        'unit_price' => 10.0,
                        'currency_id' => 'PEN'
                    ]
                ],
                'back_urls' => [
                    'success' => 'http://localhost:5173/payment/success',
                    'failure' => 'http://localhost:5173/payment/failure',
                    'pending' => 'http://localhost:5173/payment/pending'
                ],
                'external_reference' => 'test_' . time(),
                'notification_url' => $this->getNotificationUrl(),
                'payment_methods' => [
                    'excluded_payment_methods' => [],
                    'excluded_payment_types' => [],
                    'installments' => 12,
                    'default_installments' => 1,
                ],
            ];

            Log::info('Testing minimal preference creation', [
                'minimal_data' => $minimalData
            ]);

            $preference = $this->preferenceClient->create($minimalData);

            return response()->json([
                'success' => true,
                'message' => 'Preferencia mínima creada exitosamente',
                'preference_id' => $preference->id,
                'init_point' => $preference->init_point,
                'sandbox_init_point' => $preference->sandbox_init_point
            ]);
        } catch (MPApiException $e) {
            Log::error('MercadoPago API error in minimal preference test', [
                'status_code' => $e->getApiResponse()->getStatusCode(),
                'content' => $e->getApiResponse()->getContent()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error en MercadoPago: ' . $e->getMessage(),
                'error_details' => $e->getApiResponse()->getContent()
            ], 500);
        } catch (\Exception $e) {
            Log::error('Error in minimal preference test', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar URL de notificación dinámica
     */
    private function getNotificationUrl(): string
    {
        $baseUrl = config('app.url');

        // Asegurar que la URL base sea válida
        if (empty($baseUrl)) {
            $baseUrl = 'http://localhost:8000';
        }

        // Asegurar que la URL termine con /api/payments/webhook
        return rtrim($baseUrl, '/') . '/api/payments/webhook';
    }

    /**
     * Determinar URLs de retorno basadas en plataforma
     */
    private function getBackUrls(?string $platform, ?array $customUrls = null): array
    {
        // Si se proporcionan URLs personalizadas, usarlas
        if ($customUrls && isset($customUrls['success']) && isset($customUrls['failure']) && isset($customUrls['pending'])) {
            Log::info('Using custom back URLs', $customUrls);
            return [
                'success' => $customUrls['success'],
                'failure' => $customUrls['failure'],
                'pending' => $customUrls['pending']
            ];
        }

        // URLs por defecto según plataforma
        switch ($platform) {
            case 'mobile':
                // Para React Native, usar deep links
                $backUrls = [
                    'success' => 'metslab://payment/success',
                    'failure' => 'metslab://payment/failure',
                    'pending' => 'metslab://payment/pending'
                ];
                break;

            case 'web':
            default:
                // Para web, usar URLs fijas del frontend
                $backUrls = [
                    'success' => 'http://localhost:5173/payment/success',
                    'failure' => 'http://localhost:5173/payment/failure',
                    'pending' => 'http://localhost:5173/payment/pending'
                ];
                break;
        }

        Log::info('Generated back URLs', [
            'platform' => $platform,
            'back_urls' => $backUrls
        ]);

        return $backUrls;
    }

    /**
     * Crear preferencia de pago con configuración específica de métodos de pago
     */
    public function createPreferenceWithPaymentMethods(Request $request): JsonResponse
    {
        try {
            // Validar datos de entrada
            $validator = Validator::make($request->all(), [
                'items' => 'required|array',
                'items.*.title' => 'required|string',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.unit_price' => 'required|numeric|min:0',
                'excluded_payment_methods' => 'nullable|array',
                'excluded_payment_types' => 'nullable|array',
                'installments' => 'nullable|integer|min:1|max:24',
                'expires' => 'nullable|boolean',
                'expiration_date_to' => 'nullable|date|after:now',
                'platform' => 'nullable|string|in:web,mobile',
                'return_urls' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();

            // Preparar items
            $items = [];
            $total = 0;

            foreach ($request->items as $item) {
                $itemTotal = $item['quantity'] * $item['unit_price'];
                $total += $itemTotal;

                $items[] = [
                    'id' => $item['id'] ?? uniqid(),
                    'title' => $item['title'],
                    'quantity' => (int) $item['quantity'],
                    'unit_price' => (float) $item['unit_price'],
                    'currency_id' => 'PEN',
                    'picture_url' => $item['picture_url'] ?? null,
                    'description' => $item['description'] ?? null,
                    'category_id' => $item['category_id'] ?? 'art',
                ];
            }

            // Determinar URLs de retorno basadas en plataforma
            $backUrls = $this->getBackUrls($request->platform, $request->return_urls);

            // Crear preferencia con configuración específica
            $preferenceData = [
                'items' => $items,
                'payer' => [
                    'name' => $user->name,
                    'surname' => $user->surname ?? '',
                    'email' => $user->email,
                    'phone' => [
                        'area_code' => $user->phone_area_code ?? '51',
                        'number' => $user->phone_number ?? ''
                    ],
                    'identification' => [
                        'type' => 'DNI',
                        'number' => $user->dni ?? ''
                    ],
                ],
                'back_urls' => $backUrls,
                'external_reference' => 'custom_order_' . time() . '_' . $user->id,
                'notification_url' => $this->getNotificationUrl(),
                'statement_descriptor' => 'METSLAB',
                'expires' => $request->expires ?? true,
                'expiration_date_to' => $request->expiration_date_to ?? now()->addHours(24)->toISOString(),
                'payment_methods' => [
                    'excluded_payment_methods' => $request->excluded_payment_methods ?? [],
                    'excluded_payment_types' => $request->excluded_payment_types ?? [],
                    'installments' => $request->installments ?? 12,
                ],
            ];

            // Justo antes de crear la preferencia
            $preferenceData['back_urls'] = [
                'success' => (string) $backUrls['success'],
                'failure' => (string) $backUrls['failure'],
                'pending' => (string) $backUrls['pending'],
            ];

            Log::info('Creating custom MercadoPago preference', [
                'user_id' => $user->id,
                'total' => $total,
                'items_count' => count($items),
                'payment_methods_config' => $preferenceData['payment_methods']
            ]);

            $preference = $this->preferenceClient->create($preferenceData);

            return response()->json([
                'success' => true,
                'preference_id' => $preference->id,
                'init_point' => $preference->init_point,
                'sandbox_init_point' => $preference->sandbox_init_point,
                'total' => $total,
                'currency' => 'PEN',
                'payment_methods' => $preferenceData['payment_methods'],
                'expires' => $preferenceData['expires'],
                'expiration_date_to' => $preferenceData['expiration_date_to']
            ]);
        } catch (MPApiException $e) {
            Log::error('MercadoPago API error in custom preference', [
                'status_code' => $e->getApiResponse()->getStatusCode(),
                'content' => $e->getApiResponse()->getContent(),
                'user_id' => $request->user()->id ?? null
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error en MercadoPago: ' . $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            Log::error('Error creating custom payment preference', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'user_id' => $request->user()->id ?? null
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Procesar pago enviado desde el Payment Brick
     */
    public function processPaymentRequest(Request $request)
    {
        try {
            // Validar datos de entrada
            $validator = Validator::make($request->all(), [
                'transaction_amount' => 'required|numeric|min:0',
                'token' => 'required|string',
                'description' => 'nullable|string',
                'installments' => 'nullable|integer|min:1|max:24',
                'payment_method_id' => 'required|string',
                'payer' => 'required|array',
                'payer.email' => 'required|email',
                'payer.identification' => 'nullable|array',
                'payer.identification.type' => 'nullable|string',
                'payer.identification.number' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();

            // Usar external_reference del request como clave de caché
            $externalReference = $request->external_reference ?? ('order_' . time() . '_' . $user->id);
            $cacheKey = 'order_' . $externalReference;

            // Crear pago en MercadoPago
            $paymentData = [
                'transaction_amount' => (float) $request->transaction_amount,
                'token' => $request->token,
                'description' => $request->description ?? 'Compra en MetsLab',
                'installments' => $request->installments ?? 1,
                'payment_method_id' => $request->payment_method_id,
                'payer' => [
                    'email' => $request->payer['email'],
                    'identification' => $request->payer['identification'] ?? null,
                ],
                'external_reference' => $externalReference,
                'notification_url' => $this->getNotificationUrl(),
            ];

            // Guardar datos del pedido en caché para usarlos al crear el pedido
            cache()->put($cacheKey, [
                'user_id' => $user->id,
                'delivery_type' => $request->delivery_type,
                'address_id' => $request->address_id,
                'delivery_fee' => $request->delivery_fee,
            ], now()->addMinutes(30));

            Log::info('Intentando procesar pago con MercadoPago', [
                'user_id' => $user->id,
                'payment_payload' => json_encode($paymentData)
            ]);

            $payment = $this->paymentClient->create($paymentData);

            Log::info('Respuesta de MercadoPago al crear pago', [
                'user_id' => $user->id,
                'payment_response' => json_encode($payment)
            ]);

            // Procesar el pago recibido
            $this->processPayment($payment->id);

            $statusDetailMessages = [
                'accredited' => 'El pago fue acreditado exitosamente.',
                'cc_rejected_bad_filled_cvv' => 'CVV inválido. Por favor, revisa el código de seguridad de tu tarjeta.',
                'cc_rejected_bad_filled_date' => 'Fecha de vencimiento incorrecta.',
                'cc_rejected_bad_filled_other' => 'Datos de la tarjeta incorrectos.',
                'cc_rejected_insufficient_amount' => 'Fondos insuficientes en la tarjeta o cuenta Yape.',
                'cc_rejected_card_disabled' => 'La tarjeta está inhabilitada. Llama a tu banco para activarla.',
                'cc_rejected_card_error' => 'No se pudo procesar el pago. Intenta nuevamente.',
                'cc_rejected_high_risk' => 'El pago fue rechazado por seguridad. Prueba con otro medio de pago.',
                'cc_rejected_call_for_authorize' => 'Debes autorizar el pago con tu banco o Yape.',
                'cc_rejected_other_reason' => 'El pago fue rechazado. Intenta nuevamente o usa otro método.',
                'cc_rejected_card_type_not_allowed' => 'El tipo de tarjeta no está permitido para este pago.',
                'cc_rejected_max_attempts' => 'Se alcanzó el número máximo de intentos permitidos. Intenta más tarde.',
                'cc_rejected_bad_filled_security_code' => 'El código de seguridad (OTP) es incorrecto.',
                'cc_rejected_form_error' => 'Error en el formulario. Revisa los datos ingresados.',
            ];

            $status = $payment->status ?? null;
            $status_detail = $payment->status_detail ?? null;

            $message = 'Estado desconocido.';
            if ($status === 'approved') {
                $message = '¡Pago aprobado! Gracias por tu compra.';
            } elseif ($status === 'in_process') {
                $message = 'Tu pago está en proceso. Te avisaremos cuando se acredite.';
            } elseif ($status === 'rejected' && $status_detail) {
                $message = $statusDetailMessages[$status_detail] ?? 'El pago fue rechazado. Intenta con otra tarjeta.';
            }

            return response()->json([
                'status' => $status,
                'status_detail' => $status_detail,
                'message' => $message,
                'payment_id' => $payment->id ?? null,
            ]);
        } catch (MPApiException $e) {
            Log::error('MercadoPago API error in payment processing', [
                'status_code' => $e->getApiResponse()->getStatusCode(),
                'content' => $e->getApiResponse()->getContent(),
                'user_id' => $request->user()->id ?? null
            ]);

            return response()->json([
                'status' => 'error',
                'status_detail' => null,
                'message' => 'Error en MercadoPago: ' . $e->getMessage(),
                'payment_id' => null,
            ], 500);
        } catch (\Exception $e) {
            Log::error('Error processing payment', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'user_id' => $request->user()->id ?? null
            ]);

            return response()->json([
                'status' => 'error',
                'status_detail' => null,
                'message' => 'Error interno del servidor',
                'payment_id' => null,
            ], 500);
        }
    }
}
