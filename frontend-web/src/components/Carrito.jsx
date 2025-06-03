import { MdShoppingCart } from 'react-icons/md';
import { useCarrito } from '../context/CarritoContext';
import {
    floatingButtonStyle,
    overlayStyle,
    asideStyle,
    headerStyle,
    closeButtonStyle,
    emptyCartStyle,
    scrollContainerStyle,
    productStyle,
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
    const { isCartOpen, items, handleQty, handleRemove, subtotal, toggleCart } = useCarrito();

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

                        <div style={scrollContainerStyle}>                            {items.length === 0 ? (
                                <p style={emptyCartStyle}>Tu carrito está vacío.</p>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} style={productStyle}>                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            border: '1px solid #FFD700',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: '#fff',
                                        }}>
                                            <img 
                                                src={item.image } 
                                                alt={item.name} 
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '100%',
                                                    objectFit: 'contain',
                                                    display: 'block'
                                                }} 
                                                onError={(e) => {
                                                    console.log('Error al cargar imagen:', item.image);
                                                    e.target.src = 'https://via.placeholder.com/56';
                                                }}
                                            />
                                        </div>

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
