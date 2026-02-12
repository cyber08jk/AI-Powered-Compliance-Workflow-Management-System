import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueService, authService, workflowService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getStatusBadgeClass, getPriorityBadgeClass, formatDate } from '../utils/helpers';
import useSLACountdown from '../hooks/useSLACountdown';
import { FiPlus, FiSearch, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

const SLABadge = ({ dueDate, slaBreached }) => {
    const { timeLeft, status } = useSLACountdown(dueDate, slaBreached);
    return (
        <span className={`sla-countdown ${status}`}>
            <FiClock size={12} /> {timeLeft}
        </span>
    );
};

const IssuesPage = () => {
    const [issues, setIssues] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [workflows, setWorkflows] = useState([]);
    const [filters, setFilters] = useState({
        status: '', category: '', priority: '', search: '', page: 1,
    });
    const [form, setForm] = useState({
        title: '', description: '', category: 'Quality', priority: 'Medium', assignedTo: '', dueDate: '',
    });
    const { hasRole } = useAuth();
    const navigate = useNavigate();

    const fetchIssues = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
            const res = await issueService.getAll(params);
            setIssues(res.data.data);
            setPagination(res.data.pagination);
        } catch {
            toast.error('Failed to load issues');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { fetchIssues(); }, [fetchIssues]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [usersRes, wfRes] = await Promise.all([authService.getUsers(), workflowService.getAll()]);
                setUsers(usersRes.data.data || []);
                setWorkflows(wfRes.data.data || []);
            } catch {
                // Users/workflows not accessible for all roles
            }
        };
        loadData();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await issueService.create(form);
            toast.success('Issue created');
            setShowModal(false);
            setForm({ title: '', description: '', category: 'Quality', priority: 'Medium', assignedTo: '', dueDate: '' });
            fetchIssues();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create issue');
        }
    };

    const statuses = workflows.length > 0 && workflows[0].states ? workflows[0].states : ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Closed'];

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>Issues</h2>
                    <p>Manage and track all compliance issues</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <FiPlus size={16} /> Create Issue
                </button>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search issues..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                />
                <select className="form-control" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}>
                    <option value="">All Statuses</option>
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="form-control" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}>
                    <option value="">All Categories</option>
                    {['Quality', 'Safety', 'Regulatory', 'Environmental', 'Operational', 'Other'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="form-control" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}>
                    <option value="">All Priorities</option>
                    {['Critical', 'High', 'Medium', 'Low'].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            {/* Issues Table */}
            {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
            ) : issues.length === 0 ? (
                <div className="card empty-state">
                    <h3>No Issues Found</h3>
                    <p>Create your first compliance issue to get started.</p>
                </div>
            ) : (
                <>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>Category</th>
                                    <th>Assigned To</th>
                                    <th>SLA</th>
                                    <th>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {issues.map((issue) => (
                                    <tr key={issue._id} onClick={() => navigate(`/issues/${issue._id}`)} style={{ cursor: 'pointer' }}>
                                        <td style={{ fontWeight: '500' }}>{issue.title}</td>
                                        <td><span className={`badge ${getStatusBadgeClass(issue.status)}`}>{issue.status}</span></td>
                                        <td><span className={`badge ${getPriorityBadgeClass(issue.priority)}`}>{issue.priority}</span></td>
                                        <td style={{ fontSize: '12px' }}>{issue.category}</td>
                                        <td style={{ fontSize: '12px' }}>{issue.assignedTo?.name || 'Unassigned'}</td>
                                        <td><SLABadge dueDate={issue.dueDate} slaBreached={issue.slaBreached} /></td>
                                        <td style={{ fontSize: '12px', color: '#7f8c8d' }}>{formatDate(issue.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px', padding: '15px', background: 'white', borderRadius: '6px', border: '1px solid #ecf0f1' }}>
                            <button className="btn btn-secondary" disabled={pagination.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>Previous</button>
                            <span style={{ color: '#7f8c8d', fontSize: '12px' }}>Page {pagination.page} of {pagination.totalPages}</span>
                            <button className="btn btn-secondary" disabled={pagination.page >= pagination.totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next</button>
                        </div>
                    )}
                </>
            )}

            {/* Create Issue Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Issue" size="lg">
                <form onSubmit={handleCreate}>
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Enter issue title" />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required style={{ minHeight: '100px', resize: 'vertical' }} placeholder="Describe the issue..." />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label>Category</label>
                            <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                {['Quality', 'Safety', 'Regulatory', 'Environmental', 'Operational', 'Other'].map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Priority</label>
                            <select className="form-control" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                                {['Critical', 'High', 'Medium', 'Low'].map((p) => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label>Assign To</label>
                            <select className="form-control" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                                <option value="">Unassigned</option>
                                {users.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Due Date</label>
                            <input type="date" className="form-control" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Create Issue</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default IssuesPage;
