import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p className="text-muted">Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return (
            <div className="main-content">
                <div className="card text-center" style={{ padding: '60px' }}>
                    <h2 style={{ color: 'var(--danger)', marginBottom: '12px' }}>Access Denied</h2>
                    <p className="text-muted">You don't have permission to access this page.</p>
                    <p className="text-sm text-muted" style={{ marginTop: '8px' }}>
                        Required role: {roles.join(', ')}
                    </p>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
