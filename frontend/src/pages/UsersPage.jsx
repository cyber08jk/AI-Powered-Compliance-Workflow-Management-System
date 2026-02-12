import { useState, useEffect } from 'react';
import { authService } from '../services/api';
import { FiPlus, FiUsers } from 'react-icons/fi';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'User' });

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const res = await authService.getUsers();
            setUsers(res.data.data);
        } catch {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await authService.createUser(form);
            toast.success('User created');
            setShowModal(false);
            setForm({ name: '', email: '', password: '', role: 'User' });
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create user');
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>User Management</h2>
                    <p>Manage team members and their roles</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <FiPlus /> Add User
                </button>
            </div>

            {users.length === 0 ? (
                <div className="card empty-state">
                    <FiUsers style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }} />
                    <h3>No Users</h3>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id}>
                                    <td style={{ fontWeight: '500' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                                                {u.name?.charAt(0).toUpperCase()}
                                            </div>
                                            {u.name}
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{u.email}</td>
                                    <td>
                                        <span className={`badge ${u.role === 'Admin' ? 'badge-critical' :
                                                u.role === 'Manager' ? 'badge-high' :
                                                    u.role === 'Reviewer' ? 'badge-medium' : 'badge-low'
                                            }`}>{u.role}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${u.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                                            {u.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create User Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New User" size="md">
                <form onSubmit={handleCreate}>
                    <div className="form-group">
                        <label>Full Name *</label>
                        <input type="text" className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Enter full name" />
                    </div>
                    <div className="form-group">
                        <label>Email *</label>
                        <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="Enter email address" />
                    </div>
                    <div className="form-group">
                        <label>Password *</label>
                        <input type="password" className="form-control" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} placeholder="Minimum 6 characters" />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <select className="form-control" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="Reviewer">Reviewer</option>
                            <option value="User">User</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Create User</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default UsersPage;
