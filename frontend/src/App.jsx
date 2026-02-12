import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import IssuesPage from './pages/IssuesPage';
import IssueDetailPage from './pages/IssueDetailPage';
import WorkflowsPage from './pages/WorkflowsPage';
import AuditLogPage from './pages/AuditLogPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';

function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: '100vh' }}>
                <div className="spinner"></div>
                <p className="text-muted">Loading Compliance System...</p>
            </div>
        );
    }

    return (
        <div>
            {user ? (
                <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                        <Routes>
                            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                            <Route path="/issues" element={<ProtectedRoute><IssuesPage /></ProtectedRoute>} />
                            <Route path="/issues/:id" element={<ProtectedRoute><IssueDetailPage /></ProtectedRoute>} />
                            <Route path="/workflows" element={<ProtectedRoute roles={['Admin', 'Manager']}><WorkflowsPage /></ProtectedRoute>} />
                            <Route path="/audit" element={<ProtectedRoute roles={['Admin', 'Manager']}><AuditLogPage /></ProtectedRoute>} />
                            <Route path="/users" element={<ProtectedRoute roles={['Admin', 'Manager']}><UsersPage /></ProtectedRoute>} />
                            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </main>
                </div>
            ) : (
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            )}
        </div>
    );
}

export default App;
