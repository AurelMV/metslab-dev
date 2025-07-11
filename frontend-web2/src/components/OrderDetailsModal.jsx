import React from "react";
import {
    X,
    Package,
    Calendar,
    CreditCard,
    MapPin,
    Truck,
    CheckCircle,
    Clock,
    AlertCircle
} from "lucide-react";
import "../stayle/OrderDetails.css";

export function OrderDetailsModal({ isOpen, onClose, orderDetails }) {
    if (!isOpen || !orderDetails) return null;

    const { pedido, pago, direccion_entrega, productos, resumen_financiero, seguimiento } = orderDetails;

    const getStatusIcon = (estado) => {
        switch (estado) {
            case 'entregado':
                return <CheckCircle className="status-icon delivered" />;
            case 'enviado':
                return <Truck className="status-icon shipped" />;
            case 'en_proceso':
                return <Package className="status-icon processing" />;
            case 'pagado':
                return <CreditCard className="status-icon paid" />;
            case 'pendiente':
                return <Clock className="status-icon pending" />;
            default:
                return <AlertCircle className="status-icon default" />;
        }
    };

    const getProgressWidth = (progreso) => {
        return `${progreso}%`;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-section">
                        <h2 className="modal-title">Detalles del Pedido</h2>
                        <span className="order-number">#{pedido.numero_pedido}</span>
                    </div>
                    <button className="modal-close-button" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Estado y Progreso */}
                    <div className="status-section">
                        <div className="status-header">
                            {getStatusIcon(pedido.estado)}
                            <div className="status-text">
                                <h3>{pedido.estado_formateado}</h3>
                                <p>{seguimiento.proximo_paso}</p>
                            </div>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: getProgressWidth(seguimiento.progreso) }}
                            ></div>
                        </div>
                        <div className="progress-text">{seguimiento.progreso}% completado</div>
                    </div>

                    {/* Timeline de Estados */}
                    <div className="timeline-section">
                        <h4>Seguimiento del Pedido</h4>
                        <div className="timeline">
                            {Object.entries(seguimiento.timeline).map(([key, step]) => (
                                <div key={key} className={`timeline-item ${step.completado ? 'completed' : 'pending'}`}>
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                        <h5>{step.nombre}</h5>
                                        <p>{step.descripcion}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Información del Pedido */}
                    <div className="order-info-grid">
                        <div className="info-card">
                            <div className="info-header">
                                <Calendar className="info-icon" />
                                <h4>Información del Pedido</h4>
                            </div>
                            <div className="info-content">
                                <div className="info-row">
                                    <span>Fecha del Pedido:</span>
                                    <span>{pedido.fecha_pedido}</span>
                                </div>
                                <div className="info-row">
                                    <span>Entrega Estimada:</span>
                                    <span>{pedido.fecha_entrega_estimada || 'Por confirmar'}</span>
                                </div>
                                <div className="info-row">
                                    <span>Tipo de Pedido:</span>
                                    <span>{pedido.tipo_pedido}</span>
                                </div>
                            </div>
                        </div>

                        {pago && (
                            <div className="info-card">
                                <div className="info-header">
                                    <CreditCard className="info-icon" />
                                    <h4>Información de Pago</h4>
                                </div>
                                <div className="info-content">
                                    <div className="info-row">
                                        <span>Estado:</span>
                                        <span className={`payment-status ${pago.estado}`}>{pago.estado_formateado}</span>
                                    </div>
                                    <div className="info-row">
                                        <span>Método:</span>
                                        <span>{pago.metodo_pago}</span>
                                    </div>
                                    <div className="info-row">
                                        <span>Monto:</span>
                                        <span>S/ {pago.monto}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {direccion_entrega && (
                            <div className="info-card">
                                <div className="info-header">
                                    <MapPin className="info-icon" />
                                    <h4>Dirección de Entrega</h4>
                                </div>
                                <div className="info-content">
                                    <div className="address-info">
                                        <p className="destinatario">{direccion_entrega.destinatario}</p>
                                        <p className="direccion">{direccion_entrega.direccion_completa}</p>
                                        <p className="ubicacion">
                                            {direccion_entrega.distrito}, {direccion_entrega.provincia}, {direccion_entrega.departamento}
                                        </p>
                                        {direccion_entrega.telefono && (
                                            <p className="telefono">Tel: {direccion_entrega.telefono}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Lista de Productos */}
                    <div className="products-section">
                        <h4>Productos Ordenados</h4>
                        <div className="products-list">
                            {productos.map((producto) => (
                                <div key={producto.id} className="product-item">
                                    {producto.modelo_info?.imagen && (
                                        <div className="product-image">
                                            <img src={producto.modelo_info.imagen} alt={producto.nombre} />
                                        </div>
                                    )}
                                    <div className="product-details">
                                        <h5>{producto.nombre}</h5>
                                        {producto.modelo_info?.descripcion && (
                                            <p className="product-description">{producto.modelo_info.descripcion}</p>
                                        )}
                                        <div className="product-quantity-price">
                                            <span className="quantity">Cantidad: {producto.cantidad}</span>
                                            <span className="price">S/ {producto.precio_unitario} c/u</span>
                                        </div>
                                    </div>
                                    <div className="product-total">
                                        <span>S/ {producto.precio_total}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resumen Financiero */}
                    <div className="financial-summary">
                        <h4>Resumen del Pedido</h4>
                        <div className="summary-details">
                            <div className="summary-row">
                                <span>Subtotal:</span>
                                <span>S/ {resumen_financiero.subtotal}</span>
                            </div>
                            {resumen_financiero.costo_envio > 0 && (
                                <div className="summary-row">
                                    <span>Costo de Envío:</span>
                                    <span>S/ {resumen_financiero.costo_envio}</span>
                                </div>
                            )}
                            <div className="summary-row total">
                                <span>Total:</span>
                                <span>S/ {resumen_financiero.total_final}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderDetailsModal;
