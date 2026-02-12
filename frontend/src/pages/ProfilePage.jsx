import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiShield, FiBriefcase, FiLogOut, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const handleBack = () => {
        navigate('/dashboard');
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>My Profile</h2>
                    <p>Manage your account information</p>
                </div>
                <button className="btn btn-secondary" onClick={handleBack}>
                    <FiArrowLeft size={16} /> Back
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                {/* Profile Card */}
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #ecf0f1' }}>
                        <div className="user-avatar" style={{ width: '80px', height: '80px', fontSize: '28px' }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700', color: '#2c3e50' }}>
                                {user?.name}
                            </h3>
                            <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>
                                {user?.role} • {user?.organization?.name}
                            </p>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                        {/* Email */}
                        <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #ecf0f1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <FiMail size={18} style={{ color: '#3498db' }} />
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.3px', margin: 0 }}>
                                    Email Address
                                </label>
                            </div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                                {user?.email}
                            </p>
                        </div>

                        {/* Role */}
                        <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #ecf0f1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <FiShield size={18} style={{ color: '#27ae60' }} />
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.3px', margin: 0 }}>
                                    Role
                                </label>
                            </div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                                {user?.role}
                            </p>
                        </div>

                        {/* Organization */}
                        <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #ecf0f1', gridColumn: '1 / -1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <FiBriefcase size={18} style={{ color: '#e74c3c' }} />
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.3px', margin: 0 }}>
                                    Organization
                                </label>
                            </div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                                {user?.organization?.name}
                            </p>
                        </div>

                        {/* Active Status */}
                        <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #ecf0f1' }}>
                            <label style={{ fontSize: '12px', fontWeight: '700', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block', marginBottom: '8px' }}>
                                Status
                            </label>
                            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: user?.isActive ? '#27ae60' : '#e74c3c' }}></span>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                                    {user?.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </p>
                        </div>

                        {/* Member Since */}
                        <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #ecf0f1' }}>
                            <label style={{ fontSize: '12px', fontWeight: '700', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block', marginBottom: '8px' }}>
                                Member Since
                            </label>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                                {new Date(user?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions Card */}
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#2c3e50' }}>
                        Account Actions
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button 
                            onClick={handleLogout}
                            className="btn btn-danger"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <FiLogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
