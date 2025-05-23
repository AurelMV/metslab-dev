export const floatingButtonStyle = {
    position: 'fixed',
    bottom: 20,
    right: 20,
    borderRadius: '50%',
    width: 60,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 30,
    backgroundColor: '#FF9900',
    color: '#000',
    border: 'none',
    cursor: 'pointer',
    zIndex: 999,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
};

export const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 998,
};

export const asideStyle = {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '350px',
    maxWidth: '90vw',
    height: '100%',
    backgroundColor: '#FAF0E6',
    padding: '1rem',
    zIndex: 999,
    boxShadow: '-2px 0 16px rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'column',
};

export const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #FFD700',
    paddingBottom: '0.5rem',
};

export const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: 24,
    color: '#000',
    cursor: 'pointer',
};

export const scrollContainerStyle = {
    flex: 1,
    overflowY: 'auto',
    marginTop: '1rem',
};

export const emptyCartStyle = {
    textAlign: 'center',
};

export const productStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '1rem 0',
    borderBottom: '1px solid #eee',
};

export const imgStyle = {
    width: 56,
    height: 56,
    objectFit: 'contain',
    borderRadius: 8,
    background: '#fff',
    border: '1px solid #FFD700',
};

export const nameTextStyle = {
    fontWeight: '600',
    margin: 0,
    color: '#000',
};

export const priceTextStyle = {
    margin: 0,
    color: '#FF9900',
    fontWeight: '500',
};

export const qtyWrapperStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
};

export const qtyButtonStyle = {
    width: 28,
    height: 28,
    borderRadius: 4,
    background: '#FFD700',
    border: 'none',
    fontWeight: 700,
    cursor: 'pointer',
};

export const totalPriceStyle = {
    fontWeight: 600,
    color: '#000',
    textAlign: 'right',
    minWidth: 70,
};

export const deleteButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: 18,
    color: '#FF9900',
    marginLeft: 8,
    cursor: 'pointer',
};

export const footerStyle = {
    borderTop: '1px solid #FFD700',
    paddingTop: '1rem',
};

export const subtotalStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 700,
    fontSize: 18,
    marginBottom: 12,
};

export const checkoutButtonStyle = {
    width: '100%',
    padding: '12px 0',
    background: 'linear-gradient(90deg, #FF9900, #FFD700)',
    color: '#000',
    fontWeight: 700,
    fontSize: 16,
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
};
