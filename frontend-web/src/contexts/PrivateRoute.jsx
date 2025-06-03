import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: "linear-gradient(135deg, #667eea, #764ba2)"
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            margin: '0 auto 15px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #5A67D8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
