import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Trash, X } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import "../stayle/MiniCart.css";

export function MiniCart() {
    const { items, removeFromCart, updateQuantity, clearCart, total, itemCount } = useCart();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const miniCartRef = useRef(null);

    // Cerrar el minicart cuando se hace clic fuera de él
    useEffect(() => {
        function handleClickOutside(event) {
            if (miniCartRef.current && !miniCartRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [miniCartRef]);

    const toggleCart = () => {
        setIsOpen(!isOpen);
    };

    const handleGoToCart = () => {
        setIsOpen(false);
        navigate("/cart");
    };

    return (
        <div className="mini-cart-container" ref={miniCartRef}>
            <button
                className="mini-cart-button"
                onClick={toggleCart}
                aria-label="Carrito de compras"
            >
                <ShoppingCart size={20} />
                {itemCount > 0 && <span className="mini-cart-badge">{itemCount}</span>}
            </button>

            {isOpen && (
                <div className="mini-cart-popup">
                    <div className="mini-cart-header">
                        <h3>Tu Carrito</h3>
                        <button className="mini-cart-close" onClick={() => setIsOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className="mini-cart-items">
                        {items.length === 0 ? (
                            <div className="mini-cart-empty">
                                <p>Tu carrito está vacío</p>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div
                                    key={`${item.model.id}-${item.selectedColor?.id || "default"}`}
                                    className="mini-cart-item"
                                >
                                    <div className="mini-cart-item-image">
                                        <img
                                            src={item.model.image}
                                            alt={item.model.name}
                                            onError={(e) => {
                                                e.target.src = "/placeholder.png";
                                            }}
                                        />
                                    </div>
                                    <div className="mini-cart-item-details">
                                        <h4>{item.model.name}</h4>
                                        <p className="mini-cart-item-price">
                                            S/ {item.model.price.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="mini-cart-item-actions">
                                        <div className="mini-cart-quantity-controls">
                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.model.id,
                                                        item.selectedColor?.id || 1,
                                                        item.quantity - 1
                                                    )
                                                }
                                                className="mini-cart-quantity-button"
                                                aria-label="Disminuir cantidad"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="mini-cart-quantity">{item.quantity}</span>
                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.model.id,
                                                        item.selectedColor?.id || 1,
                                                        item.quantity + 1
                                                    )
                                                }
                                                className="mini-cart-quantity-button"
                                                aria-label="Aumentar cantidad"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() =>
                                                removeFromCart(
                                                    item.model.id,
                                                    item.selectedColor?.id || 1
                                                )
                                            }
                                            className="mini-cart-remove-button"
                                            aria-label="Eliminar producto"
                                        >
                                            <Trash size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {items.length > 0 && (
                        <>
                            <div className="mini-cart-footer">
                                <div className="mini-cart-total">
                                    <span>Total:</span>
                                    <span>S/ {total.toFixed(2)}</span>
                                </div>
                                <div className="mini-cart-actions">
                                    <button
                                        className="mini-cart-clear"
                                        onClick={clearCart}
                                    >
                                        Vaciar Carrito
                                    </button>
                                    <button
                                        className="mini-cart-checkout"
                                        onClick={handleGoToCart}
                                    >
                                        Ver Detalles
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default MiniCart;
