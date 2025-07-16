import React, { useState, useCallback, useEffect } from 'react';
import { 
    X, 
    User, 
    Package, 
    CreditCard, 
    MapPin, 
    Clock, 
    Star,
    ShoppingCart,
    FileText,
    AlertCircle,
    Phone,
    Home
} from 'lucide-react';
import { obtenerDetallesCompletos } from '../services/pedidos-admin-service';

const DetallePedido = ({ isOpen, onClose, pedidoId }) => {
    const [detalles, setDetalles] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const cargarDetalles = useCallback(async () => {
        if (!pedidoId) return;
        
        try {
            setLoading(true);
            setError(null);
            console.log('Cargando detalles del pedido:', pedidoId);
            const response = await obtenerDetallesCompletos(pedidoId);
            console.log('Respuesta recibida:', response);
            setDetalles(response.data);
        } catch (err) {
            console.error('Error al cargar detalles:', err);
            setError(err.message || 'Error al cargar los detalles');
        } finally {
            setLoading(false);
        }
    }, [pedidoId]);

    useEffect(() => {
        if (isOpen && pedidoId) {
            cargarDetalles();
        }
    }, [isOpen, pedidoId, cargarDetalles]);

    const getEstadoClass = (estado) => {
        const clases = {
            'pedido_realizado': 'bg-gray-100 text-gray-800',
            'capturado': 'bg-blue-100 text-blue-800',
            'pago_confirmado': 'bg-green-100 text-green-800',
            'en_espera': 'bg-yellow-100 text-yellow-800',
            'pendiente_envio': 'bg-orange-100 text-orange-800',
            'en_preparacion': 'bg-purple-100 text-purple-800',
            'en_camino': 'bg-cyan-100 text-cyan-800',
            'en_transito': 'bg-cyan-100 text-cyan-800',
            'en_reparto': 'bg-indigo-100 text-indigo-800',
            'entregado': 'bg-green-100 text-green-800',
            'completado': 'bg-emerald-100 text-emerald-800',
            'cancelado': 'bg-red-100 text-red-800',
            'rechazado': 'bg-red-100 text-red-800',
            'retrasado': 'bg-amber-100 text-amber-800',
            'perdido': 'bg-red-100 text-red-800',
            'devuelto': 'bg-orange-100 text-orange-800',
            'archivado': 'bg-gray-100 text-gray-800'
        };
        return clases[estado] || 'bg-gray-100 text-gray-800';
    };

    const getProgressColor = (progreso) => {
        if (progreso >= 90) return 'bg-green-500';
        if (progreso >= 70) return 'bg-blue-500';
        if (progreso >= 50) return 'bg-yellow-500';
        if (progreso >= 30) return 'bg-orange-500';
        return 'bg-red-500';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Detalles del Pedido
                                </h2>
                                <p className="text-blue-100">
                                    {detalles ? `#${detalles.pedido?.numero_pedido || pedidoId}` : `#${pedidoId}`}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Cargando detalles...</span>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                <p className="text-red-800">{error}</p>
                            </div>
                            <button 
                                onClick={cargarDetalles}
                                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    {detalles && (
                        <div className="space-y-6">
                            {/* Información principal */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Estado y Progreso */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Star className="w-5 h-5 text-blue-600" />
                                        </div>
                                        Estado Actual
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-2 rounded-full text-sm font-medium ${getEstadoClass(detalles.pedido?.estado)}`}>
                                                {detalles.pedido?.estado_formateado || 'Sin estado'}
                                            </span>
                                        </div>
                                        {detalles.seguimiento && (
                                            <>
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-2">Progreso del pedido</p>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className={`h-2 rounded-full ${getProgressColor(detalles.seguimiento.progreso)}`}
                                                            style={{ width: `${detalles.seguimiento.progreso}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">{detalles.seguimiento.progreso}% completado</p>
                                                </div>
                                                <div className="bg-blue-50 p-3 rounded-lg">
                                                    <p className="text-sm font-medium text-blue-800">Próximo paso:</p>
                                                    <p className="text-sm text-blue-600">{detalles.seguimiento.proximo_paso}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Información del Cliente */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <User className="w-5 h-5 text-green-600" />
                                        </div>
                                        Cliente
                                    </h3>
                                    {detalles.cliente && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{detalles.cliente.nombre}</p>
                                                    <p className="text-sm text-gray-600">{detalles.cliente.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <p>Cliente desde: {detalles.cliente.fecha_registro}</p>
                                                <p>{detalles.cliente.tiempo_como_cliente}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Información de Pago */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <CreditCard className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        Pago
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Estado:</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${detalles.pago?.estado === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {detalles.pago?.estado_formateado || 'Pendiente'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Monto:</span>
                                            <span className="text-lg font-bold text-green-600">S/ {detalles.pago?.monto || '0.00'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Método:</span>
                                            <span className="font-medium">{detalles.pago?.metodo_pago || 'N/A'}</span>
                                        </div>
                                        {detalles.pago?.fecha_pago && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Fecha:</span>
                                                <span className="text-sm">{detalles.pago.fecha_pago}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Dirección de Entrega */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <MapPin className="w-5 h-5 text-purple-600" />
                                    </div>
                                    Dirección de Entrega
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Home className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="font-medium">{detalles.direccion_entrega?.destinatario || 'Sin destinatario'}</p>
                                                <p className="text-sm text-gray-600">{detalles.direccion_entrega?.direccion_completa || 'Sin dirección'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-gray-400" />
                                            <span className="text-sm">{detalles.direccion_entrega?.telefono || 'Sin teléfono'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div><strong>Departamento:</strong> {detalles.direccion_entrega?.departamento || 'N/A'}</div>
                                        <div><strong>Provincia:</strong> {detalles.direccion_entrega?.provincia || 'N/A'}</div>
                                        <div><strong>Distrito:</strong> {detalles.direccion_entrega?.distrito || 'N/A'}</div>
                                        <div><strong>Código Postal:</strong> {detalles.direccion_entrega?.codigo_postal || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Productos con Imágenes */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <ShoppingCart className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    Productos ({detalles.estadisticas?.total_productos || 0} items)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {detalles.productos && detalles.productos.map((producto, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex gap-4">
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                                    {producto.modelo_info?.imagen_url ? (
                                                        <img 
                                                            src={producto.modelo_info.imagen_url} 
                                                            alt={producto.nombre}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`w-full h-full flex items-center justify-center ${producto.modelo_info?.imagen_url ? 'hidden' : ''}`}>
                                                        <Package className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-800">{producto.nombre}</h4>
                                                    <p className="text-sm text-gray-600">{producto.modelo_info?.descripcion || 'Sin descripción'}</p>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <span className="text-sm text-gray-500">Cantidad: {producto.cantidad}</span>
                                                        <span className="font-bold text-green-600">S/ {producto.precio_total}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Resumen Financiero */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <CreditCard className="w-5 h-5 text-green-600" />
                                    </div>
                                    Resumen Financiero
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal:</span>
                                            <span className="font-medium">S/ {detalles.resumen_financiero?.subtotal || '0.00'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Costo de envío:</span>
                                            <span className="font-medium">S/ {detalles.resumen_financiero?.costo_envio || '0.00'}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-3">
                                            <span className="text-lg font-semibold text-gray-800">Total:</span>
                                            <span className="text-lg font-bold text-green-600">S/ {detalles.resumen_financiero?.total_final || '0.00'}</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-800 mb-2">Estadísticas</h4>
                                        <div className="text-sm space-y-1">
                                            <div>Tipos de productos: {detalles.estadisticas?.tipos_productos || 0}</div>
                                            <div>Días desde pedido: {detalles.estadisticas?.dias_desde_pedido || 0}</div>
                                            <div>Tiempo transcurrido: {detalles.estadisticas?.tiempo_transcurrido || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <Clock className="w-5 h-5 text-red-600" />
                                    </div>
                                    Timeline del Pedido
                                </h3>
                                <div className="space-y-4">
                                    {detalles.seguimiento?.historial_estados?.map((estado, index) => (
                                        <div key={index} className="flex items-start gap-4">
                                            <div className={`w-4 h-4 rounded-full mt-1 ${estado.estado === detalles.pedido?.estado ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{estado.descripcion}</p>
                                                        <p className="text-sm text-gray-600">{estado.fecha}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${getEstadoClass(estado.estado)}`}>
                                                        {estado.estado}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )) || <p className="text-gray-500 text-center py-4">No hay historial disponible</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mensaje si no hay detalles */}
                    {!loading && !error && !detalles && (
                        <div className="text-center py-12">
                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No se encontraron detalles del pedido</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetallePedido;
