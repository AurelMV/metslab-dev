import React, { useState, useEffect } from 'react';
import '../stayle/PedidosAdmin.css';
import DetallePedido from './DetallePedido';
import {
    obtenerPedidos,
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
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [estadosDisponibles, setEstadosDisponibles] = useState([]);
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [batchNewState, setBatchNewState] = useState('');
    const [batchNotes, setBatchNotes] = useState('');

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
                return 'bg-yellow-100 text-yellow-800';
            case 'capturado':
            case 'pago_confirmado':
            case 'en_preparacion':
                return 'bg-blue-100 text-blue-800';
            case 'en_camino':
            case 'en_transito':
            case 'en_reparto':
                return 'bg-purple-100 text-purple-800';
            case 'entregado':
            case 'completado':
                return 'bg-green-100 text-green-800';
            case 'retrasado':
            case 'intento_entrega':
                return 'bg-orange-100 text-orange-800';
            case 'perdido':
                return 'bg-red-100 text-red-800';
            case 'pendiente_recogida':
                return 'bg-blue-100 text-blue-800';
            case 'devuelto':
                return 'bg-orange-100 text-orange-800';
            case 'cancelado':
            case 'rechazado':
                return 'bg-red-100 text-red-800';
            case 'archivado':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                                />
                            </div>
                        </div>

                        {/* Filtro por estado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <select
                                value={filtros.estado}
                                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Todos los tipos</option>
                                <option value="delivery">Delivery</option>
                                <option value="pickup">Recojo en tienda</option>
                            </select>
                        </div>

                        {/* Filtro de fechas en la misma fila */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
                            <input
                                type="date"
                                value={filtros.fecha_desde}
                                onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
                            <input
                                type="date"
                                value={filtros.fecha_hasta}
                                onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        {/* Botón de actualización por lotes */}
                        {selectedPedidos.length > 0 && (
                            <button
                                onClick={() => setShowBatchModal(true)}
                                className="btn-primary flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <Edit className="w-4 h-4" />
                                Actualizar {selectedPedidos.length} pedido(s)
                            </button>
                        )}
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

            {/* Tabla de pedidos con Tailwind CSS */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Pedidos de Todos los Usuarios ({paginacion.total})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                    <button onClick={selectAllPedidos} className="hover:bg-gray-100 p-1 rounded">
                                        {selectedPedidos.length === pedidos.length && pedidos.length > 0 ? (
                                            <CheckSquare className="w-5 h-5 text-blue-600" />
                                        ) : (
                                            <Square className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pedido
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cliente
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Productos
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fase
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tiempo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pedidos.map((pedido) => (
                                <tr key={pedido.id} className={`hover:bg-gray-50 ${selectedPedidos.includes(pedido.id) ? 'bg-blue-50 border-l-4 border-blue-400' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button onClick={() => togglePedidoSelection(pedido.id)} className="hover:bg-gray-100 p-1 rounded">
                                            {selectedPedidos.includes(pedido.id) ? (
                                                <CheckSquare className="w-5 h-5 text-blue-600" />
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-400" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            #{pedido.numero_pedido}
                                        </div>
                                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                            <CalendarIcon className="w-3 h-3" />
                                            {pedido.fecha_pedido}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {pedido.cliente?.nombre || 'Sin nombre'}
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {pedido.cliente?.email || 'Sin email'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm">
                                            <div className="font-medium flex items-center gap-1">
                                                <ShoppingCart className="w-4 h-4 text-gray-400" />
                                                {pedido.total_productos || 0} producto(s)
                                            </div>
                                            <div className="text-gray-500 mt-1">
                                                {pedido.estado_pago ? `Pago: ${pedido.estado_pago}` : 'N/A'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-lg font-bold text-gray-900">S/ {pedido.total_pago || '0.00'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1 ${getEstadoClass(pedido.estado)}`}>
                                            {getEstadoIcon(pedido.estado)}
                                            {pedido.estado_formateado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1 ${pedido.tipo_entrega === 'delivery' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                            {pedido.tipo_entrega === 'delivery' ? (
                                                <>
                                                    <Truck className="w-3 h-3" />
                                                    Delivery
                                                </>
                                            ) : (
                                                <>
                                                    <Package className="w-3 h-3" />
                                                    Recojo
                                                </>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-600 font-medium">
                                            {pedido.fase_actual || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm">
                                            <div className="text-gray-600">
                                                {pedido.tiempo_transcurrido || 'N/A'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {pedido.dias_desde_pedido || 0} días
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                className="p-1 rounded-full hover:bg-blue-50 hover:text-blue-600 text-gray-400"
                                                title="Detalles del pedido"
                                                onClick={() => mostrarDetallesPedido(pedido.id)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {pedido.puede_cambiar_estado && (
                                                <div className="relative">
                                                    <select
                                                        value={pedido.estado}
                                                        onChange={(e) => actualizarEstado(pedido.id, e.target.value)}
                                                        className="text-xs px-2 py-1 border border-gray-300 rounded-md bg-white hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    >
                                                        <option value={pedido.estado}>{pedido.estado_formateado}</option>
                                                        {pedido.siguientes_estados && pedido.siguientes_estados
                                                            .filter(estado => estado !== 'pedido_realizado')
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

                {/* Paginación con Tailwind CSS */}
                <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setPaginacion(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={paginacion.page === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setPaginacion(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={paginacion.page === paginacion.totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Mostrando <span className="font-medium">{((paginacion.page - 1) * paginacion.limit) + 1}</span> a{' '}
                                <span className="font-medium">{Math.min(paginacion.page * paginacion.limit, paginacion.total)}</span> de{' '}
                                <span className="font-medium">{paginacion.total}</span> pedidos
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setPaginacion(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={paginacion.page === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                    Página {paginacion.page} de {paginacion.totalPages}
                                </span>
                                <button
                                    onClick={() => setPaginacion(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={paginacion.page === paginacion.totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de actualización por lotes mejorado */}
            {showBatchModal && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowBatchModal(false);
                        }
                    }}
                >
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Edit className="w-5 h-5 text-blue-600" />
                                Actualizar {selectedPedidos.length} pedido(s) seleccionado(s)
                            </h3>
                            <button
                                onClick={() => setShowBatchModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6">
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

                                        <div className="mb-4">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nuevo estado *</label>
                                            <select
                                                value={batchNewState}
                                                onChange={(e) => setBatchNewState(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                                        <div className="mb-4">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Notas administrativas (opcional)</label>
                                            <textarea
                                                value={batchNotes}
                                                onChange={(e) => setBatchNotes(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={() => setShowBatchModal(false)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
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
                                        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 ${isDisabled ? 'opacity-50 cursor-not-allowed hover:bg-blue-600' : ''}`}
                                    >
                                        <Check className="w-4 h-4" />
                                        Actualizar Estados
                                    </button>
                                );
                            })()}
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
