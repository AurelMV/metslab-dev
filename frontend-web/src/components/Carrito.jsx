import { useState } from 'react';
import { MdShoppingCart } from 'react-icons/md';
import {
    floatingButtonStyle,
    overlayStyle,
    asideStyle,
    headerStyle,
    closeButtonStyle,
    emptyCartStyle,
    scrollContainerStyle,
    productStyle,
    imgStyle,
    nameTextStyle,
    priceTextStyle,
    qtyWrapperStyle,
    qtyButtonStyle,
    totalPriceStyle,
    deleteButtonStyle,
    footerStyle,
    subtotalStyle,
    checkoutButtonStyle,
} from '../estilos/carrito';

export default function CarritoToggle() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [items, setItems] = useState([
        {
            id: 1,
            name: 'Camiseta de Algodón',
            price: 50.0,
            qty: 1,
            image: 'https://via.placeholder.com/56',
        },
        {
            id: 2,
            name: 'Pantalón Deportivo',
            price: 75.0,
            qty: 1,
            image: 'https://via.placeholder.com/56',
        },
    ]);

    const handleQty = (id, delta) => {
        setItems((items) =>
            items.map((item) =>
                item.id === id
                    ? { ...item, qty: Math.max(1, item.qty + delta) }
                    : item
            )
        );
    };

    const handleRemove = (id) => {
        setItems((items) => items.filter((item) => item.id !== id));
    };

    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    return (
        <>
            {!isCartOpen && (
                <button onClick={toggleCart} style={floatingButtonStyle}>
                    <MdShoppingCart />
                </button>
            )}

            {isCartOpen && (
                <div onClick={toggleCart} style={overlayStyle}>
                    <aside onClick={(e) => e.stopPropagation()} style={asideStyle}>
                        <div style={headerStyle}>
                            <h2 style={{ color: '#FF9900' }}>
                                Carrito ({items.reduce((a, b) => a + b.qty, 0)} items)
                            </h2>
                            <button onClick={toggleCart} style={closeButtonStyle}>×</button>
                        </div>

                        <div style={scrollContainerStyle}>
                            {items.length === 0 ? (
                                <p style={emptyCartStyle}>Tu carrito está vacío.</p>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} style={productStyle}>
                                        <img src={item.image} alt={item.name} style={imgStyle} />
                                        <div style={{ flex: 1 }}>
                                            <p style={nameTextStyle}>{item.name}</p>
                                            <p style={priceTextStyle}>S/.{item.price}</p>
                                            <div style={qtyWrapperStyle}>
                                                <button onClick={() => handleQty(item.id, -1)} style={qtyButtonStyle}>-</button>
                                                <span>{item.qty}</span>
                                                <button onClick={() => handleQty(item.id, 1)} style={qtyButtonStyle}>+</button>
                                            </div>
                                        </div>
                                        <div style={totalPriceStyle}>
                                            S/.{(item.price * item.qty).toLocaleString()}
                                        </div>
                                        <button onClick={() => handleRemove(item.id)} style={deleteButtonStyle}>🗑️</button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={footerStyle}>
                            <div style={subtotalStyle}>
                                <span>Subtotal</span>
                                <span>S/.{subtotal.toLocaleString()}</span>
                            </div>
                            <button style={checkoutButtonStyle}>Ver carrito</button>
                        </div>
                    </aside>
                </div>
            )}
        </>
    );
}
