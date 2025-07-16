import React, { useState, useEffect } from 'react';
import '../stayle/PedidosAdmin.css';
import DetallePedido from './DetallePedido';
import {
    obtenerPedidos,
    obtenerDetallePedido,
    actualizarEstadoPedido,
    actualizarEstadosLote as actualizarEstadosLoteService,
    obtenerEstadosDisponibles,
    handleAuthError
} from '../services/pedidos-admin-service';
import {
    Package,
    User,
    Calendar,
    CreditCard,
    MapPin,
    Eye,
    Edit,
    Check,
    X,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    CheckSquare,
    Square,
    RefreshCw,
    Download,
    Truck,
    Clock,
    AlertCircle,
    CheckCircle,
    ShoppingCart,
    Phone,
    Mail,
    FileText,
    Users,
    TrendingUp,
    Calendar as CalendarIcon,
    Info,
    Star
} from 'lucide-react';

const PedidosAdmin = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPedidos, setSelectedPedidos] = useState([]);
    const [showDetallePedido, setShowDetallePedido] = useState(false);
    const [selectedPedidoId, setSelectedPedidoId] = useState(null);
    const [filtros, setFiltros] = useState({
        estado: '',
        tipo_entrega: '',
        fecha_desde: '',
        fecha_hasta: '',
        busqueda: ''
    });
    const [paginacion, setPaginacion] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });
    const [estadosDisponibles, setEstadosDisponibles] = useState([]);
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [batchNewState, setBatchNewState] = useState('');
    const [batchNotes, setBatchNotes] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedPedidoDetails, setSelectedPedidoDetails] = useState(null);

    // Función para mostrar detalles del pedido
    const mostrarDetalles = async (pedidoId) => {
        try {
            const data = await obtenerDetallePedido(pedidoId);
            setSelectedPedidoDetails(data.data);
            setShowDetailsModal(true);
        } catch (err) {
            console.error('Error:', err);
            handleAuthError(err);
            alert(`Error: ${err.message}`);
        }
    };

    // Función para mostrar detalles del pedido con el componente DetallePedido
    const mostrarDetallesPedido = (pedidoId) => {
        setSelectedPedidoId(pedidoId);
        setShowDetallePedido(true);
    };

    // Cargar pedidos
    const cargarPedidos = async () => {
        setLoading(true);
        try {
            const data = await obtenerPedidos(
                filtros,
                paginacion.page,
                paginacion.limit
            );

            setPedidos(data.data || []);
            setPaginacion(prev => ({
                ...prev,
                total: data.pagination?.total_items || 0,
                totalPages: data.pagination?.total_pages || 0
            }));

        } catch (err) {
            console.error('Error al cargar pedidos:', err);
            handleAuthError(err);
            setError(err.message);
            setPedidos([]);
        } finally {
            setLoading(false);
        }
    };

    // Cargar estados disponibles
    const cargarEstados = async () => {
        try {
            const data = await obtenerEstadosDisponibles();
            setEstadosDisponibles(data.data || []);
        } catch (err) {
            console.error('Error cargando estados:', err);
            handleAuthError(err);
            setEstadosDisponibles([]);
        }
    };

    useEffect(() => {
        // Cargar datos iniciales
        cargarPedidos();
        cargarEstados();
    }, [paginacion.page, filtros]); // eslint-disable-line react-hooks/exhaustive-deps

    // Manejar selección de pedidos
    const togglePedidoSelection = (pedidoId) => {
        setSelectedPedidos(prev =>
            prev.includes(pedidoId)
                ? prev.filter(id => id !== pedidoId)
                : [...prev, pedidoId]
        );
    };

    const selectAllPedidos = () => {
        if (selectedPedidos.length === pedidos.length) {
            setSelectedPedidos([]);
        } else {
            setSelectedPedidos(pedidos.map(p => p.id));
        }
    };

    // Actualizar estado individual
    const actualizarEstado = async (pedidoId, nuevoEstado) => {
        try {
            const data = await actualizarEstadoPedido(pedidoId, nuevoEstado);

            // Recargar pedidos
            cargarPedidos();

            // Mostrar mensaje de éxito
            if (data.success) {
                // Silencioso para mejor UX, solo recargar datos
            }

        } catch (err) {
            console.error('Error:', err);
            handleAuthError(err);
            alert(`Error al actualizar estado: ${err.message}`);
        }
    };

    // Actualizar estados por lotes
    const actualizarEstadosLote = async () => {
        const validacion = validarSeleccionLote();
        if (!validacion.valid) {
            alert(validacion.message);
            return;
        }
        
        if (selectedPedidos.length === 0 || !batchNewState) return;

        try {
            const data = await actualizarEstadosLoteService(selectedPedidos, batchNewState, batchNotes);

            if (data.success) {
                alert(`Estados actualizados exitosamente. ${data.data.actualizados} pedidos actualizados, ${data.data.errores} errores.`);
                
                // Limpiar selección y cerrar modal
                setSelectedPedidos([]);
                setShowBatchModal(false);
                setBatchNewState('');
                setBatchNotes('');
                
                // Recargar pedidos
                cargarPedidos();
            } else {
                alert('Error al actualizar estados: ' + data.message);
            }
        } catch (err) {
            console.error('Error:', err);
            handleAuthError(err);
            alert(`Error al actualizar estados: ${err.message}`);
        }
    };

    // Validar que los pedidos seleccionados compartan estados compatibles
    const validarSeleccionLote = () => {
        if (selectedPedidos.length === 0) return { valid: false, message: 'No hay pedidos seleccionados' };
        
        const pedidosSeleccionados = pedidos.filter(p => selectedPedidos.includes(p.id));
        const estadosUnicos = [...new Set(pedidosSeleccionados.map(p => p.estado))];
        
        if (estadosUnicos.length > 1) {
            return {
                valid: false,
                message: `Los pedidos seleccionados tienen estados diferentes (${estadosUnicos.join(', ')}). Para actualizar por lotes, selecciona pedidos que compartan el mismo estado.`
            };
        }
        
        return { valid: true, estadoActual: estadosUnicos[0] };
    };

    // Obtener estados disponibles para actualización por lotes
    const getEstadosDisponiblesParaLote = () => {
        const validacion = validarSeleccionLote();
        if (!validacion.valid) return [];
        
        const pedidoEjemplo = pedidos.find(p => p.estado === validacion.estadoActual);
        if (!pedidoEjemplo || !pedidoEjemplo.siguientes_estados) return [];
        
        return pedidoEjemplo.siguientes_estados
            .filter(estado => estado !== 'pedido_realizado') // Excluir pedido_realizado
            .map(estado => {
                const estadoInfo = estadosDisponibles.find(e => e.valor === estado);
                return {
                    valor: estado,
                    nombre: estadoInfo?.nombre || estado,
                    fase: estadoInfo?.fase || 'N/A'
                };
            });
    };

    // Obtener icono para el estado
    const getEstadoIcon = (estado) => {
        switch (estado) {
            case 'pedido_realizado':
            case 'en_espera':
                return <Clock className="w-4 h-4" />;
            case 'capturado':
            case 'pago_confirmado':
                return <CheckCircle className="w-4 h-4" />;
            case 'en_preparacion':
            case 'pendiente_envio':
                return <Package className="w-4 h-4" />;
            case 'en_camino':
            case 'en_transito':
            case 'en_reparto':
                return <Truck className="w-4 h-4" />;
            case 'entregado':
            case 'completado':
                return <CheckCircle className="w-4 h-4" />;
            case 'retrasado':
            case 'intento_entrega':
                return <AlertCircle className="w-4 h-4" />;
            case 'perdido':
                return <X className="w-4 h-4" />;
            case 'pendiente_recogida':
                return <Package className="w-4 h-4" />;
            case 'devuelto':
                return <RefreshCw className="w-4 h-4" />;
            case 'cancelado':
            case 'rechazado':
                return <X className="w-4 h-4" />;
            case 'archivado':
                return <FileText className="w-4 h-4" />;
            default:
                return <Package className="w-4 h-4" />;
        }
    };

    // Obtener clase CSS para el estado
    const getEstadoClass = (estado) => {
        switch (estado) {
            case 'pedido_realizado':
            case 'en_espera':
            case 'pendiente_envio':
                return 'badge-yellow';
            case 'capturado':
            case 'pago_confirmado':
            case 'en_preparacion':
                return 'badge-blue';
            case 'en_camino':
            case 'en_transito':
            case 'en_reparto':
                return 'badge-purple';
            case 'entregado':
            case 'completado':
                return 'badge-green';
            case 'retrasado':
            case 'intento_entrega':
                return 'badge-orange';
            case 'perdido':
                return 'badge-red';
            case 'pendiente_recogida':
                return 'badge-blue';
            case 'devuelto':
                return 'badge-orange';
            case 'cancelado':
            case 'rechazado':
                return 'badge-red';
            case 'archivado':
                return 'badge-gray';
            default:
                return 'badge-gray';
        }
    };

    if (loading) {
        return (
            <div className="section-content">
                <div className="loading-state">
                    <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
                    <p>Cargando pedidos de todos los usuarios...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="section-content">
                <div className="error-state">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                    <p className="text-red-600">Error: {error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            cargarPedidos();
                        }}
                        className="btn-primary mt-4"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="section-content">
            <div className="section-header">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    Gestión de Pedidos
                </h2>
                <p className="text-gray-600 text-lg">Administra y actualiza el estado de todos los pedidos del sistema</p>
            </div>

            {/* Estadísticas rápidas con diseño moderno */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Total Pedidos</h3>
                            <p className="text-2xl font-bold text-blue-600">{paginacion.total}</p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">En Proceso</h3>
                            <p className="text-2xl font-bold text-yellow-600">
                                {pedidos.filter(p => ['en_preparacion', 'en_camino', 'en_transito', 'pendiente_envio'].includes(p.estado)).length}
                            </p>
                        </div>
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Completados</h3>
                            <p className="text-2xl font-bold text-green-600">
                                {pedidos.filter(p => ['entregado', 'completado'].includes(p.estado)).length}
                            </p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Problemas</h3>
                            <p className="text-2xl font-bold text-red-600">
                                {pedidos.filter(p => ['retrasado', 'cancelado', 'devuelto', 'perdido'].includes(p.estado)).length}
                            </p>
                        </div>
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Ingresos</h3>
                            <p className="text-xl font-bold text-purple-600">
                                S/ {pedidos.reduce((sum, p) => {
                                    const total = typeof p.total_pago === 'string'
                                        ? parseFloat(p.total_pago.replace(/[^0-9.-]+/g, ''))
                                        : parseFloat(p.total_pago) || 0;
                                    return sum + total;
                                }, 0).toFixed(0)}
                            </p>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros y controles mejorados */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filtros y Controles
                    </h3>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Búsqueda */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar por número de pedido o cliente..."
                                    value={filtros.busqueda}
                                    onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                                    className="form-input pl-10"
                                />
                            </div>
                        </div>

                        {/* Filtro por estado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <select
                                value={filtros.estado}
                                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                                className="form-select"
                            >
                                <option value="">Todos los estados</option>
                                {estadosDisponibles.map(estado => (
                                    <option key={estado.valor} value={estado.valor}>
                                        {estado.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por tipo de entrega */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Entrega</label>
                            <select
                                value={filtros.tipo_entrega}
                                onChange={(e) => setFiltros({ ...filtros, tipo_entrega: e.target.value })}
                                className="form-select"
                            >
                                <option value="">Todos los tipos</option>
                                <option value="delivery">Delivery</option>
                                <option value="pickup">Recojo en tienda</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Filtro de fechas */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
                            <input
                                type="date"
                                value={filtros.fecha_desde}
                                onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value })}
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
                            <input
                                type="date"
                                value={filtros.fecha_hasta}
                                onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
                                className="form-input"
                            />
                        </div>

                        {/* Botón de actualización por lotes */}
                        <div className="flex items-end">
                            {selectedPedidos.length > 0 && (
                                <button
                                    onClick={() => setShowBatchModal(true)}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    Actualizar {selectedPedidos.length} pedido(s)
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Información de selección */}
                {selectedPedidos.length > 0 && (
                    <div className="selection-info">
                        <p className="text-blue-800 text-sm flex items-center gap-2">
                            <CheckSquare className="w-4 h-4" />
                            {selectedPedidos.length} pedido(s) seleccionado(s)
                            <button
                                onClick={() => setSelectedPedidos([])}
                                className="ml-2 text-blue-600 hover:text-blue-800 underline"
                            >
                                Limpiar selección
                            </button>
                        </p>
                    </div>
                )}
            </div>

            {/* Tabla de pedidos mejorada */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Pedidos de Todos los Usuarios ({paginacion.total})
                    </h3>
                </div>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="w-12">
                                    <button onClick={selectAllPedidos} className="hover:bg-gray-100 p-1 rounded">
                                        {selectedPedidos.length === pedidos.length && pedidos.length > 0 ? (
                                            <CheckSquare className="w-5 h-5 text-primary-600" />
                                        ) : (
                                            <Square className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                </th>
                                <th>Pedido</th>
                                <th>Cliente</th>
                                <th>Productos</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Tipo</th>
                                <th>Fase</th>
                                <th>Tiempo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos.map((pedido) => (
                                <tr key={pedido.id} className={selectedPedidos.includes(pedido.id) ? 'bg-blue-50 border-l-4 border-blue-400' : 'hover:bg-gray-50'}>
                                    <td>
                                        <button onClick={() => togglePedidoSelection(pedido.id)} className="hover:bg-gray-100 p-1 rounded">
                                            {selectedPedidos.includes(pedido.id) ? (
                                                <CheckSquare className="w-5 h-5 text-primary-600" />
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-400" />
                                            )}
                                        </button>
                                    </td>
                                    <td>
                                        <div className="font-medium text-secondary-900 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            #{pedido.numero_pedido}
                                        </div>
                                        <div className="text-sm text-secondary-500 flex items-center gap-1 mt-1">
                                            <CalendarIcon className="w-3 h-3" />
                                            {pedido.fecha_pedido}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 text-primary-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-secondary-900">
                                                    {pedido.cliente?.nombre || 'Sin nombre'}
                                                </div>
                                                <div className="text-sm text-secondary-500 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {pedido.cliente?.email || 'Sin email'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-sm">
                                            <div className="font-medium flex items-center gap-1">
                                                <ShoppingCart className="w-4 h-4 text-gray-400" />
                                                {pedido.total_productos || 0} producto(s)
                                            </div>
                                            <div className="text-secondary-500 mt-1">
                                                {pedido.estado_pago ? `Pago: ${pedido.estado_pago}` : 'N/A'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="font-medium text-secondary-900">
                                        <div className="text-lg font-bold">S/ {pedido.total_pago || '0.00'}</div>
                                    </td>
                                    <td>
                                        <div className="flex items-center space-x-2">
                                            <span className={`badge ${getEstadoClass(pedido.estado)}`}>
                                                {getEstadoIcon(pedido.estado)}
                                                {pedido.estado_formateado}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${pedido.tipo_entrega === 'delivery' ? 'badge-blue' : 'badge-green'}`}>
                                            {pedido.tipo_entrega === 'delivery' ? (
                                                <>
                                                    <Truck className="w-4 h-4" />
                                                    Delivery
                                                </>
                                            ) : (
                                                <>
                                                    <Package className="w-4 h-4" />
                                                    Recojo
                                                </>
                                            )}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-sm text-secondary-600 font-medium">
                                            {pedido.fase_actual || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="text-sm">
                                            <div className="text-secondary-600">
                                                {pedido.tiempo_transcurrido || 'N/A'}
                                            </div>
                                            <div className="text-xs text-secondary-500">
                                                {pedido.dias_desde_pedido || 0} días
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex space-x-2">
                                            <button
                                                className="action-btn hover:bg-blue-50 hover:text-blue-600"
                                                title="Ver detalles completos del pedido"
                                                onClick={() => mostrarDetallesPedido(pedido.id)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="action-btn hover:bg-green-50 hover:text-green-600"
                                                title="Ver información del cliente"
                                                onClick={() => mostrarDetalles(pedido.id)}
                                            >
                                                <Info className="w-4 h-4" />
                                            </button>
                                            {pedido.puede_cambiar_estado && (
                                                <div className="relative">
                                                    <select
                                                        value={pedido.estado}
                                                        onChange={(e) => actualizarEstado(pedido.id, e.target.value)}
                                                        className="text-xs form-select bg-white border-gray-300 hover:border-primary-400 focus:border-primary-500"
                                                    >
                                                        <option value={pedido.estado}>{pedido.estado_formateado}</option>
                                                        {pedido.siguientes_estados && pedido.siguientes_estados
                                                            .filter(estado => estado !== 'pedido_realizado') // Excluir pedido_realizado
                                                            .map(estado => (
                                                                <option key={estado} value={estado}>
                                                                    {estadosDisponibles.find(e => e.valor === estado)?.nombre || estado}
                                                                </option>
                                                            ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                <div className="pagination-container">
                    <div className="pagination-info">
                        Mostrando {((paginacion.page - 1) * paginacion.limit) + 1} a {Math.min(paginacion.page * paginacion.limit, paginacion.total)} de {paginacion.total} pedidos
                    </div>
                    <div className="pagination-controls">
                        <button
                            onClick={() => setPaginacion(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={paginacion.page === 1}
                            className="pagination-btn"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="pagination-current">
                            Página {paginacion.page} de {paginacion.totalPages}
                        </span>
                        <button
                            onClick={() => setPaginacion(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={paginacion.page === paginacion.totalPages}
                            className="pagination-btn"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de actualización por lotes mejorado */}
            {showBatchModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="flex items-center gap-2">
                                <Edit className="w-5 h-5" />
                                Actualizar {selectedPedidos.length} pedido(s) seleccionado(s)
                            </h3>
                            <button
                                onClick={() => setShowBatchModal(false)}
                                className="modal-close-btn"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="modal-body">
                            {(() => {
                                const validacion = validarSeleccionLote();
                                const estadosDisponiblesLote = getEstadosDisponiblesParaLote();
                                
                                if (!validacion.valid) {
                                    return (
                                        <div className="mb-4 p-4 bg-red-50 rounded-lg">
                                            <p className="text-red-800 text-sm font-medium flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4" />
                                                {validacion.message}
                                            </p>
                                        </div>
                                    );
                                }
                                
                                return (
                                    <>
                                        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                            <p className="text-blue-800 text-sm font-medium flex items-center gap-2">
                                                <CheckSquare className="w-4 h-4" />
                                                Se actualizarán {selectedPedidos.length} pedido(s) con estado actual: <strong>{validacion.estadoActual}</strong>
                                            </p>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label font-semibold">Nuevo estado *</label>
                                            <select
                                                value={batchNewState}
                                                onChange={(e) => setBatchNewState(e.target.value)}
                                                className="form-select w-full"
                                            >
                                                <option value="">Seleccionar estado</option>
                                                {estadosDisponiblesLote.map(estado => (
                                                    <option key={estado.valor} value={estado.valor}>
                                                        {estado.nombre} - {estado.fase}
                                                    </option>
                                                ))}
                                            </select>
                                            {estadosDisponiblesLote.length === 0 && (
                                                <p className="text-sm text-gray-500 mt-2">
                                                    No hay estados disponibles para la transición desde el estado actual.
                                                </p>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label font-semibold">Notas administrativas (opcional)</label>
                                            <textarea
                                                value={batchNotes}
                                                onChange={(e) => setBatchNotes(e.target.value)}
                                                className="form-input w-full"
                                                rows={4}
                                                placeholder="Agregar notas sobre el cambio de estado (se añadirán al historial del pedido)..."
                                            />
                                        </div>

                                        <div className="bg-yellow-50 p-4 rounded-lg">
                                            <p className="text-yellow-800 text-sm flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4" />
                                                <strong>Atención:</strong> Esta acción actualizará el estado de todos los pedidos seleccionados.
                                                Solo se aplicará a pedidos que permitan la transición al nuevo estado.
                                            </p>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                        <div className="modal-footer">
                            <button
                                onClick={() => setShowBatchModal(false)}
                                className="btn-secondary"
                            >
                                Cancelar
                            </button>
                            {(() => {
                                const validacion = validarSeleccionLote();
                                const estadosDisponiblesLote = getEstadosDisponiblesParaLote();
                                const isDisabled = !validacion.valid || !batchNewState || estadosDisponiblesLote.length === 0;
                                
                                return (
                                    <button
                                        onClick={actualizarEstadosLote}
                                        disabled={isDisabled}
                                        className={`btn-primary ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        Actualizar Estados
                                    </button>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de detalles del pedido - Diseño mejorado */}
            {showDetailsModal && selectedPedidoDetails && (
                <div className="modal-overlay">
                    <div className="modal-content max-w-6xl">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
                            <h3 className="text-2xl font-bold flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <FileText className="w-6 h-6" />
                                </div>
                                Detalles del Pedido #{selectedPedidoDetails.numero_pedido}
                            </h3>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Información del cliente */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <h4 className="text-xl font-semibold text-gray-800 flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <User className="w-5 h-5 text-blue-600" />
                                        </div>
                                        Información del Cliente
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-500 w-20">Nombre:</span>
                                            <span className="font-medium">{selectedPedidoDetails.cliente?.nombre || 'Sin nombre'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-500 w-20">Email:</span>
                                            <span className="font-medium">{selectedPedidoDetails.cliente?.email || 'Sin email'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-500 w-20">Teléfono:</span>
                                            <span className="font-medium">{selectedPedidoDetails.telefono_contacto || 'Sin teléfono'}</span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="text-sm text-gray-500 w-20">Dirección:</span>
                                            <span className="font-medium">{selectedPedidoDetails.direccion_entrega || 'Sin dirección'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Información del pedido */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <h4 className="text-xl font-semibold text-gray-800 flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <Package className="w-5 h-5 text-green-600" />
                                        </div>
                                        Información del Pedido
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-500 w-20">Fecha:</span>
                                            <span className="font-medium">{selectedPedidoDetails.fecha_pedido}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-500 w-20">Estado:</span>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                {selectedPedidoDetails.estado_formateado}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-500 w-20">Fase:</span>
                                            <span className="font-medium">{selectedPedidoDetails.fase_actual}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-500 w-20">Tipo:</span>
                                            <span className="font-medium">{selectedPedidoDetails.tipo_entrega === 'delivery' ? 'Delivery' : 'Recojo en tienda'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-500 w-20">Total:</span>
                                            <span className="text-xl font-bold text-green-600">S/ {selectedPedidoDetails.total_pago}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Productos del pedido */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <h4 className="text-xl font-semibold text-gray-800 flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <ShoppingCart className="w-5 h-5 text-purple-600" />
                                    </div>
                                    Productos del Pedido
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Producto</th>
                                                <th className="text-center py-3 px-4 font-semibold text-gray-700">Cantidad</th>
                                                <th className="text-right py-3 px-4 font-semibold text-gray-700">Precio Unit.</th>
                                                <th className="text-right py-3 px-4 font-semibold text-gray-700">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedPedidoDetails.items && selectedPedidoDetails.items.map((item, index) => (
                                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4 font-medium">{item.modelo || 'Sin modelo'}</td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                                            {item.cantidad || 0}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-medium">S/ {item.precio_unitario || '0.00'}</td>
                                                    <td className="py-3 px-4 text-right font-bold text-green-600">S/ {item.subtotal || '0.00'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Notas */}
                            {selectedPedidoDetails.notas && (
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mt-6">
                                    <h4 className="text-xl font-semibold text-gray-800 flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <FileText className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        Notas del Pedido
                                    </h4>
                                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                        <p className="whitespace-pre-wrap text-gray-700">{selectedPedidoDetails.notas}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Componente DetallePedido para mostrar detalles específicos */}
            <DetallePedido
                isOpen={showDetallePedido}
                pedidoId={selectedPedidoId}
                onClose={() => setShowDetallePedido(false)}
            />
        </div>
    );
};

export default PedidosAdmin;
