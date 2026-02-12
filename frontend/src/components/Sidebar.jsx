import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { FiGrid, FiFileText, FiGitBranch, FiShield, FiCpu, FiUsers, FiLogOut, FiWifi, FiWifiOff } from 'react-icons/fi';

const Sidebar = () => {
    const { user, logout, hasRole } = useAuth();
    const { connected } = useSocket();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">🛡️</div>
                    <div>
                        <h1>ComplianceAI</h1>
                        <span>{user?.organization?.name}</span>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section-title">Main</div>
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <FiGrid /> Dashboard
                </NavLink>
                <NavLink to="/issues" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <FiFileText /> Issues
                </NavLink>

                {hasRole('Admin', 'Manager') && (
                    <>
                        <div className="nav-section-title">Management</div>
                        <NavLink to="/workflows" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <FiGitBranch /> Workflows
                        </NavLink>
                        <NavLink to="/audit" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <FiShield /> Audit Logs
                        </NavLink>
                        <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <FiUsers /> Users
                        </NavLink>
                    </>
                )}

                <div className="nav-section-title">AI Tools</div>
                <NavLink to="/issues" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <FiCpu /> AI Summaries
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <div 
                    className="user-info"
                    onClick={() => navigate('/profile')}
                >
                    <div className="user-avatar">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details" style={{ flex: 1 }}>
                        <h4>{user?.name}</h4>
                        <span>{user?.role}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {connected ? (
                            <FiWifi style={{ color: 'var(--success)', fontSize: '14px' }} title="Real-time connected" />
                        ) : (
                            <FiWifiOff style={{ color: 'var(--danger)', fontSize: '14px' }} title="Disconnected" />
                        )}
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="btn btn-danger"
                    style={{ width: '100%', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    <FiLogOut size={14} /> Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
